"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/Cusdashboard/Sidebar"
import Navbar from "@/components/Cusdashboard/Navbar"
import RestaurantCard from "@/components/Cusdashboard/Restaurantcard"
import { supabase } from "@/lib/supaBaseClient"

export default function Dashboard() {

  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="flex">

      <Sidebar/>

      <div className="flex-1">

        <Navbar/>

        <div className="p-6 grid grid-cols-3 gap-6">

          {loading && <p>Loading restaurants...</p>}

          {!loading && restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
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