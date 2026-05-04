import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cacheGet, cacheSet } from "@/lib/redis"

const MENU_TTL = 3600      // 1 hour
const CUSTOMER_TTL = 86400 // 24 hours

function makeClient(token?: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : undefined
  )
}

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  available: boolean
  category_id: string | null
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchRestaurantWithMenu(supabase: any, restaurantId: string): Promise<FrequentRestaurant | null> {
  const { data: rest } = await supabase
    .from("restaurants")
    .select("id, name, description, image_url, rating")
    .eq("id", restaurantId)
    .single()

  if (!rest) return null

  const menuKey = `restaurant:${restaurantId}:menu`
  let menu = await cacheGet<MenuItem[]>(menuKey)

  if (!menu) {
    const { data: items } = await supabase
      .from("menu_items")
      .select("id, name, description, price, image_url, available, category_id, categories(name)")
      .eq("restaurant_id", restaurantId)
      .order("name")
    menu = (items as MenuItem[]) ?? []
    await cacheSet(menuKey, menu, MENU_TTL)
  }

  const restData = rest as { id: string; name: string; description: string | null; image_url: string | null; rating: number }
  return { ...restData, menu }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader) return NextResponse.json({ error: "No auth token" }, { status: 401 })

    const token = authHeader.replace("Bearer ", "")
    const supabase = makeClient(token)

    const { data: authData, error: authError } = await supabase.auth.getUser(token)
    if (authError || !authData.user)
      return NextResponse.json({ error: "Invalid user" }, { status: 401 })

    const userId = authData.user.id
    const customerKey = `customer:${userId}:frequent_restaurants`

    const cached = await cacheGet<FrequentRestaurant[]>(customerKey)
    if (cached) return NextResponse.json(cached)

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("restaurant_id")
      .eq("customer_id", userId)

    if (ordersError) return NextResponse.json({ error: ordersError.message }, { status: 500 })
    if (!orders || orders.length === 0) return NextResponse.json([])

    const freq: Record<string, number> = {}
    for (const o of orders) {
      if (o.restaurant_id) freq[o.restaurant_id] = (freq[o.restaurant_id] ?? 0) + 1
    }

    const top2Ids = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([id]) => id)

    if (top2Ids.length === 0) return NextResponse.json([])

    const results = await Promise.all(
      top2Ids.map((id) => fetchRestaurantWithMenu(supabase, id))
    )

    const payload = results.filter(Boolean) as FrequentRestaurant[]
    await cacheSet(customerKey, payload, CUSTOMER_TTL)

    return NextResponse.json(payload)
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 })
  }
}
