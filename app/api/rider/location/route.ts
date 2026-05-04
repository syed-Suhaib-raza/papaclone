import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { emitToOrderTrackers } from "@/lib/socketServer"

function makeClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = makeClient(token)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { latitude, longitude } = await req.json()
    if (latitude == null || longitude == null) {
      return NextResponse.json({ error: "Missing coordinates" }, { status: 400 })
    }

    await supabase
      .from("rider_locations")
      .upsert({ rider_id: user.id, latitude, longitude, updated_at: new Date().toISOString() })

    // Find active delivery order so we can push location to the customer tracking room
    const { data: delivery } = await supabase
      .from("deliveries")
      .select("order_id")
      .eq("rider_id", user.id)
      .not("status", "in", '("delivered","cancelled")')
      .single()

    if (delivery?.order_id) {
      emitToOrderTrackers(delivery.order_id, "rider-location", { latitude, longitude })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
