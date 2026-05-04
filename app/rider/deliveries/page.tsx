"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, Loader2, Package, Clock } from "lucide-react"
import { supabase } from "@/lib/supaBaseClient"
import { PendingDelivery } from "@/components/Rider/DeliveryNotificationPopup"

const STATUS_LABELS: Record<string, string> = {
  assigned: "Assigned",
  accepted: "Accepted",
  picked_up: "Picked Up",
  delivered: "Delivered",
  cancelled: "Cancelled",
  declined: "Declined",
}

const STATUS_COLORS: Record<string, string> = {
  assigned: "bg-yellow-500/10 text-yellow-600",
  accepted: "bg-blue-500/10 text-blue-600",
  picked_up: "bg-orange-500/10 text-orange-600",
  delivered: "bg-green-500/10 text-green-600",
  cancelled: "bg-destructive/10 text-destructive",
  declined: "bg-muted text-muted-foreground",
}

function formatDuration(pickup: string | null, dropoff: string | null): string | null {
  if (!pickup || !dropoff) return null
  const mins = Math.round((new Date(dropoff).getTime() - new Date(pickup).getTime()) / 60000)
  if (mins < 1) return "< 1 min"
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function DeliveryRow({ delivery, onClick }: { delivery: PendingDelivery; onClick?: () => void }) {
  const restaurant = delivery.orders?.restaurants?.name ?? "Restaurant"
  const address = delivery.orders?.addresses
  const addressLine = address ? `${address.street}, ${address.city}` : "—"
  const amount = delivery.orders?.total_amount
  const duration = formatDuration(delivery.pickup_time, delivery.delivery_time)

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="w-full bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left disabled:cursor-default"
    >
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="font-semibold text-foreground truncate">{restaurant}</p>
        <p className="text-sm text-muted-foreground truncate">→ {addressLine}</p>
        {duration && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 pt-0.5">
            <Clock size={11} />
            {duration}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 ml-4 shrink-0">
        {amount != null && (
          <span className="text-sm font-bold text-green-600">PKR {amount.toLocaleString()}</span>
        )}
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[delivery.status] ?? "bg-muted text-muted-foreground"}`}>
          {STATUS_LABELS[delivery.status] ?? delivery.status}
        </span>
        {onClick && <ChevronRight size={16} className="text-muted-foreground" />}
      </div>
    </button>
  )
}

export default function DeliveriesPage() {
  const router = useRouter()
  const [active, setActive] = useState<PendingDelivery[]>([])
  const [past, setPast] = useState<PendingDelivery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const headers = { Authorization: `Bearer ${session.access_token}` }

      const [activeRes, pastRes] = await Promise.all([
        fetch("/api/rider/deliveries", { headers }),
        fetch("/api/rider/deliveries?past=1", { headers }),
      ])

      if (activeRes.ok) setActive(await activeRes.json())
      if (pastRes.ok) setPast(await pastRes.json())
      setLoading(false)
    }

    load()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Deliveries</h2>
        <p className="text-muted-foreground text-sm">Your active and past deliveries</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Active */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Active</h3>
            {active.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <Package size={24} className="text-muted-foreground/50" />
                No active deliveries
              </div>
            ) : (
              <div className="grid gap-3">
                {active.map((d) => (
                  <DeliveryRow
                    key={d.id}
                    delivery={d}
                    onClick={() => router.push(`/rider/deliveries/${d.id}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Past */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Past Deliveries</h3>
            {past.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <Package size={24} className="text-muted-foreground/50" />
                No past deliveries yet
              </div>
            ) : (
              <div className="grid gap-3">
                {past.map((d) => (
                  <DeliveryRow key={d.id} delivery={d} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
