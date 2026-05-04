"use client"

import { useRouter } from "next/navigation"
import { MapPin, X, CheckCircle } from "lucide-react"
import { useState } from "react"
import { supabase } from "@/lib/supaBaseClient"

export interface PendingDelivery {
  id: string
  status: string
  pickup_time: string | null
  delivery_time: string | null
  orders: {
    id: string
    total_amount: number
    restaurants: { name: string; latitude: number; longitude: number } | null
    addresses: { street: string; city: string; latitude: number | null; longitude: number | null } | null
    users: { name: string } | null
  } | null
}

interface Props {
  delivery: PendingDelivery
  onDismiss: (deliveryId: string) => void
}

export default function DeliveryNotificationPopup({ delivery, onDismiss }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [declining, setDeclining] = useState(false)

  const restaurant = delivery.orders?.restaurants
  const address = delivery.orders?.addresses
  const customer = delivery.orders?.users

  async function handleAccept() {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch("/api/rider/deliveries", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ deliveryId: delivery.id, status: "accepted" }),
      })

      if (res.ok) {
        sessionStorage.setItem(`delivery-accepted-at:${delivery.id}`, Date.now().toString())
        onDismiss(delivery.id)
        router.push(`/rider/deliveries/${delivery.id}`)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDecline() {
    setDeclining(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await fetch("/api/rider/deliveries", {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ deliveryId: delivery.id, status: "declined" }),
        })
      }
    } finally {
      setDeclining(false)
      onDismiss(delivery.id)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[340px] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-chart-2/20 border-b border-border px-5 py-4 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wide">New Delivery Request</p>
            <h3 className="text-base font-bold text-foreground mt-0.5">
              {restaurant?.name ?? "Restaurant"}
            </h3>
          </div>
          <button
            onClick={() => onDismiss(delivery.id)}
            className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <div className="flex gap-3 items-start">
            <div className="w-5 h-5 rounded-full bg-green-500/20 border-2 border-green-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Pickup</p>
              <p className="text-sm text-foreground">{restaurant?.name ?? "—"}</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-5 h-5 rounded-full bg-red-500/20 border-2 border-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Dropoff</p>
              <p className="text-sm text-foreground">
                {address ? `${address.street}, ${address.city}` : "—"}
              </p>
            </div>
          </div>

          {customer && (
            <div className="flex items-center gap-2 pt-1">
              <MapPin size={13} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Customer: {customer.name}</p>
            </div>
          )}

          <div className="bg-muted rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Earnings</span>
            <span className="text-sm font-bold text-green-600">
              PKR {delivery.orders?.total_amount?.toLocaleString() ?? "—"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={handleDecline}
            disabled={declining}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-50"
          >
            {declining ? "Declining…" : "Decline"}
          </button>
          <button
            onClick={handleAccept}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
          >
            <CheckCircle size={15} />
            {loading ? "Accepting…" : "Accept"}
          </button>
        </div>
      </div>
    </div>
  )
}
