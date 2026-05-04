import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const headers = {
    "User-Agent": "papaclone-delivery-app/1.0",
    "Accept-Language": "en",
  }

  // Reverse geocode: ?reverse=1&lat=X&lng=Y
  if (searchParams.get("reverse") === "1") {
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    if (!lat || !lng) return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 })

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers }
      )
      const data = await res.json()
      if (!data?.address) return NextResponse.json(null)

      const a = data.address
      const street = [a.house_number, a.road].filter(Boolean).join(" ") || data.display_name?.split(",")[0] || ""
      const city = a.city || a.town || a.village || a.county || ""
      return NextResponse.json({ street, city })
    } catch {
      return NextResponse.json(null)
    }
  }

  // Forward geocode: ?q=address
  const q = searchParams.get("q")
  if (!q) return NextResponse.json({ error: "Missing query" }, { status: 400 })

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&addressdetails=1`,
      { headers }
    )

    const data = await res.json()
    if (!data?.[0]) return NextResponse.json(null)

    return NextResponse.json({
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    })
  } catch {
    return NextResponse.json(null)
  }
}
