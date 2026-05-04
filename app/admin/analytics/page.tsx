"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Download, TrendingUp, TrendingDown, Users,
  ShoppingBag, Clock, BarChart2, RefreshCw,
  Activity, Target
} from "lucide-react"

/* ─────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────── */
interface AnalyticsData {
  revenueByMonth: { month: string; revenue: number; orders: number; customers: number }[]
  peakHours:      { h: string; v: number }[]
  categories:     { name: string; orders: number; pct: number; color: string }[]
  kpis: {
    avgOrderValue:  string; avgChange:   string
    successRate:    string; pmChange:    string
    cancelRate:     string; crChange:    string
    customerGrowth: string; cgChange:    string
    repeatRate:     string; rrChange:    string
    avgDelivery:    string; adChange:    string
  }
}

/* ─────────────────────────────────────────────────────────
   CHART HELPERS (Using CSS Variables for SVG)
───────────────────────────────────────────────────────── */
function LineChart({ data }: { data: AnalyticsData["revenueByMonth"] }) {
  if (!data?.length) return null
  const maxR = Math.max(...data.map(d => d.revenue), 1)
  const maxO = Math.max(...data.map(d => d.orders),  1)
  const w    = 100 / Math.max(data.length - 1, 1)

  const rPts = data.map((d, i) => `${i * w},${100 - (d.revenue / maxR) * 82}`).join(" ")
  const oPts = data.map((d, i) => `${i * w},${100 - (d.orders  / maxO) * 82}`).join(" ")
  const rArea = `${rPts} ${(data.length - 1) * w},110 0,110`

  return (
    <div className="w-full">
      <svg viewBox="0 0 100 110" className="w-full h-[180px] overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="analytic-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <polygon points={rArea} fill="url(#analytic-grad)" />
        <polyline fill="none" stroke="var(--primary)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" points={rPts} />
        {data.map((d, i) => (
          <circle key={`r${i}`} cx={i * w} cy={100 - (d.revenue / maxR) * 82} r="1.8" fill="var(--primary)" />
        ))}

        <polyline fill="none" stroke="var(--chart-2)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 1.5" points={oPts} />
        {data.map((d, i) => (
          <circle key={`o${i}`} cx={i * w} cy={100 - (d.orders / maxO) * 82} r="1.2" fill="var(--chart-2)" />
        ))}

        {[25, 50, 75].map(y => (
          <line key={y} x1="0" y1={100 - y * 0.82} x2="100" y2={100 - y * 0.82} stroke="currentColor" className="text-border/20" strokeWidth="0.5" />
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        {data.map(d => (
          <span key={d.month} className="text-[9px] font-bold text-muted-foreground uppercase">
            {d.month}
          </span>
        ))}
      </div>
    </div>
  )
}

function PeakChart({ data }: { data: AnalyticsData["peakHours"] }) {
  const max = Math.max(...data.map(d => d.v), 1)
  return (
    <div className="flex items-end gap-1.5 h-[110px]">
      {data.map(d => {
        const isPeak = d.v === max
        return (
          <div key={d.h} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-t-sm relative transition-all duration-500 ${isPeak ? 'bg-primary' : 'bg-primary/20'}`}
              style={{ height: `${(d.v / max) * 100}%`, minHeight: 4 }}
            >
              {isPeak && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-black text-primary whitespace-nowrap tracking-wider">
                  PEAK
                </div>
              )}
            </div>
            <span className="text-[8px] font-bold text-muted-foreground">{d.h}</span>
          </div>
        )
      })}
    </div>
  )
}

function DonutChart({ categories }: { categories: AnalyticsData["categories"] }) {
  const total = categories.reduce((s, c) => s + c.orders, 0) || 1
  const r = 30
  const circ = 2 * Math.PI * r
  let dashOffset = 0

  return (
    <svg viewBox="0 0 80 80" className="w-[90px] h-[90px] shrink-0">
      {categories.map((c, i) => {
        const dash = (c.orders / total) * circ
        const el = (
          <circle key={i} cx="40" cy="40" r={r} fill="none" stroke={c.color} strokeWidth="10" strokeDasharray={`${dash} ${circ}`} strokeDashoffset={-dashOffset} strokeLinecap="butt" />
        )
        dashOffset += dash
        return el
      })}
      <text x="40" y="38" textAnchor="middle" fontSize="7" fontWeight="800" fill="currentColor" className="text-muted-foreground">TOTAL</text>
      <text x="40" y="46" textAnchor="middle" fontSize="7" fontWeight="900" fill="currentColor" className="text-foreground">
        {(total / 1000).toFixed(1)}K
      </text>
    </svg>
  )
}

function downloadCSV(data: AnalyticsData) {
  const rows: string[][] = [
    ["Month", "Revenue (PKR)", "Orders", "Customers"],
    ...data.revenueByMonth.map(r => [r.month, String(r.revenue), String(r.orders), String(r.customers)]),
    [],
    ["KPI", "Value", "Change"],
    ["Avg Order Value",  data.kpis.avgOrderValue,  data.kpis.avgChange],
    ["Success Rate",     data.kpis.successRate,    data.kpis.pmChange],
    ["Cancel Rate",      data.kpis.cancelRate,     data.kpis.crChange],
    ["Customer Growth",  data.kpis.customerGrowth, data.kpis.cgChange],
    ["Repeat Rate",      data.kpis.repeatRate,     data.kpis.rrChange],
    ["Avg Delivery",     data.kpis.avgDelivery,    data.kpis.adChange],
    [],
    ["Category", "Orders", "Share %"],
    ...data.categories.map(c => [c.name, String(c.orders), `${c.pct}%`]),
  ]
  const csv = rows.map(r => r.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `smartfood-analytics-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [range, setRange] = useState("30d")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/admin/analytics?range=${range}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => {
        setData({
          revenueByMonth: d.revenueByMonth ?? [],
          peakHours:      d.peakHours      ?? [],
          categories:     d.categories     ?? [],
          kpis:           d.kpis           ?? {
            avgOrderValue:"—", avgChange:"—", successRate:"—", pmChange:"—",
            cancelRate:"—", crChange:"—", customerGrowth:"—", cgChange:"—",
            repeatRate:"—", rrChange:"—", avgDelivery:"—", adChange:"—",
          },
        })
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [range])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[360px] gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-primary/10 border-t-primary animate-spin" />
      <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Crunching data…</span>
    </div>
  )

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center h-[360px] gap-4">
      <div className="text-4xl">⚠️</div>
      <div className="text-sm font-bold text-destructive">Failed to load analytics {error ? `— ${error}` : ""}</div>
      <button onClick={load} className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-xs">Retry</button>
    </div>
  )

  const totalRev = data.revenueByMonth.reduce((s, d) => s + d.revenue, 0)
  const totalOrd = data.revenueByMonth.reduce((s, d) => s + d.orders,  0)
  const peakHour = data.peakHours.length ? data.peakHours.reduce((a, b) => b.v > a.v ? b : a).h : "—"

  const KPIS = [
    { label:"Avg Order Value",  val:data.kpis.avgOrderValue,  change:data.kpis.avgChange,   up:true,  icon:<ShoppingBag size={17}/>, color:"var(--primary)" },
    { label:"Success Rate",     val:data.kpis.successRate,    change:data.kpis.pmChange,    up:true,  icon:<TrendingUp  size={17}/>, color:"oklch(0.627 0.194 149.214)" },
    { label:"Cancel Rate",      val:data.kpis.cancelRate,     change:data.kpis.crChange,    up:false, icon:<Target      size={17}/>, color:"var(--destructive)" },
    { label:"Customer Growth",  val:data.kpis.customerGrowth, change:data.kpis.cgChange,    up:true,  icon:<Users       size={17}/>, color:"var(--chart-2)" },
    { label:"Repeat Rate",      val:data.kpis.repeatRate,     change:data.kpis.rrChange,    up:true,  icon:<Activity    size={17}/>, color:"oklch(0.581 0.176 273.528)" },
    { label:"Avg Delivery",     val:data.kpis.avgDelivery,    change:data.kpis.adChange,    up:true,  icon:<Clock       size={17}/>, color:"oklch(0.795 0.184 86.047)" },
  ]

  return (
    <div className="pb-10 theme-transition text-foreground">
      {/* ── PAGE HEADER ─────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between mb-7 gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-1 h-7 rounded-sm bg-gradient-to-b from-primary to-primary/60" />
            <h1 className="text-2xl font-black tracking-tight">Analytics</h1>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-3">
            Business Observation Engine · Read-only
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 p-1 bg-muted/50 rounded-xl border border-border">
            {(["24h","7d","30d","90d"] as const).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all ${range === r ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <button onClick={() => downloadCSV(data)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all">
            <Download size={13}/> EXPORT CSV
          </button>

          <button onClick={load} className="w-[34px] h-[34px] rounded-lg bg-muted border border-border text-muted-foreground flex items-center justify-center hover:text-foreground">
            <RefreshCw size={14}/>
          </button>
        </div>
      </div>

      {/* ── SUMMARY TOTALS BAR ───────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-muted/30 border border-border rounded-2xl">
        {[
          { label:"Total Revenue",   val:`PKR ${(totalRev/1_000_000).toFixed(2)}M`, color: "text-primary" },
          { label:"Total Orders",    val:totalOrd.toLocaleString(),                 color:"text-chart-2" },
          { label:"Avg Monthly Rev", val:`PKR ${data.revenueByMonth.length ? (totalRev/data.revenueByMonth.length/1000).toFixed(1)+"K" : "—"}`, color:"text-green-500" },
        ].map(({ label, val, color }) => (
          <div key={label} className="text-center">
            <div className={`text-xl font-black ${color}`}>{val}</div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* ── KPI GRID ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
        {KPIS.map(k => (
          <div key={k.label} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 card-hover">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${k.color}15`, color: k.color }}>
                {k.icon}
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${k.up ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                {k.up ? <TrendingUp size={9}/> : <TrendingDown size={9}/>}
                {k.change}
              </span>
            </div>
            <div className="text-2xl font-black leading-none">{k.val}</div>
            <div className="text-[10px] font-bold text-muted-foreground mt-1.5 uppercase tracking-wider">{k.label}</div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW 1 ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-card border border-border rounded-[20px] p-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-black uppercase tracking-tight">📈 Revenue Trend</span>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                <span className="w-4 h-0.5 bg-primary rounded-full"/> Rev
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                <span className="w-4 h-0 border-t border-dashed border-chart-2"/> Ord
              </div>
            </div>
          </div>
          <LineChart data={data.revenueByMonth} />
        </div>

        <div className="bg-card border border-border rounded-[20px] p-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-black uppercase tracking-tight">⏰ Peak Hours</span>
            <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-black">{peakHour} PEAK</span>
          </div>
          <PeakChart data={data.peakHours} />
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[{ label:"Lunch", val:"12–2 PM", icon:"🍽️" }, { label:"Dinner", val:"7–10 PM", icon:"🔥" }].map(r => (
              <div key={r.label} className="bg-muted/40 rounded-lg p-2.5">
                <div className="text-xs font-black">{r.val}</div>
                <div className="text-[9px] text-muted-foreground font-bold">{r.label} Rush</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CHARTS ROW 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-[20px] p-6">
          <h3 className="text-sm font-black uppercase tracking-tight mb-5">🍕 Categories</h3>
          <div className="flex items-center gap-5 mb-5">
            <DonutChart categories={data.categories} />
            <div className="flex-1 flex flex-col gap-2">
              {data.categories.map(c => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: c.color }}/>
                  <span className="text-[11px] font-bold flex-1">{c.name}</span>
                  <span className="text-[11px] font-black" style={{ color: c.color }}>{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[20px] p-6">
          <h3 className="text-sm font-black uppercase tracking-tight mb-5">👥 Growth</h3>
          <div className="flex flex-col gap-2.5">
            {data.revenueByMonth.map((m, i) => {
              const prev = i > 0 ? data.revenueByMonth[i - 1].customers : null
              const growth = prev !== null ? Math.round(((m.customers - prev) / Math.max(prev, 1)) * 100) : null
              return (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="w-7 text-[10px] font-bold text-muted-foreground uppercase">{m.month}</span>
                  <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-1000"
                      style={{ width: `${(m.customers / Math.max(...data.revenueByMonth.map(x => x.customers), 1)) * 100}%` }}
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-black mix-blend-difference text-white">
                      {m.customers.toLocaleString()}
                    </span>
                  </div>
                  {growth !== null && (
                    <span className={`w-9 text-[9px] font-black text-right ${growth >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                      {growth >= 0 ? "+" : ""}{growth}%
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}