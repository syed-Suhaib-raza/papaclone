import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

const NULL_UUID = "00000000-0000-0000-0000-000000000000"

function pctChange(curr: number, prev: number): string {
  if (prev === 0) return curr > 0 ? "+100%" : "0%"
  const p = ((curr - prev) / prev) * 100
  return (p >= 0 ? "+" : "") + p.toFixed(1) + "%"
}

function avgDeliveryMinutes(rows: { accepted_at: string; delivery_time: string }[]): number | null {
  const times = rows
    .map(d => (new Date(d.delivery_time).getTime() - new Date(d.accepted_at).getTime()) / 60000)
    .filter(t => t > 0 && t < 180)
  return times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null
}

function formatPKR(n: number) {
  if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)     return `PKR ${(n / 1_000).toFixed(1)}K`
  return `PKR ${n.toFixed(0)}`
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const range = searchParams.get("range") ?? "30d"

    const rangeMap: Record<string, number> = { "24h": 1, "7d": 7, "30d": 30, "90d": 90 }
    const days = rangeMap[range] ?? 30
    const now = new Date()
    const startDate = new Date(now.getTime() - days * 86_400_000)
    const prevStartDate = new Date(startDate.getTime() - days * 86_400_000)
    const startISO     = startDate.toISOString()
    const prevStartISO = prevStartDate.toISOString()

    // ── Current period orders (full join for category breakdown) ──────────
    const { data: orders, error: oErr } = await supabase
      .from("orders")
      .select(`
        id, total_amount, created_at, customer_id, status,
        order_items ( quantity, menu_items ( category_id, categories ( name ) ) )
      `)
      .gte("created_at", startISO)
      .order("created_at", { ascending: true })

    if (oErr) throw oErr
    const safeOrders = orders ?? []

    // ── Previous period orders (lightweight — for comparison only) ────────
    const { data: prevOrders } = await supabase
      .from("orders")
      .select("id, total_amount, customer_id, status")
      .gte("created_at", prevStartISO)
      .lt("created_at", startISO)

    const safePrev = prevOrders ?? []

    // ── Deliveries for avg delivery time ─────────────────────────────────
    const orderIds     = safeOrders.map(o => o.id)
    const prevOrderIds = safePrev.map(o => o.id)

    const [{ data: deliveries }, { data: prevDeliveries }] = await Promise.all([
      supabase
        .from("deliveries")
        .select("accepted_at, delivery_time")
        .eq("status", "delivered")
        .in("order_id", orderIds.length     ? orderIds     : [NULL_UUID])
        .not("accepted_at",    "is", null)
        .not("delivery_time",  "is", null),
      supabase
        .from("deliveries")
        .select("accepted_at, delivery_time")
        .eq("status", "delivered")
        .in("order_id", prevOrderIds.length ? prevOrderIds : [NULL_UUID])
        .not("accepted_at",    "is", null)
        .not("delivery_time",  "is", null),
    ])

    // ── Monthly revenue buckets ───────────────────────────────────────────
    const monthBuckets: Record<string, { month: string; revenue: number; orders: number; customerSet: Set<string> }> = {}
    const nowKey   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const nowLabel = now.toLocaleString("en-US", { month: "short", year: "2-digit" })

    safeOrders.forEach(o => {
      const d   = new Date(o.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const lbl = d.toLocaleString("en-US", { month: "short", year: "2-digit" })
      if (!monthBuckets[key]) monthBuckets[key] = { month: lbl, revenue: 0, orders: 0, customerSet: new Set() }
      monthBuckets[key].revenue += Number(o.total_amount) || 0
      monthBuckets[key].orders  += 1
      if (o.customer_id) monthBuckets[key].customerSet.add(o.customer_id)
    })
    if (!monthBuckets[nowKey])
      monthBuckets[nowKey] = { month: nowLabel, revenue: 0, orders: 0, customerSet: new Set() }

    const revenueByMonth = Object.entries(monthBuckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({ month: v.month, revenue: Math.round(v.revenue), orders: v.orders, customers: v.customerSet.size }))

    // ── Peak hours (real) ─────────────────────────────────────────────────
    const hourCounts = new Array(24).fill(0)
    safeOrders.forEach(o => { hourCounts[new Date(o.created_at).getHours()]++ })
    const peakHours = [
      { h: "12AM", v: hourCounts.slice(0,  6).reduce((a, b) => a + b, 0) },
      { h: "8AM",  v: hourCounts.slice(6,  12).reduce((a, b) => a + b, 0) },
      { h: "12PM", v: hourCounts.slice(12, 16).reduce((a, b) => a + b, 0) },
      { h: "6PM",  v: hourCounts.slice(16, 21).reduce((a, b) => a + b, 0) },
      { h: "10PM", v: hourCounts.slice(21, 24).reduce((a, b) => a + b, 0) },
    ]

    // ── Category analysis ─────────────────────────────────────────────────
    const categoryMap: Record<string, number> = {}
    let totalItemsCount = 0
    safeOrders.forEach(o => {
      ;(o.order_items ?? []).forEach((item: any) => {
        const cat = item.menu_items?.categories?.name || "Other"
        const qty = Number(item.quantity) || 1
        categoryMap[cat] = (categoryMap[cat] || 0) + qty
        totalItemsCount += qty
      })
    })
    const CAT_COLORS = ["#e85d26", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"]
    const categories = Object.entries(categoryMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count], i) => ({
        name, orders: count,
        pct: totalItemsCount > 0 ? Math.round((count / totalItemsCount) * 100) : 0,
        color: CAT_COLORS[i % CAT_COLORS.length],
      }))

    // ── KPI calculations ──────────────────────────────────────────────────
    const totalRevenue     = safeOrders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0)
    const prevTotalRevenue = safePrev.reduce((s, o) => s + (Number(o.total_amount) || 0), 0)

    const avgOrderVal     = safeOrders.length ? Math.round(totalRevenue / safeOrders.length) : 0
    const prevAvgOrderVal = safePrev.length   ? Math.round(prevTotalRevenue / safePrev.length) : 0

    const uniqueCustomers     = new Set(safeOrders.map(o => o.customer_id).filter(Boolean)).size
    const prevUniqueCustomers = new Set(safePrev.map(o => o.customer_id).filter(Boolean)).size

    // Repeat rate = customers with >1 order / total unique customers
    const custCounts: Record<string, number> = {}
    safeOrders.forEach(o => { if (o.customer_id) custCounts[o.customer_id] = (custCounts[o.customer_id] ?? 0) + 1 })
    const repeatCustomers = Object.values(custCounts).filter(n => n > 1).length
    const repeatRate = uniqueCustomers > 0 ? Math.round((repeatCustomers / uniqueCustomers) * 100) : 0

    const prevCustCounts: Record<string, number> = {}
    safePrev.forEach(o => { if (o.customer_id) prevCustCounts[o.customer_id] = (prevCustCounts[o.customer_id] ?? 0) + 1 })
    const prevRepeatCustomers = Object.values(prevCustCounts).filter(n => n > 1).length
    const prevRepeatRate = prevUniqueCustomers > 0 ? Math.round((prevRepeatCustomers / prevUniqueCustomers) * 100) : 0

    // Success rate = delivered / total
    const deliveredCount     = safeOrders.filter(o => o.status === "delivered").length
    const prevDeliveredCount = safePrev.filter(o => o.status === "delivered").length
    const successRate     = safeOrders.length ? Math.round((deliveredCount / safeOrders.length) * 100) : 0
    const prevSuccessRate = safePrev.length   ? Math.round((prevDeliveredCount / safePrev.length) * 100) : 0

    // Cancel rate = cancelled / total
    const cancelledCount     = safeOrders.filter(o => o.status === "cancelled").length
    const prevCancelledCount = safePrev.filter(o => o.status === "cancelled").length
    const cancelRate     = safeOrders.length ? Math.round((cancelledCount / safeOrders.length) * 100) : 0
    const prevCancelRate = safePrev.length   ? Math.round((prevCancelledCount / safePrev.length) * 100) : 0

    // Avg delivery time
    const avgDelivMin     = avgDeliveryMinutes(deliveries     as any ?? [])
    const prevAvgDelivMin = avgDeliveryMinutes(prevDeliveries as any ?? [])
    const adChange = (avgDelivMin !== null && prevAvgDelivMin !== null)
      ? ((avgDelivMin - prevAvgDelivMin) <= 0 ? "" : "+") + (avgDelivMin - prevAvgDelivMin) + "m"
      : "—"

    return NextResponse.json({
      revenueByMonth,
      peakHours,
      categories: categories.length ? categories : [{ name: "No Data", orders: 0, pct: 100, color: "#3b82f6" }],
      totals: {
        revenue: totalRevenue,
        formattedRevenue: formatPKR(totalRevenue),
        orders: safeOrders.length,
        customers: uniqueCustomers,
      },
      kpis: {
        avgOrderValue:  formatPKR(avgOrderVal),
        avgChange:      pctChange(avgOrderVal, prevAvgOrderVal),
        successRate:    `${successRate}%`,
        pmChange:       pctChange(successRate, prevSuccessRate),
        cancelRate:     `${cancelRate}%`,
        crChange:       pctChange(cancelRate, prevCancelRate),
        customerGrowth: String(uniqueCustomers),
        cgChange:       pctChange(uniqueCustomers, prevUniqueCustomers),
        repeatRate:     `${repeatRate}%`,
        rrChange:       pctChange(repeatRate, prevRepeatRate),
        avgDelivery:    avgDelivMin !== null ? `${avgDelivMin}m` : "—",
        adChange,
      },
    })
  } catch (err: any) {
    console.error("[analytics API] Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
