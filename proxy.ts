import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(req: NextRequest) {

  const { pathname } = req.nextUrl

  // Allow public and auth routes
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth")
  ) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/customer/:path*",
    "/restaurant/:path*",
    "/rider/:path*",
    "/admin/:path*",
  ],
}