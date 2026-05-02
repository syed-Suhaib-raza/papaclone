"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Star, MapPin } from "lucide-react"
import Sidebar from "@/components/Cusdashboard/Sidebar"
import Navbar from "@/components/Cusdashboard/Navbar"
import { supabase } from "@/lib/supaBaseClient"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  available: boolean
  category_id: string
  categories: { name: string } | null
}

interface Restaurant {
  id: string
  name: string
  description: string
  image_url: string
  rating: number
  latitude: number
  longitude: number
}

function groupByCategory(items: MenuItem[]): Record<string, MenuItem[]> {
  return items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.categories?.name ?? "Uncategorized"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})
}

// ── Read-only Leaflet map showing restaurant pin ──────────────
function RestaurantMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const mapRef      = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  useEffect(() => {
    if (typeof window === "undefined" || mapInstance.current) return

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link")
      link.id   = "leaflet-css"
      link.rel  = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)
    }

    import("leaflet").then((L) => {
      const Leaflet = L.default || L

      delete (Leaflet.Icon.Default.prototype as any)._getIconUrl
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      if (!mapRef.current || mapInstance.current) return

      const isDark = document.documentElement.classList.contains("dark")
      const map = Leaflet.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([lat, lng], 15)

      Leaflet.tileLayer(
        isDark
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "© OpenStreetMap", maxZoom: 19 }
      ).addTo(map)

      Leaflet.marker([lat, lng]).addTo(map).bindPopup(name).openPopup()

      mapInstance.current = map
    })
  }, [lat, lng, name])

  return (
    <div
      ref={mapRef}
      className="w-full rounded-xl overflow-hidden border border-border"
      style={{ height: "220px", zIndex: 0 }}
    />
  )
}

export default function RestaurantMenuPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menuItems,  setMenuItems]  = useState<MenuItem[]>([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    if (!id) return

    async function fetchData() {
      const [{ data: rest, error: restErr }, { data: items, error: itemsErr }] = await Promise.all([
        supabase
          .from("restaurants")
          .select("id, name, description, image_url, rating, latitude, longitude")
          .eq("id", id)
          .single(),
        supabase
          .from("menu_items")
          .select("id, name, description, price, image_url, available, category_id, categories(name)")
          .eq("restaurant_id", id)
          .order("name"),
      ])

      if (restErr) console.error("Restaurant fetch error:", restErr)
      if (itemsErr) console.error("Menu items fetch error:", itemsErr)

      setRestaurant(rest ?? null)
      setMenuItems((items as MenuItem[]) ?? [])
      setLoading(false)
    }

    fetchData()
  }, [id])

  const grouped = groupByCategory(menuItems)

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Navbar />
          <div className="p-6 text-muted-foreground">Loading menu...</div>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Navbar />
          <div className="p-6 text-muted-foreground">Restaurant not found.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 min-h-screen ml-64">
        <Navbar />

        <div className="max-w-4xl mx-auto p-6 space-y-8">

          {/* Back */}
          <button
            onClick={() => router.push("/customer")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft size={16} />
            Back to restaurants
          </button>

          {/* Hero */}
          <div className="rounded-2xl overflow-hidden border border-border bg-card">
            {restaurant.image_url && (
              <img
                src={restaurant.image_url}
                alt={restaurant.name}
                className="w-full h-56 object-cover"
              />
            )}
            <div className="p-5">
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              {restaurant.description && (
                <p className="text-muted-foreground mt-1 text-sm">{restaurant.description}</p>
              )}
              <div className="flex items-center gap-1 mt-3 text-sm">
                <Star size={15} className="fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{restaurant.rating || "New"}</span>
              </div>
            </div>
          </div>

          {/* Map */}
          {restaurant.latitude && restaurant.longitude && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MapPin size={15} className="text-primary" />
                Location
              </div>
              <RestaurantMap
                lat={restaurant.latitude}
                lng={restaurant.longitude}
                name={restaurant.name}
              />
            </div>
          )}

          {/* Menu */}
          <div className="space-y-8">
            <h2 className="text-xl font-bold">Menu</h2>

            {menuItems.length === 0 && (
              <p className="text-muted-foreground text-sm">No menu items available yet.</p>
            )}

            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-base font-semibold text-primary border-b border-border pb-1">
                  {category}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex gap-4 border rounded-xl p-4 bg-card transition ${
                        !item.available ? "opacity-50" : "hover:shadow-sm"
                      }`}
                    >
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg shrink-0"
                        />
                      )}
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <p className="font-medium text-sm leading-snug">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-semibold">
                            PKR {item.price?.toLocaleString()}
                          </span>
                          {!item.available && (
                            <span className="text-xs text-destructive">Unavailable</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
