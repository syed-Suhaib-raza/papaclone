import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET() {
  try {
    const { data: restaurants, error: resError } = await supabaseAdmin
      .from("restaurants")
      .select("id, name, commission_percentage")
      .order("name", { ascending: true })

    if (resError) throw resError

    const { data: commissions, error: comError } = await supabaseAdmin
      .from("commissions")
      .select("commission_amount, order_id, orders!inner(restaurant_id)")

    if (comError) throw comError

    const totals: Record<string, number> = {}
    for (const c of commissions ?? []) {
      const rid = (c.orders as any)?.restaurant_id
      if (rid) totals[rid] = (totals[rid] ?? 0) + Number(c.commission_amount ?? 0)
    }

    const rows = (restaurants ?? []).map((r: any) => ({
      id: r.id,
      name: r.name ?? "Unnamed",
      commission_percentage: r.commission_percentage ?? 0.1,
      total_commission: totals[r.id] ?? 0,
    }))

    return NextResponse.json({ rows })
  } catch (err: any) {
    console.error("Commissions GET error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, commission_percentage } = await req.json()

    if (!id) return NextResponse.json({ error: "Missing restaurant id" }, { status: 400 })

    const pct = Number(commission_percentage)
    if (isNaN(pct) || pct < 0 || pct > 1) {
      return NextResponse.json({ error: "commission_percentage must be between 0 and 1" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("restaurants")
      .update({ commission_percentage: pct })
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Commissions PATCH error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
