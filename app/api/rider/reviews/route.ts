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

    const { data: ratings, error: ratingsError } = await supabase
      .from("rider_reviews")
      .select("rating")
      .eq("rider_id", user.id)

    if (ratingsError) return NextResponse.json({ error: ratingsError.message }, { status: 500 })

    const total = ratings?.length ?? 0
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    ratings?.forEach((r) => { if (counts[r.rating] !== undefined) counts[r.rating]++ })
    const avg = total === 0 ? 0 : (ratings ?? []).reduce((s, r) => s + r.rating, 0) / total
    const percentages = Object.fromEntries(
      Object.entries(counts).map(([star, count]) => [star, total === 0 ? 0 : Math.round((count / total) * 100)])
    )

    const { data: reviews, error: reviewsError } = await supabase
      .from("rider_reviews")
      .select("id, rating, comment, created_at, users!fk_customer(name)")
      .eq("rider_id", user.id)
      .order("created_at", { ascending: false })

    if (reviewsError) return NextResponse.json({ error: reviewsError.message }, { status: 500 })

    return NextResponse.json({ avg, total, percentages, reviews: reviews ?? [] })
  } catch (e: unknown) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
