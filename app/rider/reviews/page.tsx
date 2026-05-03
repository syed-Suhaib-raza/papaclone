import { createSupabaseServerClient } from "@/lib/serve"
import { redirect } from "next/navigation"
import RiderReviewsClient from "./ReviewsClient"

export default async function RiderReviewsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/login")

  return <RiderReviewsClient accessToken={session.access_token} />
}
