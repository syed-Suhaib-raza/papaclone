import { redirect } from "next/navigation"
import Sidebar from "@/components/Resdashboard/Sidebar"
import Navbar from "@/components/Resdashboard/Navbar"
import MenuManagement from "@/components/Resdashboard/MenuManagement"
import { createSupabaseServerClient } from "@/lib/serve"

export default async function MenuPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect("/login")

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="p-6 space-y-6">
          <MenuManagement accessToken={session.access_token} />
        </div>
      </div>
    </div>
  )
}
