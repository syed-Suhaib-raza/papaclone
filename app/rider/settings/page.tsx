"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supaBaseClient"

type Profile = { name: string; email: string; phone: string }

export default function RiderSettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile>({ name: "", email: "", phone: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push("/auth"); return }

      const res = await fetch("/api/rider/profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.profile) {
          setProfile({
            name: data.profile.name ?? "",
            email: data.profile.email ?? "",
            phone: data.profile.phone ?? "",
          })
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    setMsg(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")
      const res = await fetch("/api/rider/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(profile),
      })
      if (!res.ok) throw new Error("Failed to save")
      setMsg({ type: "success", text: "Profile saved successfully." })
    } catch (e: unknown) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "Failed to save profile." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account information</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card className="bg-card border border-border max-w-2xl">
          <CardContent className="p-5 space-y-4">
            <h2 className="text-lg font-semibold">Account Settings</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+1 234 567 8900"
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {msg && (
              <p className={`text-sm ${msg.type === "success" ? "text-green-500" : "text-destructive"}`}>
                {msg.text}
              </p>
            )}

            <Button onClick={save} disabled={saving} className="w-full">
              {saving && <Loader2 size={14} className="animate-spin mr-2" />}
              Save Profile
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
