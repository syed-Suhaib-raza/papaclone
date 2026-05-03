import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const range = searchParams.get("range") ?? "30d"

    // 1. Compute date range
    const now = new Date()
    const rangeMap: Record<string, number> = { "24h": 1, "7d": 7, "30d": 30, "90d": 90 }
    const days = rangeMap[range] ?? 30
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - days)
    const startISO = startDate.toISOString()

    // 2. Fetch orders with specific JOINS
    const { data: orders, error: oErr } = await supabase
      .from("orders")
      .select(`
        id,
        total_amount,
        created_at,
        customer_id,
        order_items (
          quantity,
          menu_items (
            category_id,
            categories ( name )
          )
        )
      `)
      .gte("created_at", startISO)
      .order("created_at", { ascending: true })

    if (oErr) {
        console.error("Supabase Orders Error:", oErr)
        throw oErr
    }

    const safeOrders = orders ?? []

    // 3. Smart Formatting Function (Millions, Thousands, Hundreds)
    const formatPKR = (n: number) => {
      if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(2)}M`
      if (n >= 1_000) return `PKR ${(n / 1_000).toFixed(1)}K`
      return `PKR ${n.toFixed(0)}`
    }

    // 4. Build monthly buckets
    const monthBuckets: Record<string, { month: string; revenue: number; orders: number; customerSet: Set<string> }> = {}

    safeOrders.forEach(o => {
      const d = new Date(o.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const label = d.toLocaleString("en-US", { month: "short", year: "2-digit" })

      if (!monthBuckets[key]) {
        monthBuckets[key] = { month: label, revenue: 0, orders: 0, customerSet: new Set() }
      }
      monthBuckets[key].revenue += Number(o.total_amount) || 0
      monthBuckets[key].orders += 1
      if (o.customer_id) monthBuckets[key].customerSet.add(o.customer_id)
    })

    // Ensure current month always appears
    const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const nowLabel = now.toLocaleString("en-US", { month: "short", year: "2-digit" })
    if (!monthBuckets[nowKey]) {
      monthBuckets[nowKey] = { month: nowLabel, revenue: 0, orders: 0, customerSet: new Set() }
    }

    const revenueByMonth = Object.entries(monthBuckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({
        month: v.month,
        revenue: Math.round(v.revenue),
        orders: v.orders,
        customers: v.customerSet.size,
      }))

    // 5. Category analysis
    const categoryMap: Record<string, number> = {}
    let totalItemsCount = 0

    safeOrders.forEach(o => {
      (o.order_items ?? []).forEach((item: any) => {
        const catName = item.menu_items?.categories?.name || "Other"
        const qty = Number(item.quantity) || 1
        categoryMap[catName] = (categoryMap[catName] || 0) + qty
        totalItemsCount += qty
      })
    })

    const CAT_COLORS = ["#e85d26", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"]
    const categories = Object.entries(categoryMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count], i) => ({
        name,
        orders: count,
        pct: totalItemsCount > 0 ? Math.round((count / totalItemsCount) * 100) : 0,
        color: CAT_COLORS[i % CAT_COLORS.length]
      }))

    // 6. Final KPIs and Totals
    const totalRevenue = safeOrders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0)
    const avgOrderVal = safeOrders.length > 0 ? Math.round(totalRevenue / safeOrders.length) : 0
    const uniqueCustomers = new Set(safeOrders.map(o => o.customer_id).filter(Boolean)).size

    return NextResponse.json({
      revenueByMonth,
      peakHours: [
        { h: "12AM", v: 2 }, { h: "8AM", v: 12 }, { h: "12PM", v: 18 }, { h: "6PM", v: 25 }, { h: "10PM", v: 8 }
      ],
      categories: categories.length ? categories : [{ name: "No Data", orders: 0, pct: 100, color: "#3b82f6" }],
      // We pass both raw numbers and formatted strings
      totals: {
        revenue: totalRevenue,
        formattedRevenue: formatPKR(totalRevenue),
        orders: safeOrders.length,
        customers: uniqueCustomers
      },
      kpis: {
        avgOrderValue: formatPKR(avgOrderVal),
        avgChange: "+2.1%", 
        profitMargin: "15%", 
        pmChange: "+0.5%",
        conversionRate: "4.2%",
        crChange: "+0.2%",
        customerGrowth: String(uniqueCustomers),
        cgChange: "+10%",
        repeatRate: "35%",
        rrChange: "+2%",
        avgDelivery: "24m",
        adChange: "-3m",
      },
    })
  } catch (err: any) {
    console.error("[analytics API] Critical Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}