"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Clock, CheckCircle, Package, XCircle } from "lucide-react"
import { supabase } from "@/lib/supaBaseClient"

interface DeliveryDetails {
  id: string
  status: string
  accepted_at: string | null
  pickup_time: string | null
  delivery_time: string | null
  orders: {
    id: string
    status: string
    total_amount: number
    created_at: string
    restaurants: { id: string; name: string; latitude: number; longitude: number } | null
    addresses: { street: string; city: string; latitude: number | null; longitude: number | null } | null
    users: { name: string; phone: string } | null
  } | null
}

const STATUS_LABELS: Record<string, string> = {
  assigned: "Assigned",
  accepted: "Accepted",
  picked_up: "Picked Up",
  delivered: "Delivered",
}

const STATUS_STYLE: Record<string, string> = {
  assigned: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  accepted: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  picked_up: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  delivered: "bg-green-500/10 text-green-600 border-green-500/30",
}

function useTimer(startMs: number | null) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startMs) return
    const tick = () => setElapsed(Math.floor((Date.now() - startMs) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startMs])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

async function geocodeAddress(street: string, city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const q = city ? `${street}, ${city}` : street
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    if (data?.lat) return data
    if (city) {
      const res2 = await fetch(`/api/geocode?q=${encodeURIComponent(city)}`)
      const data2 = await res2.json()
      if (data2?.lat) return data2
    }
  } catch {}
  return null
}

export default function DeliveryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [delivery, setDelivery] = useState<DeliveryDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const riderMarkerRef = useRef<any>(null)
  const lastLocationPost = useRef<number>(0)
  const [timerStart, setTimerStart] = useState<number | null>(null)

  const timer = useTimer(timerStart)

  // Load delivery details
  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push("/rider"); return }
      setToken(session.access_token)

      const res = await fetch("/api/rider/deliveries", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) { router.push("/rider"); return }

      const deliveries: DeliveryDetails[] = await res.json()
      const found = deliveries.find((d) => d.id === id)
      if (!found) { router.push("/rider"); return }

      setDelivery(found)
      setLoading(false)

      // Timer starts from when the rider accepted — stored in DB
      const acceptedAt = found.accepted_at ? new Date(found.accepted_at).getTime() : Date.now()
      setTimerStart(acceptedAt)
    }
    load()
  }, [id, router])

  // Build map once delivery is loaded
  useEffect(() => {
    if (!delivery || !mapRef.current || mapInstance.current) return

    const restaurant = delivery.orders?.restaurants
    const address = delivery.orders?.addresses
    if (!restaurant) return

    async function buildMap() {
      // Resolve customer dropoff coordinates
      let dropoffLat: number = restaurant!.latitude - 0.01
      let dropoffLng: number = restaurant!.longitude + 0.01

      if (address?.latitude && address?.longitude) {
        dropoffLat = Number(address.latitude)
        dropoffLng = Number(address.longitude)
      } else if (address?.street && address?.city) {
        const geo = await geocodeAddress(address.street, address.city)
        if (geo) { dropoffLat = geo.lat; dropoffLng = geo.lng }
      }

      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link")
        link.id = "leaflet-css"
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      const L = await import("leaflet")
      const Leaflet = L.default || L

      if (!mapRef.current || mapInstance.current) return

      delete (Leaflet.Icon.Default.prototype as any)._getIconUrl
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const rLat = restaurant!.latitude
      const rLng = restaurant!.longitude
      const isDark = document.documentElement.classList.contains("dark")
      const midLat = (rLat + dropoffLat) / 2
      const midLng = (rLng + dropoffLng) / 2

      const map = Leaflet.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([midLat, midLng], 14)

      Leaflet.tileLayer(
        isDark
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "© OpenStreetMap", maxZoom: 19 }
      ).addTo(map)

      const greenIcon = Leaflet.divIcon({
        html: `<div style="width:28px;height:28px;background:#22c55e;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">🍽️</div>`,
        className: "", iconSize: [28, 28], iconAnchor: [14, 14],
      })
      const redIcon = Leaflet.divIcon({
        html: `<div style="width:28px;height:28px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">📍</div>`,
        className: "", iconSize: [28, 28], iconAnchor: [14, 14],
      })
      const blueIcon = Leaflet.divIcon({
        html: `<div style="width:32px;height:32px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.5);display:flex;align-items:center;justify-content:center;font-size:16px;">🛵</div>`,
        className: "", iconSize: [32, 32], iconAnchor: [16, 16],
      })

      Leaflet.marker([rLat, rLng], { icon: greenIcon })
        .addTo(map).bindPopup(`<b>${restaurant!.name}</b><br>Pickup`)

      Leaflet.marker([dropoffLat, dropoffLng], { icon: redIcon })
        .addTo(map).bindPopup(`<b>Customer</b><br>${address?.street ?? ""}, ${address?.city ?? ""}`)

      // Get current GPS position for initial rider marker placement
      let initRiderLat = rLat
      let initRiderLng = rLng
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { maximumAge: 10000, timeout: 5000 })
        )
        initRiderLat = pos.coords.latitude
        initRiderLng = pos.coords.longitude
      } catch {}

      riderMarkerRef.current = Leaflet.marker([initRiderLat, initRiderLng], { icon: blueIcon })
        .addTo(map).bindPopup("You")

      fetch(
        `https://router.project-osrm.org/route/v1/driving/${rLng},${rLat};${dropoffLng},${dropoffLat}?overview=full&geometries=geojson`
      )
        .then((r) => r.json())
        .then((routeData) => {
          const coords = routeData?.routes?.[0]?.geometry?.coordinates
          if (!coords) return
          const latLngs = coords.map(([lng, lat]: [number, number]) => [lat, lng])
          Leaflet.polyline(latLngs, { color: "#3b82f6", weight: 4, opacity: 0.8 }).addTo(map)
          map.fitBounds(Leaflet.latLngBounds(latLngs), { padding: [40, 40] })
        })
        .catch(() => {
          Leaflet.polyline(
            [[rLat, rLng], [dropoffLat, dropoffLng]],
            { color: "#3b82f6", weight: 3, opacity: 0.6, dashArray: "8 6" }
          ).addTo(map)
        })

      mapInstance.current = map
    }

    buildMap()
  }, [delivery])

  // Geolocation tracking
  const postLocation = useCallback(async (lat: number, lng: number) => {
    if (!token) return
    const now = Date.now()
    if (now - lastLocationPost.current < 5000) return
    lastLocationPost.current = now

    await fetch("/api/rider/location", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ latitude: lat, longitude: lng }),
    })
  }, [token])

  useEffect(() => {
    if (!delivery || delivery.status === "delivered") return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        // Update rider marker on map
        if (riderMarkerRef.current) {
          riderMarkerRef.current.setLatLng([latitude, longitude])
        }
        postLocation(latitude, longitude)
      },
      (err) => console.warn("Geolocation error:", err),
      { enableHighAccuracy: true, maximumAge: 3000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [delivery, postLocation])

  async function cancelDelivery() {
    if (!token || !delivery) return
    setCancelling(true)
    try {
      const res = await fetch("/api/rider/deliveries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ deliveryId: delivery.id, status: "cancelled" }),
      })
      if (res.ok) {
        try {
          const prev = JSON.parse(sessionStorage.getItem("dismissed-deliveries") ?? "[]")
          sessionStorage.setItem("dismissed-deliveries", JSON.stringify([...prev, delivery.id]))
        } catch {}
        router.push("/rider")
      }
    } finally {
      setCancelling(false)
      setShowCancelConfirm(false)
    }
  }

  async function updateStatus(newStatus: string) {
    if (!token || !delivery) return
    setUpdating(true)
    try {
      const res = await fetch("/api/rider/deliveries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ deliveryId: delivery.id, status: newStatus }),
      })
      if (res.ok) {
        setDelivery((prev) => prev ? { ...prev, status: newStatus } : prev)
        if (newStatus === "delivered") {
          setTimeout(() => router.push("/rider"), 1500)
        }
      }
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!delivery) return null

  const orderStatus = delivery.status
  const restaurant = delivery.orders?.restaurants
  const address = delivery.orders?.addresses
  const customer = delivery.orders?.users

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-6">
      {/* Top bar */}
      <div className="bg-card border-b border-border px-5 py-4 flex items-center gap-4 shrink-0 z-10">
        <button
          onClick={() => router.push("/rider")}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground truncate">
            {restaurant?.name ?? "Delivery"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {address?.street}, {address?.city}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Timer */}
          <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">
            <Clock size={14} className="text-muted-foreground" />
            <span className="text-sm font-mono font-bold">{timer}</span>
          </div>

          {/* Status */}
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[orderStatus] ?? "bg-muted text-muted-foreground border-border"}`}>
            {STATUS_LABELS[orderStatus] ?? orderStatus}
          </span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0" style={{ zIndex: 0 }} />
      </div>

      {/* Bottom panel */}
      <div className="bg-card border-t border-border p-5 space-y-4 shrink-0 z-10">
        {/* Customer info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Customer</p>
            <p className="text-sm font-semibold">{customer?.name ?? "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-medium">Order Total</p>
            <p className="text-sm font-bold text-green-600">
              PKR {delivery.orders?.total_amount?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        {orderStatus === "accepted" && (
          <button
            onClick={() => updateStatus("picked_up")}
            disabled={updating}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Package size={18} />
            {updating ? "Updating…" : "Mark as Picked Up"}
          </button>
        )}

        {orderStatus === "picked_up" && (
          <button
            onClick={() => updateStatus("delivered")}
            disabled={updating}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
          >
            <CheckCircle size={18} />
            {updating ? "Updating…" : "Mark as Delivered"}
          </button>
        )}

        {orderStatus === "delivered" && (
          <div className="w-full py-3.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 font-bold flex items-center justify-center gap-2">
            <CheckCircle size={18} />
            Delivery Complete!
          </div>
        )}

        {/* Cancel — available until delivered */}
        {!["delivered", "cancelled"].includes(orderStatus) && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            disabled={updating || cancelling}
            className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-500 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all disabled:opacity-50"
          >
            <XCircle size={16} />
            Cancel Delivery
          </button>
        )}
      </div>

      {/* Cancel confirmation dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 w-80 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <XCircle size={20} className="text-red-500" />
              </div>
              <div>
                <p className="font-bold text-foreground">Cancel Delivery?</p>
                <p className="text-xs text-muted-foreground">The order will be returned to the restaurant.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-all"
              >
                Go Back
              </button>
              <button
                onClick={cancelDelivery}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
