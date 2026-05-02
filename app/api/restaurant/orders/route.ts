import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function makeClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

async function getRestaurantId(req: Request): Promise<{ restaurantId: string; token: string; err: NextResponse | null }> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return { restaurantId: "", token: "", err: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const supabase = makeClient(token)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return { restaurantId: "", token: "", err: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .single()

  if (!restaurant) return { restaurantId: "", token: "", err: NextResponse.json({ error: "Restaurant not found" }, { status: 404 }) }
  return { restaurantId: restaurant.id, token, err: null }
}

export async function GET(req: Request) {
  try {
    const { restaurantId, token, err } = await getRestaurantId(req)
    if (err) return err

    const { data: orders, error } = await makeClient(token)
      .from("orders")
      .select(`
        id,
        status,
        total_amount,
        created_at,
        users ( name ),
        addresses ( street, city ),
        order_items (
          id,
          quantity,
          price_at_order,
          menu_items ( name )
        )
      `)
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(orders ?? [])
  } catch (e: unknown) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { restaurantId, token, err } = await getRestaurantId(req)
    if (err) return err

    const { orderId, status } = await req.json()

    const allowed = ["confirmed", "preparing", "ready", "cancelled"]
    if (!orderId || !allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid order ID or status" }, { status: 400 })
    }

    const { data, error } = await makeClient(token)
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .eq("restaurant_id", restaurantId)
      .select("id, status")
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    return NextResponse.json(data)
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 })
  }
}
