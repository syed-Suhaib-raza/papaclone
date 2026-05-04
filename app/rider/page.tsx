"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { io, Socket } from "socket.io-client"
import StatsCard from "@/components/Rider/Cards/StatsCard"
import DeliveryNotificationPopup, { PendingDelivery } from "@/components/Rider/DeliveryNotificationPopup"
import { Bike, Package, Banknote, ChevronRight, Power, Timer } from "lucide-react"
import { supabase } from "@/lib/supaBaseClient"

export default function RiderDashboard() {
  const router = useRouter()
  const socketRef = useRef<Socket | null>(null)
  const [active, setActive] = useState<number | null>(null)
  const [completedToday, setCompletedToday] = useState<number | null>(null)
  const [todaysEarnings, setTodaysEarnings] = useState<number | null>(null)
  const [avgDeliveryMins, setAvgDeliveryMins] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [riderStatus, setRiderStatus] = useState<"active" | "inactive">("inactive")
  const [statusToggling, setStatusToggling] = useState(false)
  const [pendingDelivery, setPendingDelivery] = useState<PendingDelivery | null>(null)
  const [activeDeliveries, setActiveDeliveries] = useState<PendingDelivery[]>([])
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval> | null = null

    function getDismissed(): Set<string> {
      try { return new Set(JSON.parse(sessionStorage.getItem("dismissed-deliveries") ?? "[]")) }
      catch { return new Set() }
    }

    async function fetchDeliveries(token: string) {
      const res = await fetch("/api/rider/deliveries", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const deliveries: PendingDelivery[] = await res.json()
      setActiveDeliveries(deliveries)
      const dismissed = getDismissed()
      const assigned = deliveries.find((d: any) => d.status === "assigned" && !dismissed.has(d.id))
      if (assigned) setPendingDelivery((prev) => prev ?? assigned)
    }

    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setSessionToken(session.access_token)

      try {
        const res = await fetch("/api/rider", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setActive(data.active)
        setCompletedToday(data.completedToday)
        setTodaysEarnings(data.todaysEarnings)
        setAvgDeliveryMins(data.avgDeliveryMins ?? null)
        setRiderStatus(data.riderStatus ?? "inactive")
      } catch (err) {
        console.error("Rider dashboard error:", err)
      } finally {
        setLoading(false)
      }

      // Show popup immediately if there is already an assigned delivery waiting
      await fetchDeliveries(session.access_token)

      // Connect to Socket.io and join the rider's personal room
      const socket = io({ path: "/socket.io" })
      socketRef.current = socket

      socket.on("connect", () => {
        console.log("[socket] connected, id:", socket.id)
        socket.emit("join-rider", session.user.id)
        console.log("[socket] emitted join-rider for:", session.user.id)
      })

      socket.on("connect_error", (err) => {
        console.error("[socket] connection error:", err.message)
      })

      // When the server pushes a new delivery assignment, show the popup instantly
      socket.on("new-delivery", (delivery: PendingDelivery) => {
        console.log("[socket] received new-delivery:", delivery)
        setActiveDeliveries((prev) => {
          const exists = prev.some((d) => d.id === delivery.id)
          return exists ? prev : [delivery, ...prev]
        })
        setActive((prev) => (prev ?? 0) + 1)
        setPendingDelivery(delivery)
      })

      // Polling as a safety net in case the socket event is missed
      pollInterval = setInterval(() => fetchDeliveries(session.access_token), 15000)
    }

    load()

    return () => {
      socketRef.current?.disconnect()
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [])

  async function toggleStatus() {
    if (!sessionToken || statusToggling) return
    const next = riderStatus === "active" ? "inactive" : "active"
    setStatusToggling(true)
    try {
      const res = await fetch("/api/rider", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ status: next }),
      })
      if (res.ok) setRiderStatus(next)
    } finally {
      setStatusToggling(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rider Dashboard</h2>
          <p className="text-muted-foreground text-sm">Live overview of your deliveries</p>
        </div>

        {/* Status toggle */}
        <button
          onClick={toggleStatus}
          disabled={statusToggling || loading}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-all disabled:opacity-50 ${
            riderStatus === "active"
              ? "bg-green-500/10 border-green-500/40 text-green-600 hover:bg-green-500/20"
              : "bg-muted border-border text-muted-foreground hover:text-foreground hover:bg-muted/80"
          }`}
        >
          {/* Track */}
          <div className={`relative w-10 h-5 rounded-full transition-colors ${riderStatus === "active" ? "bg-green-500" : "bg-muted-foreground/40"}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${riderStatus === "active" ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
          <Power size={14} />
          {statusToggling ? "Updating…" : riderStatus === "active" ? "Active" : "Inactive"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Active Deliveries"
          value={loading ? "—" : active ?? 0}
          icon={<Bike size={28} />}
          color="orange"
          description="Currently in progress"
        />

        <StatsCard
          title="Completed Today"
          value={loading ? "—" : completedToday ?? 0}
          icon={<Package size={28} />}
          color="blue"
          description="Delivered so far today"
        />

        <StatsCard
          title="Today's Earnings"
          value={loading ? "—" : `PKR ${(todaysEarnings ?? 0).toLocaleString()}`}
          icon={<Banknote size={28} />}
          color="green"
          description="Based on completed deliveries"
        />

        <StatsCard
          title="Avg Delivery Time"
          value={loading ? "—" : avgDeliveryMins != null ? `${avgDeliveryMins} min` : "—"}
          icon={<Timer size={28} />}
          color="blue"
          description="Pickup to doorstep, all time"
        />
      </div>

      {/* Active deliveries list */}
      {activeDeliveries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Active Deliveries</h3>
          <div className="grid gap-3">
            {activeDeliveries.map((delivery) => {
              const address = delivery.orders?.addresses
              return (
                <button
                  key={delivery.id}
                  onClick={() => router.push(`/rider/deliveries/${delivery.id}`)}
                  className="w-full bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {delivery.orders?.restaurants?.name ?? "Restaurant"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      → {address?.street ?? "—"}, {address?.city ?? ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <span className="text-sm font-bold text-green-600">
                      PKR {delivery.orders?.total_amount?.toLocaleString()}
                    </span>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Incoming delivery popup */}
      {pendingDelivery && (
        <DeliveryNotificationPopup
          delivery={pendingDelivery}
          onDismiss={(id) => {
            try {
              const prev = JSON.parse(sessionStorage.getItem("dismissed-deliveries") ?? "[]")
              sessionStorage.setItem("dismissed-deliveries", JSON.stringify([...prev, id]))
            } catch {}
            setPendingDelivery(null)
          }}
        />
      )}
    </div>
  )
}
