import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function makeClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = makeClient(token)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { restaurantId, restaurantRating, restaurantComment, riderId, riderRating, riderComment } = body

    if (!restaurantId || !Number.isInteger(restaurantRating) || restaurantRating < 1 || restaurantRating > 5) {
      return NextResponse.json({ error: "Invalid restaurant rating" }, { status: 400 })
    }
    if (riderId && (!Number.isInteger(riderRating) || riderRating < 1 || riderRating > 5)) {
      return NextResponse.json({ error: "Invalid rider rating" }, { status: 400 })
    }

    const { error: reviewError } = await supabase.from("reviews").insert({
      restaurant_id: restaurantId,
      customer_id: user.id,
      rating: restaurantRating,
      comment: restaurantComment || null,
    })
    if (reviewError) return NextResponse.json({ error: reviewError.message }, { status: 500 })

    const { data: allReviews } = await supabaseAdmin
      .from("reviews")
      .select("rating")
      .eq("restaurant_id", restaurantId)

    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / allReviews.length
      await supabaseAdmin
        .from("restaurants")
        .update({ rating: Math.round(avg * 100) / 100 })
        .eq("id", restaurantId)
    }

    if (riderId) {
      const { error: riderReviewError } = await supabase.from("rider_reviews").insert({
        rider_id: riderId,
        customer_id: user.id,
        rating: riderRating,
        comment: riderComment || null,
      })
      if (riderReviewError) return NextResponse.json({ error: riderReviewError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e: unknown) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
