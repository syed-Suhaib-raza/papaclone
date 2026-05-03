import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/serve";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Fetch Orders with Customer Names (JOIN)
    const { data: orders, error: oError } = await supabase
      .from('orders')
      .select(`
        id, 
        total_amount, 
        status, 
        created_at,
        users:customer_id ( name )
      `)
      .order('created_at', { ascending: false });

    // 2. Fetch Top Restaurants
    const { data: restaurantsData } = await supabase
      .from('restaurants')
      .select('id, name, rating, image_url')
      .order('rating', { ascending: false })
      .limit(4);

    // 3. Fetch Active Riders count
    const { count: riderCount } = await supabase
      .from('riders')
      .select('*', { count: 'exact', head: true });

    // --- REAL WEEKLY CHART LOGIC ---
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyDataMap: Record<string, { orders: number, delivered: number }> = {};
    days.forEach(d => weeklyDataMap[d] = { orders: 0, delivered: 0 });

    orders?.forEach(order => {
      const dayName = days[new Date(order.created_at).getDay()];
      weeklyDataMap[dayName].orders += 1;
      if (['ready', 'delivered'].includes(order.status)) {
        weeklyDataMap[dayName].delivered += 1;
      }
    });

    const lineData = days.map(day => ({
      day,
      orders: weeklyDataMap[day].orders,
      delivered: weeklyDataMap[day].delivered
    }));

    const totalOrders = orders?.length || 0;
    const totalRev = orders?.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0) || 0;

    return NextResponse.json({
      stats: [
        { label: "Total Orders", value: totalOrders, change: "Live", up: true, sColor: "#3b82f6", sparkline: [1, 2, 3, totalOrders] },
        { label: "Revenue", value: `Rs. ${totalRev.toLocaleString()}`, change: "Live", up: true, sColor: "#22c55e", sparkline: [1000, 2000, totalRev] },
        { label: "Active Riders", value: riderCount || 0, change: "Total", up: true, sColor: "#f07d4a", sparkline: [0, 1, riderCount || 0] },
        { label: "Cancelled", value: orders?.filter(o => o.status === 'cancelled').length || 0, change: "Current", up: false, sColor: "#ef4444", sparkline: [0, 1, 1] },
      ],
      recentOrders: orders?.slice(0, 5).map(o => ({
        id: o.id.slice(0, 8).toUpperCase(),
        customer: (o.users as any)?.name || "Guest User",
        restaurant: "Order",
        amount: `Rs. ${Number(o.total_amount).toLocaleString()}`,
        status: o.status
      })),
      topRestaurants: restaurantsData?.map(res => ({
        id: res.id,
        name: res.name,
        rating: res.rating ? Number(res.rating).toFixed(1) : "0.0",
        image: res.image_url || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150", 
        orders: "Top Rated"
      })) || [],
      lineData
    });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}