import { createSupabaseServerClient } from "@/lib/serve"
import { redirect } from "next/navigation"
import RiderAnalyticsClient from "./AnalyticsClient"

export default async function RiderAnalyticsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/login")

  return <RiderAnalyticsClient accessToken={session.access_token} />
}
