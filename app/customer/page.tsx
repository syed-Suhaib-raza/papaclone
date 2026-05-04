"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/Cusdashboard/Sidebar"
import Navbar from "@/components/Cusdashboard/Navbar"
import RestaurantCard from "@/components/Cusdashboard/Restaurantcard"
import FrequentRestaurants from "@/components/Cusdashboard/FrequentRestaurants"
import { supabase } from "@/lib/supaBaseClient"

type RatingFilter = "all" | "3+" | "4+"

const RATING_FILTERS: { label: string; value: RatingFilter }[] = [
  { label: "All", value: "all" },
  { label: "⭐ 4+", value: "4+" },
  { label: "⭐ 3+", value: "3+" },
]

export default function Dashboard() {

  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all")

  useEffect(() => {

    async function fetchRestaurants() {

      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, description, image_url, rating")

      if (error) {
        console.error("Error fetching restaurants:", error)
      } else {
        setRestaurants(data || [])
      }

      setLoading(false)
    }

    fetchRestaurants()

  }, [])

  const filtered = restaurants.filter((r) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      !query ||
      r.name?.toLowerCase().includes(query) ||
      r.description?.toLowerCase().includes(query)

    const rating = parseFloat(r.rating) || 0
    const matchesRating =
      ratingFilter === "all" ||
      (ratingFilter === "4+" && rating >= 4) ||
      (ratingFilter === "3+" && rating >= 3)

    return matchesSearch && matchesRating
  })

  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 ml-64">

        <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <FrequentRestaurants />

        {/* Filter chips */}
        <div className="px-6 pt-4 flex items-center gap-2">
          {RATING_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setRatingFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                ratingFilter === f.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
          {(searchQuery || ratingFilter !== "all") && (
            <span className="text-xs text-muted-foreground ml-2">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="p-6 grid grid-cols-3 gap-6">

          {loading && <p className="col-span-3 text-muted-foreground">Loading restaurants...</p>}

          {!loading && filtered.length === 0 && (
            <p className="col-span-3 text-muted-foreground text-center py-12">
              No restaurants found matching your search.
            </p>
          )}

          {!loading && filtered.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              id={restaurant.id}
              name={restaurant.name}
              description={restaurant.description}
              image={restaurant.image_url}
              rating={restaurant.rating}
            />
          ))}

        </div>

      </div>

    </div>
  )
}
