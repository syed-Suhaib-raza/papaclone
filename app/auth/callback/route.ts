import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {

  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(`${origin}/login`)
  }

  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  /* Exchange OAuth code for session */
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error("OAuth error:", exchangeError)
    return NextResponse.redirect(`${origin}/login`)
  }

  /* Get logged-in user */
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.redirect(`${origin}/login`)
  }

  console.log("User ID:", user.id)

  /* Get role from database */
  const { data: profile, error: roleError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (roleError || !profile) {
    console.error("Role lookup failed:", roleError)
    return NextResponse.redirect(`${origin}/login`)
  }

  const role = profile.role

  console.log("Role:", role)

  /* Redirect to role dashboard */
  return NextResponse.redirect(`${origin}/${role}`)
}