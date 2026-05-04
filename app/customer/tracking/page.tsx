"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Phone } from "lucide-react"
import { io, Socket } from "socket.io-client"
import { supabase } from "@/lib/supaBaseClient"
import Sidebar from "@/components/Cusdashboard/Sidebar"
import Navbar from "@/components/Cusdashboard/Navbar"
import RatingPopup from "@/components/Customer/RatingPopup"

interface OrderTracking {
  id: string
  status: string
  rider_id: string | null
  restaurant_id: string | null
  restaurants: { name: string; latitude: number; longitude: number } | null
  addresses: { street: string; city: string; latitude: number | null; longitude: number | null } | null
  deliveries: { accepted_at: string | null; status: string }[] | null
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Restaurant Confirmed",
  preparing: "Preparing Your Food",
  ready: "Ready for Pickup",
  picked_up: "Rider Picked Up",
  delivered: "Delivered!",
  cancelled: "Cancelled",
}

const STATUS_STEPS = ["pending", "confirmed", "preparing", "ready", "picked_up", "delivered"]


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

export default function TrackingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get("orderId")

  const [order, setOrder] = useState<OrderTracking | null>(null)
  const [riderContact, setRiderContact] = useState<{ name: string; phone: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRatingPopup, setShowRatingPopup] = useState(false)
  const [riderLat, setRiderLat] = useState<number | null>(null)
  const [riderLng, setRiderLng] = useState<number | null>(null)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const riderMarkerRef = useRef<any>(null)
  const socketRef = useRef<Socket | null>(null)

  // Fetch order details
  useEffect(() => {
    if (!orderId) return

    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch("/api/customer/orders", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) return

      const orders = await res.json()
      const found = orders.find((o: any) => o.id === orderId) ?? null
      setOrder(found)
      setLoading(false)

      if (found?.status === "delivered" && !localStorage.getItem(`reviewed_${orderId}`)) {
        setShowRatingPopup(true)
      }

      if (found?.rider_id) {
        const { data: riderData } = await supabase
          .from("riders")
          .select("name, phone")
          .eq("id", found.rider_id)
          .single()
        if (riderData) setRiderContact(riderData)
      }
    }

    load()
  }, [orderId])

  // Connect to Socket.io for live rider location
  useEffect(() => {
    if (!orderId || !order?.rider_id) return

    const socket = io({ path: "/socket.io" })
    socketRef.current = socket

    socket.on("connect", () => {
      socket.emit("join-order-tracking", orderId)
    })

    socket.on("rider-location", ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      setRiderLat(latitude)
      setRiderLng(longitude)
    })

    // Initial fetch of rider location from DB as starting point
    supabase
      .from("rider_locations")
      .select("latitude, longitude")
      .eq("rider_id", order.rider_id)
      .single()
      .then(({ data }) => {
        if (data) {
          setRiderLat(data.latitude)
          setRiderLng(data.longitude)
        }
      })

    return () => { socket.disconnect() }
  }, [orderId, order?.rider_id])

  // Update rider marker when location changes
  useEffect(() => {
    if (riderLat == null || riderLng == null || !riderMarkerRef.current) return
    riderMarkerRef.current.setLatLng([riderLat, riderLng])
  }, [riderLat, riderLng])

  // Poll for order status changes to detect delivery in real time
  useEffect(() => {
    if (!orderId || order?.status === "delivered") return
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch("/api/customer/orders", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) return
      const orders = await res.json()
      const found = orders.find((o: any) => o.id === orderId) ?? null
      if (!found) return
      setOrder(found)
      if (found.status === "delivered" && !localStorage.getItem(`reviewed_${orderId}`)) {
        setShowRatingPopup(true)
      }
    }, 15_000)
    return () => clearInterval(interval)
  }, [orderId, order?.status])

  // Build map once order is loaded
  useEffect(() => {
    if (!order || !mapRef.current || mapInstance.current) return

    const restaurant = order.restaurants
    const address = order.addresses
    if (!restaurant) return

    async function buildMap() {
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

      const isDark = document.documentElement.classList.contains("dark")
      const midLat = (restaurant!.latitude + dropoffLat) / 2
      const midLng = (restaurant!.longitude + dropoffLng) / 2

      const map = Leaflet.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([midLat, midLng], 14)

      Leaflet.tileLayer(
        isDark
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "© OpenStreetMap", maxZoom: 19 }
      ).addTo(map)

      const greenIcon = Leaflet.divIcon({
        html: `<div style="width:28px;height:28px;background:#22c55e;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:14px;display:flex;align-items:center;justify-content:center;">🍽️</div>`,
        className: "", iconSize: [28, 28], iconAnchor: [14, 14],
      })
      const blueIcon = Leaflet.divIcon({
        html: `<div style="width:28px;height:28px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.5);font-size:14px;display:flex;align-items:center;justify-content:center;">📍</div>`,
        className: "", iconSize: [28, 28], iconAnchor: [14, 14],
      })
      const riderIcon = Leaflet.divIcon({
        html: `<div style="width:32px;height:32px;background:#f97316;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(249,115,22,0.5);font-size:16px;display:flex;align-items:center;justify-content:center;">🛵</div>`,
        className: "", iconSize: [32, 32], iconAnchor: [16, 16],
      })

      Leaflet.marker([restaurant!.latitude, restaurant!.longitude], { icon: greenIcon })
        .addTo(map).bindPopup(`<b>${restaurant!.name}</b>`)

      Leaflet.marker([dropoffLat, dropoffLng], { icon: blueIcon })
        .addTo(map).bindPopup(`<b>Your Address</b><br>${address?.street ?? ""}, ${address?.city ?? ""}`)

      fetch(
        `https://router.project-osrm.org/route/v1/driving/${restaurant!.longitude},${restaurant!.latitude};${dropoffLng},${dropoffLat}?overview=full&geometries=geojson`
      )
        .then((r) => r.json())
        .then((routeData) => {
          const coords = routeData?.routes?.[0]?.geometry?.coordinates
          if (!coords) return
          const latLngs = coords.map(([lng, lat]: [number, number]) => [lat, lng])
          Leaflet.polyline(latLngs, { color: "#f97316", weight: 4, opacity: 0.7 }).addTo(map)
          map.fitBounds(Leaflet.latLngBounds(latLngs), { padding: [40, 40] })
        })
        .catch(() => {
          Leaflet.polyline(
            [[restaurant!.latitude, restaurant!.longitude], [dropoffLat, dropoffLng]],
            { color: "#f97316", weight: 3, opacity: 0.6, dashArray: "8 6" }
          ).addTo(map)
        })

      if (order.rider_id) {
        riderMarkerRef.current = Leaflet.marker(
          [riderLat ?? restaurant!.latitude, riderLng ?? restaurant!.longitude],
          { icon: riderIcon }
        ).addTo(map).bindPopup("Your Rider")
      }

      mapInstance.current = map
    }

    buildMap()

  }, [order])

  if (!orderId) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Navbar />
          <div className="p-8 text-center text-muted-foreground">No order ID provided.</div>
        </div>
      </div>
    )
  }

  const currentStep = STATUS_STEPS.indexOf(order?.status ?? "pending")

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      {order && (
        <RatingPopup
          open={showRatingPopup}
          orderId={order.id}
          restaurantId={order.restaurant_id ?? ""}
          restaurantName={order.restaurants?.name ?? "the restaurant"}
          riderId={order.rider_id}
          riderName={riderContact?.name ?? null}
          onClose={() => setShowRatingPopup(false)}
        />
      )}
      <div className="flex-1 ml-64 flex flex-col overflow-hidden">
        <Navbar />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border bg-card flex items-center gap-4 shrink-0">
            <button
              onClick={() => router.push("/customer/orders")}
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold">Track Order</h1>
              <p className="text-xs text-muted-foreground">Order #{orderId?.slice(0, 8)}</p>
            </div>
            {riderContact && (
              <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full">
                <Phone size={14} className="text-muted-foreground shrink-0" />
                <div className="text-sm leading-tight">
                  <span className="font-medium">{riderContact.name}</span>
                  {riderContact.phone && (
                    <span className="text-muted-foreground ml-1.5">{riderContact.phone}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center flex-1">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-1 overflow-hidden">
              {/* Map */}
              <div className="flex-1 relative">
                <div ref={mapRef} className="absolute inset-0" style={{ zIndex: 0 }} />
              </div>

              {/* Side panel */}
              <div className="w-72 shrink-0 border-l border-border bg-card overflow-y-auto">
                <div className="p-5 space-y-6">
                  {/* Status */}
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-3">Order Status</p>
                    <div className="space-y-2">
                      {STATUS_STEPS.map((step, i) => {
                        const done = i <= currentStep
                        const active = i === currentStep
                        return (
                          <div key={step} className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full shrink-0 transition-colors ${
                              active ? "bg-primary ring-2 ring-primary/30" :
                              done ? "bg-green-500" : "bg-muted-foreground/30"
                            }`} />
                            <p className={`text-sm transition-colors ${
                              active ? "text-primary font-semibold" :
                              done ? "text-foreground" : "text-muted-foreground"
                            }`}>
                              {STATUS_LABELS[step]}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Route</p>
                    <div className="flex gap-3 items-start">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 border-2 border-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Restaurant</p>
                        <p className="text-sm text-foreground">{order?.restaurants?.name ?? "—"}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 border-2 border-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">Your Address</p>
                        <p className="text-sm text-foreground">
                          {order?.addresses ? `${order.addresses.street}, ${order.addresses.city}` : "—"}
                        </p>
                      </div>
                    </div>
                    {order?.rider_id && (
                      <div className="flex gap-3 items-start">
                        <div className="w-5 h-5 rounded-full bg-orange-500/20 border-2 border-orange-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground">Rider</p>
                          <p className="text-sm text-foreground">
                            {riderLat != null ? "Live tracking active" : "Awaiting location…"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delivered state */}
                  {order?.status === "delivered" && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                      <p className="text-green-600 font-bold text-sm">Your order has been delivered!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
