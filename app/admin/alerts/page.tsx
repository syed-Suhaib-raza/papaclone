"use client"

import { useEffect, useState, useCallback } from "react"
import { RefreshCw, Clock, CreditCard, XCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// ─── Types ────────────────────────────────────────────────────────────────────
interface LateDelivery {
  id: string
  order_id: string
  rider_id: string
  status: string
  pickup_time: string
  isResolved: boolean
  isEscalated: boolean
  orders: {
    id: string
    total_amount: number
    created_at: string
    status: string
    restaurants: { name: string } | null
    users: { email: string } | null
  } | null
}

interface PaymentFailure {
  id: string
  order_id: string
  amount: number
  currency: string
  payment_status: string
  created_at: string
  isResolved: boolean
  isEscalated: boolean
  orders: {
    id: string
    status: string
    users: { email: string } | null
  } | null
}

interface HighCancellation {
  restaurantId: string
  name: string
  count: number
  isResolved: boolean
  isEscalated: boolean
}

interface AlertsData {
  lateDeliveries: LateDelivery[]
  paymentFailures: PaymentFailure[]
  highCancellations: HighCancellation[]
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (diff < 60) return `${diff}m ago`
  return `${Math.floor(diff / 60)}h ${diff % 60}m ago`
}

// ─── Alert Card ───────────────────────────────────────────────────────────────
function AlertCard({
  id, icon, title, badgeLabel, badgeVariant, details,
  isResolved, isEscalated, actionLoading,
  onResolve, onEscalate,
}: {
  id: string
  icon: React.ReactNode
  title: string
  badgeLabel: string
  badgeVariant: "destructive" | "secondary" | "outline"
  details: { label: string; value: string }[]
  isResolved: boolean
  isEscalated: boolean
  actionLoading: string | null
  onResolve: () => void
  onEscalate: () => void
}) {
  return (
    <Card className={`bg-card border-border rounded-2xl theme-transition transition-all duration-300 ${isResolved ? "opacity-40" : ""}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">

          {/* Left: icon + info */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              {/* Title row */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-black text-foreground text-sm">{title}</span>
                <Badge variant={badgeVariant} className="text-[10px] h-5 rounded-full">{badgeLabel}</Badge>
                {isResolved && (
                  <Badge variant="outline" className="text-[10px] h-5 rounded-full text-green-500 border-green-500/30">
                    ✓ Resolved
                  </Badge>
                )}
                {isEscalated && !isResolved && (
                  <Badge variant="outline" className="text-[10px] h-5 rounded-full text-blue-500 border-blue-500/30">
                    ↑ Escalated
                  </Badge>
                )}
              </div>

              {/* Detail pills */}
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                {details.map((d) => (
                  <div key={d.label} className="flex items-center gap-1 text-xs">
                    <span className="text-muted-foreground">{d.label}:</span>
                    <span className="font-bold text-foreground truncate max-w-[160px]">{d.value}</span>
                  </div>
                ))}
              </div>

              {/* Status messages */}
              {isResolved && (
                <p className="text-[10px] text-green-500 mt-2 font-bold">
                  ✓ Resolved and logged in alert_logs.
                </p>
              )}
              {isEscalated && !isResolved && (
                <p className="text-[10px] text-blue-400 mt-2 font-bold">
                  ↑ Escalated — logged in alert_logs, awaiting senior admin.
                </p>
              )}
            </div>
          </div>

          {/* Right: action buttons — hidden once resolved */}
          {!isResolved && (
            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={onEscalate}
                disabled={!!actionLoading || isEscalated}
                className="rounded-xl font-bold text-xs h-8 text-blue-500 border-blue-500/30 hover:bg-blue-500/10 disabled:opacity-40"
              >
                {actionLoading === `${id}-escalated`
                  ? <RefreshCw size={12} className="animate-spin" />
                  : isEscalated ? "Escalated" : "Escalate"
                }
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onResolve}
                disabled={!!actionLoading}
                className="rounded-xl font-bold text-xs h-8 text-green-500 border-green-500/30 hover:bg-green-500/10"
              >
                {actionLoading === `${id}-resolved`
                  ? <RefreshCw size={12} className="animate-spin" />
                  : "Resolve"
                }
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AlertsPage() {
  const [data, setData] = useState<AlertsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"all" | "delivery" | "payment" | "cancellation">("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showResolved, setShowResolved] = useState(false)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/alerts")
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [fetchAlerts])

  const handleAction = async (
    type: "delivery" | "payment" | "cancellation",
    action: "resolved" | "escalated",
    id: string
  ) => {
    setActionLoading(`${id}-${action}`)
    try {
      await fetch("/api/admin/alerts/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, action, id }),
      })
      await fetchAlerts()
    } finally {
      setActionLoading(null)
    }
  }

  // ── Filtered lists based on showResolved toggle ──────────────────
  const visibleDeliveries    = showResolved
    ? data?.lateDeliveries
    : data?.lateDeliveries?.filter(d => !d.isResolved)

  const visiblePayments      = showResolved
    ? data?.paymentFailures
    : data?.paymentFailures?.filter(p => !p.isResolved)

  const visibleCancellations = showResolved
    ? data?.highCancellations
    : data?.highCancellations?.filter(c => !c.isResolved)

  // ── Counts ───────────────────────────────────────────────────────
  const total = {
    delivery:     data?.lateDeliveries.length    || 0,
    payment:      data?.paymentFailures.length   || 0,
    cancellation: data?.highCancellations.length || 0,
  }
  const active = {
    delivery:     data?.lateDeliveries?.filter(d    => !d.isResolved).length || 0,
    payment:      data?.paymentFailures?.filter(p   => !p.isResolved).length || 0,
    cancellation: data?.highCancellations?.filter(c => !c.isResolved).length || 0,
  }
  const resolved = {
    delivery:     total.delivery     - active.delivery,
    payment:      total.payment      - active.payment,
    cancellation: total.cancellation - active.cancellation,
  }

  const totalAlerts  = total.delivery  + total.payment  + total.cancellation
  const totalActive  = active.delivery + active.payment + active.cancellation
  const totalResolved = resolved.delivery + resolved.payment + resolved.cancellation

  const visibleCount = {
    delivery:     visibleDeliveries?.length    || 0,
    payment:      visiblePayments?.length      || 0,
    cancellation: visibleCancellations?.length || 0,
  }
  const totalVisible = visibleCount.delivery + visibleCount.payment + visibleCount.cancellation

  const TABS = [
    { key: "all"          as const, label: "All Alerts",         count: totalVisible          },
    { key: "delivery"     as const, label: "Late Delivery",      count: visibleCount.delivery },
    { key: "payment"      as const, label: "Payment Failure",    count: visibleCount.payment  },
    { key: "cancellation" as const, label: "High Cancellations", count: visibleCount.cancellation },
  ]

  return (
    <div className="animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">System Alerts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monitor and resolve critical platform issues</p>
        </div>
        <div className="flex gap-2">
          {/* Show/Hide Resolved toggle — only shown if there are resolved alerts */}
          {totalResolved > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResolved(prev => !prev)}
              className={`rounded-xl font-bold gap-2 text-xs ${showResolved ? "bg-muted text-foreground" : "text-muted-foreground"}`}
            >
              {showResolved
                ? `Hide Resolved (${totalResolved})`
                : `Show Resolved (${totalResolved})`
              }
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setLoading(true); fetchAlerts() }}
            className="rounded-xl font-bold gap-2"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Late Deliveries",
            act: active.delivery,
            res: resolved.delivery,
            icon: <Clock size={18} />,
            color: "text-yellow-500",
          },
          {
            label: "Payment Failures",
            act: active.payment,
            res: resolved.payment,
            icon: <CreditCard size={18} />,
            color: "text-red-500",
          },
          {
            label: "High Cancellations",
            act: active.cancellation,
            res: resolved.cancellation,
            icon: <XCircle size={18} />,
            color: "text-purple-500",
          },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border rounded-2xl theme-transition">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-bold mb-1">{s.label}</p>
                  <p className={`text-3xl font-black ${s.color}`}>{s.act}</p>
                  {s.res > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.res} resolved</p>
                  )}
                </div>
                <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${s.color}`}>
                  {s.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-muted p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? "bg-white/20" : "bg-background"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alert List */}
      {loading ? (
        <div className="h-48 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="animate-spin text-primary" size={28} />
          <p className="text-muted-foreground text-sm font-bold">Loading alerts...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">

          {/* Late Deliveries */}
          {(activeTab === "all" || activeTab === "delivery") &&
            visibleDeliveries?.map((d) => (
              <AlertCard
                key={d.id} id={d.id}
                icon={<Clock size={18} />}
                title="Late Delivery"
                badgeLabel="DELAYED"
                badgeVariant="destructive"
                isResolved={d.isResolved}
                isEscalated={d.isEscalated}
                details={[
                  { label: "Restaurant", value: d.orders?.restaurants?.name || "N/A" },
                  { label: "Customer",   value: d.orders?.users?.email || "N/A" },
                  { label: "Picked up",  value: d.pickup_time ? timeAgo(d.pickup_time) : "N/A" },
                  { label: "Status",     value: d.status },
                  { label: "Amount",     value: `PKR ${d.orders?.total_amount || 0}` },
                ]}
                actionLoading={actionLoading}
                onResolve={() => handleAction("delivery", "resolved", d.id)}
                onEscalate={() => handleAction("delivery", "escalated", d.id)}
              />
            ))}

          {/* Payment Failures */}
          {(activeTab === "all" || activeTab === "payment") &&
            visiblePayments?.map((p) => (
              <AlertCard
                key={p.id} id={p.id}
                icon={<CreditCard size={18} />}
                title="Payment Failure"
                badgeLabel="FAILED"
                badgeVariant="destructive"
                isResolved={p.isResolved}
                isEscalated={p.isEscalated}
                details={[
                  { label: "Customer",     value: p.orders?.users?.email || "N/A" },
                  { label: "Amount",       value: `${p.currency?.toUpperCase()} ${p.amount}` },
                  { label: "When",         value: timeAgo(p.created_at) },
                  { label: "Order status", value: p.orders?.status || "N/A" },
                ]}
                actionLoading={actionLoading}
                onResolve={() => handleAction("payment", "resolved", p.id)}
                onEscalate={() => handleAction("payment", "escalated", p.id)}
              />
            ))}

          {/* High Cancellations */}
          {(activeTab === "all" || activeTab === "cancellation") &&
            visibleCancellations?.map((c) => (
              <AlertCard
                key={c.restaurantId} id={c.restaurantId}
                icon={<XCircle size={18} />}
                title="High Cancellation Rate"
                badgeLabel="WARNING"
                badgeVariant="secondary"
                isResolved={c.isResolved}
                isEscalated={c.isEscalated}
                details={[
                  { label: "Restaurant",           value: c.name },
                  { label: "Cancellations (24h)",  value: String(c.count) },
                ]}
                actionLoading={actionLoading}
                onResolve={() => handleAction("cancellation", "resolved", c.restaurantId)}
                onEscalate={() => handleAction("cancellation", "escalated", c.restaurantId)}
              />
            ))}

          {/* No alerts at all */}
          {totalAlerts === 0 && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                <CheckCircle size={24} className="text-green-500" />
              </div>
              <p className="text-sm font-bold text-muted-foreground">All clear — no active alerts</p>
            </div>
          )}

          {/* All active resolved, resolved hidden */}
          {totalAlerts > 0 && totalActive === 0 && !showResolved && (
            <div className="flex flex-col items-center justify-center h-32 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle size={24} className="text-green-500" />
              </div>
              <p className="text-sm font-bold text-muted-foreground">
                No active alerts 🎉
              </p>
              <p className="text-xs text-muted-foreground">
                Click "Show Resolved" to view history
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  )
}