import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function makeClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

async function getUser(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return { user: null, token: "", supabase: null }
  const supabase = makeClient(token)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return { user: null, token: "", supabase: null }
  return { user, token, supabase }
}

export async function GET(req: Request) {
  try {
    const { user, supabase } = await getUser(req)
    if (!user || !supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase
      .from("riders")
      .select("name, email, phone")
      .eq("id", user.id)
      .single()

    return NextResponse.json({ profile })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { user, supabase } = await getUser(req)
    if (!user || !supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { name, email, phone } = body

    const updates: Record<string, string> = {}
    if (name !== undefined) updates.name = name
    if (email !== undefined) updates.email = email
    if (phone !== undefined) updates.phone = phone

    if (Object.keys(updates).length > 0) {
      await supabase.from("riders").update(updates).eq("id", user.id)
    }

    const { data: profile } = await supabase
      .from("riders")
      .select("name, email, phone")
      .eq("id", user.id)
      .single()

    return NextResponse.json({ profile })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
