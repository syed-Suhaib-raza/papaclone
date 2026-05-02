import { createSupabaseServerClient } from "@/lib/serve"
import { redirect } from "next/navigation"
import Sidebar from "@/components/Resdashboard/Sidebar"
import Navbar from "@/components/Resdashboard/Navbar"
import AnalyticsClient from "./AnalyticsClient"

export default async function AnalyticsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/login")

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="p-6 space-y-6">
          <AnalyticsClient accessToken={session.access_token} />
        </div>
      </div>
    </div>
  )
}
