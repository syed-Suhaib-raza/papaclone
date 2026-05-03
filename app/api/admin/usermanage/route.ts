import { createClient } from "@supabase/supabase-js"
import { NextResponse }  from "next/server"

/*
 * Route: /api/admin/usermanage
 *
 * Uses Service Role key to bypass RLS and access auth.users.
 * Merges public.users (profile + orders + city) with auth.users (email, ban status).
 *
 * DB tables used:
 *   public.users       — id, name, role, created_at
 *   public.addresses   — user_id, city
 *   public.orders      — customer_id  (count via aggregate)
 *   auth.users         — id, email, banned_until, last_sign_in_at  (via admin API)
 */

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

/* ── GET /api/admin/usermanage ───────────────────────── */
export async function GET() {
  try {
    // 1. Fetch all public user profiles with city + order count
    const { data: profiles, error: profileErr } = await supabaseAdmin
      .from("users")
      .select(`
        id,
        name,
        role,
        created_at,
        addresses ( city ),
        orders:orders ( count )
      `)
      .order("created_at", { ascending: false })

    if (profileErr) throw profileErr

    // 2. Fetch ALL auth users (Supabase paginates at 1000 by default)
    //    FIX: loop pages so we never silently miss users beyond page 1
    let authList: any[] = []
    let page = 1
    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 })
      if (error) throw error
      authList = authList.concat(data.users)
      if (data.users.length < 1000) break
      page++
    }

    // 3. Build a fast lookup map: id → auth user
    const authMap = new Map(authList.map(au => [au.id, au]))

    // 4. Merge and format
    const users = (profiles ?? []).map(u => {
      const au = authMap.get(u.id)

      // Determine blocked status:
      // Supabase sets banned_until to a future date when banned, or null/past when not
      const bannedUntil = au?.banned_until ? new Date(au.banned_until) : null
      const isBlocked   = bannedUntil !== null && bannedUntil > new Date()

      // Last active — relative time if recent, otherwise locale date
      let lastActive = "Never"
      if (au?.last_sign_in_at) {
        const d    = new Date(au.last_sign_in_at)
        const diff = Date.now() - d.getTime()
        const mins = Math.floor(diff / 60_000)
        if      (mins < 2)    lastActive = "Just now"
        else if (mins < 60)   lastActive = `${mins}m ago`
        else if (mins < 1440) lastActive = `${Math.floor(mins/60)}h ago`
        else                  lastActive = d.toLocaleDateString("en-US", { month:"short", day:"numeric" })
      }

      return {
        id:         u.id,
        name:       u.name || "Unknown",
        email:      au?.email || "No email",
        role:       u.role   || "customer",
        status:     isBlocked ? "blocked" : "active",
        // FIX: orders is returned as [{count: N}] from Supabase aggregate
        orders:     (u.orders as any)?.[0]?.count ?? 0,
        city:       (u.addresses as any)?.[0]?.city || "—",
        lastActive,
        joined: new Date(u.created_at).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        }),
      }
    })

    return NextResponse.json({ users })
  } catch (err: any) {
    console.error("[usermanage GET]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/* ── PATCH /api/admin/usermanage ─────────────────────── */
export async function PATCH(req: Request) {
  try {
    const { id, action, role } = await req.json()

    if (!id)     return NextResponse.json({ error: "id is required"     }, { status: 400 })
    if (!action) return NextResponse.json({ error: "action is required" }, { status: 400 })

    /* ── Block user ───────────────────────────────────── */
    if (action === "block") {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
        ban_duration: "876000h", // ~100 years — effective permanent block
      })
      if (error) throw error
    }

    /* ── Unblock user ─────────────────────────────────── */
    else if (action === "unblock") {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
        ban_duration: "none",   // Supabase uses "none" to remove a ban
      })
      if (error) throw error
    }

    /* ── Change role ──────────────────────────────────── */
    else if (action === "role") {
      if (!role) return NextResponse.json({ error: "role is required" }, { status: 400 })

      // Validate role value to prevent injection
      const validRoles = ["admin", "manager", "support", "customer", "rider"]
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: `Invalid role: ${role}` }, { status: 400 })
      }

      // 1. Update the public.users table (source of truth for app logic)
      const { error: dbErr } = await supabaseAdmin
        .from("users")
        .update({ role })
        .eq("id", id)

      if (dbErr) throw dbErr

      // 2. FIX: Update app_metadata (NOT user_metadata) so the role
      //    is included in the JWT claims that middleware can read.
      //    user_metadata is user-controlled; app_metadata is admin-only.
      const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(id, {
        app_metadata: { role },
      })
      if (authErr) throw authErr
    }

    else {
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[usermanage PATCH]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}