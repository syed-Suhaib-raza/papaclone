import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(`${origin}/login`)
  }

  // Create redirect response FIRST
  const redirect = NextResponse.redirect(`${origin}/login`)

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
            redirect.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  /* Exchange OAuth code for session */
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("OAuth error:", error)
    return redirect
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect
  }

  /* Get role */
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return redirect
  }

  const role = profile.role

  // Change redirect destination
  redirect.headers.set("Location", `${origin}/${role}`)

  return redirect
}