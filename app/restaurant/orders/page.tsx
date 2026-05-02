import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/serve"
import Sidebar from "@/components/Resdashboard/Sidebar"
import Navbar from "@/components/Resdashboard/Navbar"
import RestaurantOrders from "@/components/Resdashboard/RestaurantOrders"

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/login")

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="p-6 space-y-6">
          <RestaurantOrders accessToken={session.access_token} />
        </div>
      </div>
    </div>
  )
}
