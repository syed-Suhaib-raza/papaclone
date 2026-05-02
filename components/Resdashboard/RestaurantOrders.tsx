"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

type OrderItem = {
  id: string
  quantity: number
  price_at_order: number
  menu_items: { name: string } | null
}

type Order = {
  id: string
  status: string
  total_amount: number
  created_at: string
  users: { name: string } | null
  addresses: { street: string; city: string } | null
  order_items: OrderItem[]
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  picked_up: "Picked Up",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  preparing: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
  ready: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  picked_up: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  delivered: "bg-green-500/10 text-green-600 border-green-500/30",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/30",
}

// What action the restaurant can take on each status
const NEXT_ACTION: Record<string, { label: string; next: string } | null> = {
  pending: { label: "Accept Order", next: "confirmed" },
  confirmed: { label: "Start Preparing", next: "preparing" },
  preparing: { label: "Mark Ready", next: "ready" },
  ready: null,
  picked_up: null,
  delivered: null,
  cancelled: null,
}

const ACTIVE_STATUSES = ["pending", "confirmed", "preparing", "ready", "picked_up"]
const DONE_STATUSES = ["delivered", "cancelled"]

function OrderCard({
  order,
  onStatusChange,
}: {
  order: Order
  onStatusChange: (orderId: string, status: string) => Promise<void>
}) {
  const [updating, setUpdating] = useState(false)
  const action = NEXT_ACTION[order.status]

  async function handleAction() {
    if (!action) return
    setUpdating(true)
    await onStatusChange(order.id, action.next)
    setUpdating(false)
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">
            {order.users?.name ?? "Customer"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(order.created_at).toLocaleString()}
          </p>
          {order.addresses && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {order.addresses.street}, {order.addresses.city}
            </p>
          )}
        </div>
        <span className={`shrink-0 px-3 py-1 text-xs rounded-full border ${STATUS_STYLE[order.status] ?? "bg-muted text-muted-foreground border-border"}`}>
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      {/* Items */}
      <div className="bg-muted rounded-lg p-3 space-y-1.5">
        {order.order_items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.menu_items?.name ?? "Item"} × {item.quantity}</span>
            <span className="text-muted-foreground">PKR {(item.price_at_order * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-sm font-semibold">
          Total: PKR {order.total_amount?.toLocaleString()}
        </span>

        <div className="flex gap-2">
          {order.status === "pending" && (
            <Button
              size="sm"
              variant="destructive"
              disabled={updating}
              onClick={() => onStatusChange(order.id, "cancelled").then(() => {})}
            >
              Cancel
            </Button>
          )}
          {action && (
            <Button size="sm" disabled={updating} onClick={handleAction}>
              {updating ? "Updating…" : action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RestaurantOrders({ accessToken }: { accessToken: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"active" | "done">("active")

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  }

  async function loadOrders() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/restaurant/orders", { headers: authHeaders })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to load orders")
      setOrders(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrders() }, [])

  async function handleStatusChange(orderId: string, status: string) {
    const res = await fetch("/api/restaurant/orders", {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ orderId, status }),
    })
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      )
    }
  }

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status))
  const doneOrders = orders.filter((o) => DONE_STATUSES.includes(o.status))
  const displayed = activeTab === "active" ? activeOrders : doneOrders

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button variant="outline" size="sm" onClick={loadOrders} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {(["active", "done"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "active" ? `Active (${activeOrders.length})` : `Completed (${doneOrders.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && displayed.length === 0 && (
        <div className="text-center text-muted-foreground py-16 bg-card border border-border rounded-xl">
          No {activeTab === "active" ? "active" : "completed"} orders
        </div>
      )}

      {!loading && !error && displayed.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {displayed.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
