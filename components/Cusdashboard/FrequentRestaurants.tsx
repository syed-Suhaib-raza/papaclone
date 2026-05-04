"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supaBaseClient"

interface MenuItem {
  id: string
  name: string
  price: number
  image_url: string | null
  available: boolean
  categories: { name: string } | null
}

interface FrequentRestaurant {
  id: string
  name: string
  description: string | null
  image_url: string | null
  rating: number
  menu: MenuItem[]
}

export default function FrequentRestaurants() {
  const [restaurants, setRestaurants] = useState<FrequentRestaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) { setLoading(false); return }

        const res = await fetch("/api/customer/frequent-restaurants", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (!res.ok) { setLoading(false); return }

        const data = await res.json()
        setRestaurants(Array.isArray(data) ? data : [])
      } catch {
        // silently hide if anything fails
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading || restaurants.length === 0) return null

  return (
    <section className="px-6 pt-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">⚡</span>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Your Favourites
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {restaurants.map((r) => (
          <div key={r.id} className="border rounded-xl bg-card overflow-hidden">
            <Link href={`/customer/restaurants/${r.id}`} className="block hover:opacity-90 transition">
              {r.image_url && (
                <img src={r.image_url} alt={r.name} className="w-full h-32 object-cover" />
              )}
              <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <h3 className="font-semibold text-sm">{r.name}</h3>
                <span className="text-xs flex items-center gap-1">
                  ⭐ {r.rating || "New"}
                </span>
              </div>
            </Link>

            {r.menu.filter((i) => i.available).slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-2 border-t border-border">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.name}</p>
                  {item.categories && (
                    <p className="text-xs text-muted-foreground">{item.categories.name}</p>
                  )}
                </div>
                <span className="text-xs font-semibold shrink-0">
                  PKR {item.price?.toLocaleString()}
                </span>
              </div>
            ))}

            <div className="px-4 py-3">
              <Link
                href={`/customer/restaurants/${r.id}`}
                className="text-xs text-primary font-medium hover:underline"
              >
                View full menu →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
