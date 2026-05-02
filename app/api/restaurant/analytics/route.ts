import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function makeClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = makeClient(token)

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .single()

    if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

    const [{ data: orders, error: ordersError }, { data: reviews, error: reviewsError }] = await Promise.all([
      supabase
        .from("orders")
        .select("id, created_at, total_amount, status")
        .eq("restaurant_id", restaurant.id),
      supabase
        .from("reviews")
        .select("rating, comment, created_at")
        .eq("restaurant_id", restaurant.id),
    ])

    if (ordersError) return NextResponse.json({ error: ordersError.message }, { status: 500 })
    if (reviewsError) return NextResponse.json({ error: reviewsError.message }, { status: 500 })

    const orderIds = (orders ?? []).map((o) => o.id)

    let items: any[] = []
    if (orderIds.length > 0) {
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("quantity, order_id, price_at_order, menu_items(name)")
        .in("order_id", orderIds)

      if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })
      items = itemsData ?? []
    }

    return NextResponse.json({
      orders: orders ?? [],
      reviews: reviews ?? [],
      items,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
