import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ deliveries: [], reviews: [] });
  }

  const riderId = user.id;

  // Deliveries + revenue (join orders)
  const { data: deliveries } = await supabase
    .from("deliveries")
    .select(`
      id,
      pickup_time,
      delivery_time,
      orders ( total_amount )
    `)
    .eq("rider_id", riderId);

  // Rider reviews
  const { data: reviews } = await supabase
    .from("rider_reviews")
    .select("rating, created_at")
    .eq("rider_id", riderId);

  return Response.json({
    deliveries: deliveries || [],
    reviews: reviews || [],
  });
}