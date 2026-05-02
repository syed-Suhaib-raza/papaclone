import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function makeClient(token?: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : undefined
  )
}

async function getRestaurantId(req: Request): Promise<{ restaurantId: string; token: string; err: NextResponse | null }> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return { restaurantId: "", token: "", err: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const anonClient = makeClient()
  const { data, error } = await anonClient.auth.getUser(token)
  if (error || !data.user) return { restaurantId: "", token: "", err: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const authedClient = makeClient(token)
  const { data: rest } = await authedClient
    .from("restaurants")
    .select("id")
    .eq("owner_id", data.user.id)
    .single()

  if (!rest) return { restaurantId: "", token: "", err: NextResponse.json({ error: "Restaurant not found" }, { status: 404 }) }
  return { restaurantId: rest.id, token, err: null }
}

export async function GET(req: Request) {
  try {
    const { restaurantId, token, err } = await getRestaurantId(req)
    if (err) return err

    const { data, error } = await makeClient(token)
      .from("categories")
      .select("id, name")
      .eq("restaurant_id", restaurantId)
      .order("name", { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data ?? [])
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { restaurantId, token, err } = await getRestaurantId(req)
    if (err) return err

    const body = await req.json()
    const { name } = body

    if (!name || !name.trim()) return NextResponse.json({ error: "Category name is required" }, { status: 400 })

    const { data, error } = await makeClient(token)
      .from("categories")
      .insert({ restaurant_id: restaurantId, name: name.trim() })
      .select("id, name")
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 })
  }
}
