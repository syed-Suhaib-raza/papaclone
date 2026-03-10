export async function getRestaurantAnalytics(
  supabase: any,
  restaurantId: string
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: orders, error } = await supabase
    .from("orders")
    .select("total_price, created_at")
    .eq("restaurant_id", restaurantId)
    .gte("created_at", today.toISOString())

  if (error || !orders) {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      chartData: []
    }
  }

  const totalOrders = orders.length

  const totalRevenue = orders.reduce(
    (sum: number, o: any) => sum + o.total_price,
    0
  )

  const hourly: Record<number, { orders: number; revenue: number }> = {}

  orders.forEach((order: any) => {
    const hour = new Date(order.created_at).getHours()

    if (!hourly[hour]) {
      hourly[hour] = { orders: 0, revenue: 0 }
    }

    hourly[hour].orders++
    hourly[hour].revenue += order.total_price
  })

  const chartData = Object.entries(hourly)
    .map(([hour, value]) => ({
      time: `${hour}:00`,
      orders: value.orders,
      revenue: value.revenue
    }))
    .sort((a, b) => parseInt(a.time) - parseInt(b.time))

  return {
    totalOrders,
    totalRevenue,
    chartData
  }
}