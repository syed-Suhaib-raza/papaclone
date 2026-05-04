"use client"

import { useEffect, useState } from "react"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, ResponsiveContainer,
} from "recharts"
import { useChartTheme } from "@/lib/useChartTheme"

type Delivery = {
  id: string
  pickup_time: string | null
  delivery_time: string | null
  orders: { total_amount: string | number; commissions: { commission_amount: string | number }[] | null } | null
}
type Review = { rating: number; created_at: string }

function CustomTooltip({ active, payload, label, cardBg, foreground, border }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: cardBg, border: `1px solid ${border}`, color: foreground }}
      className="rounded-lg px-3 py-2 text-sm shadow-md">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey}>
          {p.dataKey === "revenue" ? `PKR ${Number(p.value).toLocaleString()}` : `${p.dataKey}: ${p.value}`}
        </p>
      ))}
    </div>
  )
}

export default function RiderAnalyticsClient({ accessToken }: { accessToken: string }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("monthly")
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const { border, mutedForeground, cardBg, foreground, primary, chart2, chart3 } = useChartTheme()

  useEffect(() => {
    fetch("/api/rider/analytics", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setDeliveries(d.deliveries ?? [])
        setReviews(d.reviews ?? [])
      })
      .finally(() => setLoading(false))
  }, [accessToken])

  const now = new Date()

  const getDate = (d: Delivery) => new Date(d.delivery_time ?? d.pickup_time ?? now)

  const getKey = (d: Date) => {
    if (filter === "monthly") return d.toLocaleString("default", { month: "short", year: "2-digit" })
    if (filter === "weekly") {
      const week = Math.ceil(d.getDate() / 7)
      return `${d.toLocaleString("default", { month: "short" })} W${week}-${d.getFullYear()}`
    }
    return d.getFullYear().toString()
  }

  const filtered = deliveries.filter((d) => {
    const date = getDate(d)
    if (filter === "weekly") return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 7) < 12
    if (filter === "monthly") {
      const diff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth())
      return diff < 12
    }
    return now.getFullYear() - date.getFullYear() < 12
  })

  const selected = selectedKey
    ? filtered.filter((d) => getKey(getDate(d)) === selectedKey)
    : filtered

  const totalDeliveries = selected.length
  const totalRevenue = selected.reduce((s, d) => s + Number(d.orders?.commissions?.[0]?.commission_amount ?? 0), 0)

  const dayRevenue: Record<string, number> = {}
  selected.forEach((d) => {
    const k = getDate(d).toLocaleDateString()
    dayRevenue[k] = (dayRevenue[k] ?? 0) + Number(d.orders?.commissions?.[0]?.commission_amount ?? 0)
  })
  const bestDay = Object.entries(dayRevenue).sort((a, b) => b[1] - a[1])[0]

  const hourData: Record<number, number> = {}
  selected.forEach((d) => {
    const h = getDate(d).getHours()
    hourData[h] = (hourData[h] ?? 0) + 1
  })
  const peakHour = Object.entries(hourData).sort((a, b) => Number(b[1]) - Number(a[1]))[0]

  const buildGraphData = () => {
    const slots: { date: string; revenue: number; deliveries: number }[] = []
    for (let i = 11; i >= 0; i--) {
      let d: Date
      if (filter === "monthly") d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      else if (filter === "weekly") { d = new Date(); d.setDate(d.getDate() - i * 7) }
      else d = new Date(now.getFullYear() - i, 0, 1)
      slots.push({ date: getKey(d), revenue: 0, deliveries: 0 })
    }
    filtered.forEach((d) => {
      const key = getKey(getDate(d))
      const found = slots.find((s) => s.date === key)
      if (found) { found.revenue += Number(d.orders?.commissions?.[0]?.commission_amount ?? 0); found.deliveries += 1 }
    })
    return slots
  }
  const graphData = buildGraphData()

  const label = filter === "weekly" ? "Last 12 Weeks" : filter === "monthly" ? "Last 12 Months" : "Last 12 Years"

  const ratingMap: Record<string, { sum: number; count: number }> = {}
  reviews.forEach((r) => {
    const k = new Date(r.created_at).toLocaleDateString()
    if (!ratingMap[k]) ratingMap[k] = { sum: 0, count: 0 }
    ratingMap[k].sum += r.rating
    ratingMap[k].count += 1
  })
  const ratingData = Object.entries(ratingMap)
    .map(([date, { sum, count }]) => ({ date, rating: parseFloat((sum / count).toFixed(2)) }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const averageRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "N/A"

  const avgRevenuePerDelivery = deliveries.length > 0
    ? (deliveries.reduce((s, d) => s + Number(d.orders?.commissions?.[0]?.commission_amount ?? 0), 0) / deliveries.length).toFixed(0)
    : "N/A"

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {(["weekly", "monthly", "yearly"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setFilter(t); setSelectedKey(null) }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              filter === t
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <p className="text-sm font-medium text-muted-foreground">{label}</p>

      {selectedKey && (
        <p className="text-xs text-muted-foreground">
          Filtered to: <span className="font-semibold text-foreground">{selectedKey}</span>
          <button onClick={() => setSelectedKey(null)} className="ml-2 underline">clear</button>
        </p>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Revenue", value: `PKR ${totalRevenue.toLocaleString()}`, highlight: true },
          { label: "Deliveries", value: totalDeliveries.toString() },
          { label: "Best Day", value: bestDay ? bestDay[0] : "N/A" },
          { label: "Peak Hour", value: peakHour ? `${peakHour[0]}:00` : "N/A" },
        ].map(({ label, value, highlight }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-xl font-semibold mt-1 ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue + Deliveries charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3">Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={graphData} onClick={(e: any) => {
              if (e?.activeLabel) setSelectedKey((prev) => prev === e.activeLabel ? null : e.activeLabel)
            }}>
              <CartesianGrid strokeDasharray="3 3" stroke={border} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: mutedForeground, fontSize: 10 }} axisLine={{ stroke: border }} tickLine={false} />
              <YAxis tick={{ fill: mutedForeground, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip cardBg={cardBg} foreground={foreground} border={border} />} cursor={{ stroke: border }} />
              <Line type="monotone" dataKey="revenue" stroke={primary} strokeWidth={2.5}
                dot={{ fill: primary, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: primary, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3">Deliveries</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={graphData} barCategoryGap="40%" onClick={(e: any) => {
              if (e?.activeLabel) setSelectedKey((prev) => prev === e.activeLabel ? null : e.activeLabel)
            }}>
              <CartesianGrid strokeDasharray="3 3" stroke={border} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: mutedForeground, fontSize: 10 }} axisLine={{ stroke: border }} tickLine={false} />
              <YAxis tick={{ fill: mutedForeground, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip cardBg={cardBg} foreground={foreground} border={border} />} cursor={{ fill: border, opacity: 0.4 }} />
              <Bar dataKey="deliveries" fill={chart2} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ratings */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Ratings</h2>
          <span className="text-sm font-semibold" style={{ color: chart3 }}>
            {averageRating} ⭐ avg
          </span>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={ratingData}>
            <CartesianGrid strokeDasharray="3 3" stroke={border} vertical={false} />
            <XAxis dataKey="date" tick={{ fill: mutedForeground, fontSize: 10 }} axisLine={{ stroke: border }} tickLine={false} />
            <YAxis domain={[0, 5]} tick={{ fill: mutedForeground, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip cardBg={cardBg} foreground={foreground} border={border} />} cursor={{ stroke: border }} />
            <Line type="monotone" dataKey="rating" stroke={chart3} strokeWidth={2.5}
              dot={{ fill: chart3, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: chart3, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* All-time stats */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h2 className="text-base font-semibold">All-Time Stats</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm text-muted-foreground">Total Deliveries</p>
            <p className="text-lg font-semibold text-foreground mt-1">{deliveries.length}</p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm text-muted-foreground">Avg Revenue per Delivery</p>
            <p className="text-lg font-semibold text-primary mt-1">PKR {avgRevenuePerDelivery}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
