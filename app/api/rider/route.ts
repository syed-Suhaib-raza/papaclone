import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function makeClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

export async function PATCH(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = makeClient(token)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { status } = await req.json()
    if (status !== "active" && status !== "inactive") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("riders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", user.id)
      .select("id, status")
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = makeClient(token)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [{ data: riderData }, { data: deliveries, error }] = await Promise.all([
      supabase.from("riders").select("status").eq("id", user.id).single(),
      supabase.from("deliveries").select("id, status, pickup_time, delivery_time, orders(total_amount, status)").eq("rider_id", user.id),
    ])

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const all = deliveries ?? []

    const active = all.filter((d) =>
      !["delivered", "cancelled"].includes((d as any).orders?.status ?? "") &&
      d.status !== "delivered"
    ).length

    const completedToday = all.filter((d) => {
      if (d.status !== "delivered" || !d.delivery_time) return false
      return new Date(d.delivery_time) >= today
    }).length

    const todaysEarnings = all
      .filter((d) => {
        if (d.status !== "delivered" || !d.delivery_time) return false
        return new Date(d.delivery_time) >= today
      })
      .reduce((sum, d) => sum + Number((d as any).orders?.total_amount ?? 0), 0)

    const completedWithTimes = all.filter(
      (d) => d.status === "delivered" && d.pickup_time && d.delivery_time
    )
    const avgDeliveryMins = completedWithTimes.length > 0
      ? Math.round(
          completedWithTimes.reduce((sum, d) =>
            sum + (new Date(d.delivery_time!).getTime() - new Date(d.pickup_time!).getTime()), 0
          ) / completedWithTimes.length / 60000
        )
      : null

    return NextResponse.json({ active, completedToday, todaysEarnings, avgDeliveryMins, riderStatus: riderData?.status ?? "inactive" })
  } catch (e: unknown) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
