import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "No auth token" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // ✅ Safe auth check
    const { data, error: authError } = await supabase.auth.getUser(token);

    if (authError || !data.user) {
      return NextResponse.json({ error: "Invalid user" }, { status: 401 });
    }

    const user = data.user;

    // ✅ Fetch orders
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        total_amount,
        created_at,
        restaurants ( name ),
        order_items (
          quantity,
          price_at_order,
          menu_items ( name )
        )
      `)
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(orders || []);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}