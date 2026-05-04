import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { emitToRider } from "@/lib/socketServer"

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

    const supabase = makeClient(token)

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .eq("restaurant_id", restaurantId)
      .select("id, status")
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    if (status === "ready") {
      assignRider(supabase, orderId).catch((e) => console.error("[assignRider] unhandled:", e))
    }

    return NextResponse.json(data)
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 })
  }
}

async function assignRider(supabase: ReturnType<typeof makeClient>, orderId: string) {
  try {
    const { data: busyRiders } = await supabase
      .from("deliveries")
      .select("rider_id")
      .not("status", "in", '("completed","cancelled","delivered","declined")')

    const busyIds = (busyRiders ?? []).map((r: any) => r.rider_id).filter(Boolean)

    let ridersQuery = supabase
      .from("riders")
      .select("id")
      .eq("status", "active")
      .limit(1)

    if (busyIds.length > 0) {
      ridersQuery = ridersQuery.not("id", "in", `(${busyIds.map((id: string) => `"${id}"`).join(",")})`)
    }

    const { data: availableRiders } = await ridersQuery
    if (!availableRiders || availableRiders.length === 0) return

    const riderId = availableRiders[0].id

    const { data: delivery } = await supabase
      .from("deliveries")
      .insert({ order_id: orderId, rider_id: riderId, status: "assigned" })
      .select("id")
      .single()

    await supabase.from("orders").update({ rider_id: riderId }).eq("id", orderId)

    if (!delivery) return

    const { data: full } = await supabase
      .from("deliveries")
      .select(`
        id, status,
        orders (
          id, total_amount, status,
          restaurants ( id, name, latitude, longitude ),
          addresses ( street, city, latitude, longitude ),
          users ( name, phone )
        )
      `)
      .eq("id", delivery.id)
      .single()

    if (full) emitToRider(riderId, "new-delivery", full)
  } catch (e) {
    console.error("[assignRider]", e)
  }
}
