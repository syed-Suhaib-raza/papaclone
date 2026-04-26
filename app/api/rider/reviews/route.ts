import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET(req: Request) {
  try {
    // ✅ Auth
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized user" },
        { status: 401 }
      );
    }

    const rider_id = user.id;

    // =========================
    // ✅ 1. Ratings summary
    // =========================
    const { data, error } = await supabase
      .from("rider_reviews")
      .select("rating")
      .eq("rider_id", rider_id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const total = data?.length || 0;

    const counts: Record<number, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    data?.forEach((r) => {
      if (counts[r.rating] !== undefined) {
        counts[r.rating]++;
      }
    });

    const avg =
      total === 0
        ? 0
        : data.reduce((sum, r) => sum + r.rating, 0) / total;

    const percentages = Object.fromEntries(
      Object.entries(counts).map(([star, count]) => [
        star,
        total === 0 ? 0 : Math.round((count / total) * 100),
      ])
    );

    // =========================
    // ✅ 2. Reviews list (NEW)
    // =========================
    const { data: reviews, error: reviewsError } = await supabase
      .from("rider_reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        users!fk_customer (
          name
        )
      `)
      .eq("rider_id", rider_id)
      .order("created_at", { ascending: false });

    if (reviewsError) {
      return NextResponse.json(
        { error: reviewsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      avg,
      total,
      percentages,
      reviews, // ✅ added
    });

  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}