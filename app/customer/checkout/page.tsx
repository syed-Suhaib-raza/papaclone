import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/serve"
import CheckoutForm from "./CheckoutForm"

export default async function CheckoutPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/login")

  return <CheckoutForm accessToken={session.access_token} userId={session.user.id} />
}
