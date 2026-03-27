import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data: orders } = await supabase
    .from("orders")
    .select("id, created_at, total_amount");

  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating, comment, created_at");

  
  const { data: items } = await supabase
    .from("order_items")
    .select("quantity, order_id, menu_items(name)");

  return Response.json({
    orders: orders || [],
    reviews: reviews || [],
    items: items || [],
  });
}