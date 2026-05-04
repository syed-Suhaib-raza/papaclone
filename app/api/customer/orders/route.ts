import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function makeClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No auth token" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = makeClient(token);

    const { data, error: authError } = await supabase.auth.getUser(token);
    if (authError || !data.user) {
      return NextResponse.json({ error: "Invalid user" }, { status: 401 });
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        total_amount,
        created_at,
        restaurant_id,
        rider_id,
        restaurants ( name, latitude, longitude ),
        addresses ( street, city, latitude, longitude ),
        order_items (
          item_id,
          quantity,
          price_at_order,
          menu_items ( name, image_url )
        ),
        deliveries ( accepted_at, status )
      `)
      .eq("customer_id", data.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(orders || []);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}