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
      .from("users")
      .select("name, phone")
      .eq("id", user.id)
      .single()

    const { data: address } = await supabase
      .from("addresses")
      .select("id, street, city, latitude, longitude")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({ profile, address: address ?? null })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { user, supabase } = await getUser(req)
    if (!user || !supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { name, phone, street, city } = body

    // Update user profile if name/phone provided
    if (name !== undefined || phone !== undefined) {
      const updates: Record<string, string> = {}
      if (name !== undefined) updates.name = name
      if (phone !== undefined) updates.phone = phone
      await supabase.from("users").update(updates).eq("id", user.id)
    }

    let addressResult = null

    // Update address if street/city provided
    if (street !== undefined && city !== undefined) {
      // Geocode the address server-side
      let lat: number | null = null
      let lng: number | null = null
      try {
        const q = city ? `${street}, ${city}` : street
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
          { headers: { "User-Agent": "papaclone-delivery-app/1.0", "Accept-Language": "en" } }
        )
        const geoData = await geoRes.json()
        if (geoData?.[0]) {
          lat = parseFloat(geoData[0].lat)
          lng = parseFloat(geoData[0].lon)
        }
      } catch {}

      // Always insert a new row so past orders keep their original address
      const { data } = await supabase
        .from("addresses")
        .insert({ user_id: user.id, street, city, latitude: lat, longitude: lng })
        .select("id, street, city, latitude, longitude")
        .single()
      addressResult = data
    }

    // Return updated data
    const { data: profile } = await supabase
      .from("users")
      .select("name, phone")
      .eq("id", user.id)
      .single()

    return NextResponse.json({ profile, address: addressResult })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
