import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cacheDel } from "@/lib/redis"

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

  const { data, error } = await makeClient().auth.getUser(token)
  if (error || !data.user) return { restaurantId: "", token: "", err: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const { data: rest } = await makeClient(token)
    .from("restaurants")
    .select("id")
    .eq("owner_id", data.user.id)
    .single()

  if (!rest) return { restaurantId: "", token: "", err: NextResponse.json({ error: "Restaurant not found" }, { status: 404 }) }
  return { restaurantId: rest.id, token, err: null }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { restaurantId, token, err } = await getRestaurantId(req)
    if (err) return err

    const { id } = await params
    const body = await req.json()
    const { name, description, price, category_id, image_url, available } = body

    if (!name || !name.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 })
    if (price === undefined || price === null || isNaN(Number(price))) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 })
    }

    const { data, error } = await makeClient(token)
      .from("menu_items")
      .update({
        name: name.trim(),
        description: description?.trim() ?? null,
        price: Number(price),
        category_id: category_id ?? null,
        image_url: image_url?.trim() ?? null,
        available: available ?? true,
      })
      .eq("id", id)
      .eq("restaurant_id", restaurantId)
      .select("id, name, description, price, image_url, available, category_id, categories(id, name)")
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: "Item not found" }, { status: 404 })
    await cacheDel(`restaurant:${restaurantId}:menu`)
    return NextResponse.json(data)
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { restaurantId, token, err } = await getRestaurantId(req)
    if (err) return err

    const { id } = await params

    const { error, count } = await makeClient(token)
      .from("menu_items")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("restaurant_id", restaurantId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (count === 0) return NextResponse.json({ error: "Item not found" }, { status: 404 })
    await cacheDel(`restaurant:${restaurantId}:menu`)
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 })
  }
}
