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

    const [{ data: deliveries, error: delError }, { data: reviews, error: revError }] = await Promise.all([
      supabase
        .from("deliveries")
        .select("id, pickup_time, delivery_time, orders(id, total_amount)")
        .eq("rider_id", user.id),
      supabase
        .from("rider_reviews")
        .select("rating, created_at")
        .eq("rider_id", user.id),
    ])

    if (delError) return NextResponse.json({ error: delError.message }, { status: 500 })
    if (revError) return NextResponse.json({ error: revError.message }, { status: 500 })

    // Fetch commissions separately to avoid unreliable 3-level PostgREST
    // nested joins, then attach them to each delivery in the response.
    const orderIds = (deliveries ?? []).map((d) => (d.orders as any)?.id).filter(Boolean)
    let commissionMap = new Map<string, number>()
    if (orderIds.length > 0) {
      const { data: commissions } = await supabase
        .from("commissions")
        .select("order_id, commission_amount")
        .in("order_id", orderIds)
      commissionMap = new Map((commissions ?? []).map((c) => [c.order_id, Number(c.commission_amount ?? 0)]))
    }

    const enrichedDeliveries = (deliveries ?? []).map((d) => {
      const orderId = (d.orders as any)?.id
      return {
        ...d,
        orders: d.orders ? {
          ...(d.orders as any),
          commissions: commissionMap.has(orderId)
            ? [{ commission_amount: commissionMap.get(orderId) }]
            : [],
        } : null,
      }
    })

    return NextResponse.json({
      deliveries: enrichedDeliveries,
      reviews: reviews ?? [],
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
