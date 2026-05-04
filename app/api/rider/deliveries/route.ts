import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function makeClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

async function getRiderId(req: Request): Promise<{ riderId: string; token: string; err: NextResponse | null }> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return { riderId: "", token: "", err: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const supabase = makeClient(token)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return { riderId: "", token: "", err: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  return { riderId: user.id, token, err: null }
}

export async function GET(req: Request) {
  try {
    const { riderId, token, err } = await getRiderId(req)
    if (err) return err

    const supabase = makeClient(token)
    const { searchParams } = new URL(req.url)
    const past = searchParams.get("past") === "1"

    let query = supabase
      .from("deliveries")
      .select(`
        id,
        status,
        accepted_at,
        pickup_time,
        delivery_time,
        orders (
          id,
          status,
          total_amount,
          created_at,
          restaurants ( id, name, latitude, longitude ),
          addresses ( street, city, latitude, longitude ),
          users ( name, phone )
        )
      `)
      .eq("rider_id", riderId)

    if (past) {
      query = query.in("status", ["delivered", "cancelled", "declined"])
        .order("delivery_time", { ascending: false })
    } else {
      query = query.not("status", "in", '("delivered","completed","cancelled","declined")')
        .order("pickup_time", { ascending: false })
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { riderId, token, err } = await getRiderId(req)
    if (err) return err

    const { deliveryId, status } = await req.json()
    if (!deliveryId || !status) {
      return NextResponse.json({ error: "Missing deliveryId or status" }, { status: 400 })
    }

    const allowed = ["accepted", "picked_up", "delivered", "declined", "cancelled"]
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const supabase = makeClient(token)

    const updates: Record<string, unknown> = { status }
    if (status === "accepted") updates.accepted_at = new Date().toISOString()
    if (status === "picked_up") updates.pickup_time = new Date().toISOString()
    if (status === "delivered") updates.delivery_time = new Date().toISOString()

    const { data: delivery, error: deliveryError } = await supabase
      .from("deliveries")
      .update(updates)
      .eq("id", deliveryId)
      .eq("rider_id", riderId)
      .select("id, status, orders(id, total_amount, restaurant_id)")
      .single()

    if (deliveryError) return NextResponse.json({ error: deliveryError.message }, { status: 500 })
    if (!delivery) return NextResponse.json({ error: "Delivery not found" }, { status: 404 })

    // Sync order status
    const order = delivery.orders as any
    const orderId = order?.id
    if (orderId) {
      const orderStatusMap: Record<string, string> = {
        picked_up: "picked_up",
        delivered: "delivered",
        cancelled: "ready",   // revert order to ready so it can be reassigned
      }
      const orderStatus = orderStatusMap[status]
      if (orderStatus) {
        const orderUpdate: Record<string, unknown> = { status: orderStatus }
        if (status === "cancelled") orderUpdate.rider_id = null
        await supabase.from("orders").update(orderUpdate).eq("id", orderId)
      }
    }

    // Record rider commission on delivery completion
    if (status === "delivered" && orderId && order?.restaurant_id && order?.total_amount) {
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("commission_percentage")
        .eq("id", order.restaurant_id)
        .single()

      const pct = Number(restaurant?.commission_percentage ?? 0)
      if (pct > 0) {
        const commissionAmount = Number(order.total_amount) * pct
        const { data: existing } = await supabase
          .from("commissions")
          .select("id")
          .eq("order_id", orderId)
          .maybeSingle()

        if (!existing) {
          await supabase
            .from("commissions")
            .insert({ order_id: orderId, commission_amount: commissionAmount })
        }
      }
    }

    return NextResponse.json(delivery)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
