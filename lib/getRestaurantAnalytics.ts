export async function getRestaurantAnalytics(supabase: any, ownerId: string) {
  // Look up the restaurant owned by this user
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", ownerId)
    .single()

  if (!restaurant) {
    return { totalOrders: 0, totalRevenue: 0, chartData: [] }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: orders, error } = await supabase
    .from("orders")
    .select("total_amount, created_at, status")
    .eq("restaurant_id", restaurant.id)
    .gte("created_at", today.toISOString())
    .not("status", "in", '("pending","cancelled")')

  if (error || !orders) {
    return { totalOrders: 0, totalRevenue: 0, chartData: [] }
  }

  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.total_amount ?? 0), 0)

  const hourly: Record<number, { orders: number; revenue: number }> = {}
  orders.forEach((order: any) => {
    const hour = new Date(order.created_at).getHours()
    if (!hourly[hour]) hourly[hour] = { orders: 0, revenue: 0 }
    hourly[hour].orders++
    hourly[hour].revenue += Number(order.total_amount ?? 0)
  })

  const chartData = Object.entries(hourly)
    .map(([hour, value]) => ({
      time: `${hour}:00`,
      orders: value.orders,
      revenue: value.revenue,
    }))
    .sort((a, b) => parseInt(a.time) - parseInt(b.time))

  return { totalOrders, totalRevenue, chartData }
}
