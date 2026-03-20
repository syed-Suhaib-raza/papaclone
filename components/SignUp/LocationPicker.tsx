// components/SignUp/LocationPicker.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, CheckCircle2, AlertCircle, Loader2, Search } from "lucide-react"

interface LocationPickerProps {
  onLocationSelect: (data: {
    address:   string
    latitude:  number
    longitude: number
  }) => void
}

// ── Nominatim search (free OpenStreetMap geocoding) ──────
async function searchAddress(query: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=pk`,
    { headers: { "Accept-Language": "en" } }
  )
  return res.json()
}

// ── Reverse geocode lat/lng → address ────────────────────
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
    { headers: { "Accept-Language": "en" } }
  )
  const data = await res.json()
  return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}

export default function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const mapRef       = useRef<HTMLDivElement>(null)
  const mapInstance  = useRef<any>(null)
  const markerRef    = useRef<any>(null)
  const leafletRef   = useRef<any>(null)

  const [query,      setQuery]      = useState("")
  const [results,    setResults]    = useState<any[]>([])
  const [searching,  setSearching]  = useState(false)
  const [selected,   setSelected]   = useState<{ address: string; lat: number; lng: number } | null>(null)
  const [error,      setError]      = useState("")
  const [mapLoaded,  setMapLoaded]  = useState(false)

  // ── Load Leaflet dynamically (avoids SSR issues) ─────────
  useEffect(() => {
    if (typeof window === "undefined") return

    // Fix Leaflet default marker icon path issue in Next.js
    import("leaflet").then(L => {
      leafletRef.current = L.default || L

      // Fix marker icons
      delete (leafletRef.current.Icon.Default.prototype as any)._getIconUrl
      leafletRef.current.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      setMapLoaded(true)
    })

    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link")
      link.id   = "leaflet-css"
      link.rel  = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)
    }
  }, [])

  // ── Init map once Leaflet loaded ──────────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstance.current) return

    const L = leafletRef.current

    // Default center: Karachi
    const map = L.map(mapRef.current).setView([24.8607, 67.0011], 13)

    // OpenStreetMap tiles — completely free
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    mapInstance.current = map

    // Click on map → drop marker + reverse geocode
    map.on("click", async (e: any) => {
      const { lat, lng } = e.latlng
      placeMarker(lat, lng)
      const address = await reverseGeocode(lat, lng)
      setQuery(address)
      setResults([])
      const result = { address, lat, lng }
      setSelected(result)
      onLocationSelect({ address, latitude: lat, longitude: lng })
    })
  }, [mapLoaded, onLocationSelect])

  // ── Place/move marker on map ──────────────────────────────
  function placeMarker(lat: number, lng: number) {
    const L = leafletRef.current
    const map = mapInstance.current
    if (!L || !map) return

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map)

      // Drag marker → reverse geocode
      markerRef.current.on("dragend", async () => {
        const pos = markerRef.current.getLatLng()
        const address = await reverseGeocode(pos.lat, pos.lng)
        setQuery(address)
        setResults([])
        setSelected({ address, lat: pos.lat, lng: pos.lng })
        onLocationSelect({ address, latitude: pos.lat, longitude: pos.lng })
      })
    }

    map.setView([lat, lng], 17)
  }

  // ── Search handler ────────────────────────────────────────
  async function handleSearch() {
    if (!query.trim()) return
    setSearching(true); setError(""); setResults([])
    try {
      const data = await searchAddress(query)
      if (data.length === 0) {
        setError("No results found. Try a more specific address.")
      } else {
        setResults(data)
      }
    } catch {
      setError("Search failed. Check your internet connection.")
    } finally {
      setSearching(false)
    }
  }

  // ── Select a search result ────────────────────────────────
  function handleSelect(place: any) {
    const lat  = parseFloat(place.lat)
    const lng  = parseFloat(place.lon)
    const address = place.display_name
    placeMarker(lat, lng)
    setQuery(address)
    setResults([])
    setSelected({ address, lat, lng })
    onLocationSelect({ address, latitude: lat, longitude: lng })
  }

  return (
    <div className="flex flex-col gap-2">

      {/* Search input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"/>
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setResults([]) }}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleSearch())}
            placeholder="Search address in Pakistan..."
            className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all
              bg-muted border border-input text-foreground
              focus:border-primary/70 placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-input
            bg-muted text-foreground text-xs font-bold hover:bg-accent transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {searching
            ? <Loader2 size={13} className="animate-spin"/>
            : <Search size={13}/>
          }
          {searching ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Search results dropdown */}
      {results.length > 0 && (
        <div className="border border-input rounded-xl overflow-hidden bg-background shadow-lg">
          {results.map((place, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(place)}
              className="w-full text-left px-3 py-2.5 text-xs text-foreground
                hover:bg-muted transition-colors border-b border-input last:border-0
                flex items-start gap-2"
            >
              <MapPin size={11} className="text-primary shrink-0 mt-0.5"/>
              <span className="line-clamp-2">{place.display_name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle size={12}/> {error}
        </p>
      )}

      {/* Map */}
      <div
        ref={mapRef}
        className="w-full rounded-xl overflow-hidden border border-input"
        style={{ height: "240px", zIndex: 0 }}
      />

      {/* Helper text */}
      {!selected && (
        <p className="text-[11px] text-muted-foreground">
          Search an address or click anywhere on the map to drop a pin. You can also drag the pin to adjust.
        </p>
      )}

      {/* Selected confirmation */}
      {selected && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
          <CheckCircle2 size={13} className="text-green-500 shrink-0 mt-0.5"/>
          <div>
            <p className="text-[11px] font-black text-green-600 dark:text-green-400">Location selected ✓</p>
            <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{selected.address}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}