import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabaseServer"

const roleRoutes: Record<string, string> = {
  customer: "/customer",
  restaurant: "/restaurant",
  rider: "/rider",
  admin: "/admin",
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public + auth routes FIRST
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth")
  ) {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createSupabaseServerClient(req, res)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .maybeSingle()

  const role = profile?.role
  const allowedPrefix = roleRoutes[role as keyof typeof roleRoutes]
  if (!role || !allowedPrefix) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (!pathname.startsWith(allowedPrefix)) {
    return NextResponse.redirect(new URL(allowedPrefix, req.url))
  }

  return res
}

export const config = {
  matcher: [
    "/customer/:path*",
    "/restaurant/:path*",
    "/rider/:path*",
    "/admin/:path*",
  ],
}