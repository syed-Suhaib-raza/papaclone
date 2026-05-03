import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Initialize with Service Role Key to bypass RLS and perform admin auth updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("restaurants")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    const restaurants = (data || []).map((res: any) => ({
      id: res.id,
      name: res.name || "Unnamed",
      city: res.city || "Unknown",
      orders: res.orders_count || 0,
      revenue: res.revenue ? `$${res.revenue.toLocaleString()}` : "$0",
      rating: res.rating || 0,
      // Uses the 'status' column from your schema
      status: res.status || "pending", 
      joined: res.created_at ? new Date(res.created_at).toLocaleDateString() : "N/A",
      category: res.category || "General",
      // IMPORTANT: Map 'owner_id' from DB to 'user_id' for frontend compatibility
      user_id: res.owner_id 
    }))

    return NextResponse.json({ restaurants })
  } catch (err: any) {
    console.error("API Error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, action } = await req.json()
    
    // 1. Determine the status string
    let statusUpdate = "active"
    if (action === "disable" || action === "reject") statusUpdate = "disabled"
    if (action === "approve" || action === "enable") statusUpdate = "active"

    // 2. Fetch using 'owner_id' as per your schema
    const { data: restaurant, error: fetchError } = await supabaseAdmin
      .from("restaurants")
      .select("owner_id") 
      .eq("id", id)
      .single()

    if (fetchError || !restaurant) {
      console.error("Fetch Error:", fetchError)
      return NextResponse.json({ error: "Restaurant record not found" }, { status: 404 })
    }

    // 3. Perform Role Transition if approving
    if (action === "approve") {
      // Ensure owner_id exists before trying to update auth
      if (!restaurant.owner_id) {
        throw new Error("No owner_id found for this restaurant. Cannot update role.")
      }

      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        restaurant.owner_id,
        { 
            app_metadata: { 
                role: "restaurant", 
                restaurant_id: id 
            } 
        }
      )
      if (authError) throw new Error(`Auth Error: ${authError.message}`)
      console.log(`User ${restaurant.owner_id} promoted to restaurant role.`)
    }

    // 4. Update the 'status' column in the public.restaurants table
    const { error: dbError } = await supabaseAdmin
      .from("restaurants")
      .update({ status: statusUpdate })
      .eq("id", id)

    if (dbError) {
        if (dbError.code === '42703') {
            console.error("The 'status' column is missing in the database table 'restaurants'.")
        }
        throw dbError
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("PATCH Error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}