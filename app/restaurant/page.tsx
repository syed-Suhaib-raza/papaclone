import Sidebar from "@/components/Resdashboard/Sidebar"
import Navbar from "@/components/Resdashboard/Navbar"
import DailyStats from "@/components/Resdashboard/DailyStats"
import OrdersChart from "@/components/Resdashboard/OrdersChart"
import RevenueChart from "@/components/Resdashboard/RevenueChart"

import { createSupabaseServerClient } from "@/lib/serve"
import { getRestaurantAnalytics } from "@/lib/getRestaurantAnalytics"

import { redirect } from "next/navigation"

export default async function Dashboard() {

  const supabase = await createSupabaseServerClient()

  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) redirect("/login")

  const analytics = await getRestaurantAnalytics(
    supabase,
    session.user.id
  )

  return (
    <div className="flex">

      <Sidebar/>

      <div className="flex-1 ml-64">

        <Navbar/>

        <div className="p-6 space-y-6">

          <DailyStats
            orders={analytics.totalOrders}
            revenue={analytics.totalRevenue}
          />

          <div className="grid grid-cols-2 gap-6">

            <OrdersChart data={analytics.chartData}/>
            <RevenueChart data={analytics.chartData}/>

          </div>

        </div>

      </div>

    </div>
  )
}