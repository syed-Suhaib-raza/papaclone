"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Loader2 } from "lucide-react"
import Sidebar from "@/components/Cusdashboard/Sidebar"
import Navbar from "@/components/Cusdashboard/Navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supaBaseClient"

type Profile = { name: string; phone: string }
type Address = { id: string; street: string; city: string; latitude: number | null; longitude: number | null }

export default function ProfilePage() {
  const router = useRouter()

  const [profile, setProfile] = useState<Profile>({ name: "", phone: "" })
  const [address, setAddress] = useState<Address | null>(null)
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")

  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [locating, setLocating] = useState(false)

  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [addressMsg, setAddressMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push("/auth"); return }

      const res = await fetch("/api/customer/profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) { setLoadingProfile(false); return }

      const data = await res.json()
      if (data.profile) setProfile({ name: data.profile.name ?? "", phone: data.profile.phone ?? "" })
      if (data.address) {
        setAddress(data.address)
        setStreet(data.address.street ?? "")
        setCity(data.address.city ?? "")
      }
      setLoadingProfile(false)
    }
    load()
  }, [])

  async function saveProfile() {
    setSavingProfile(true)
    setProfileMsg(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ name: profile.name, phone: profile.phone }),
      })
      if (!res.ok) throw new Error("Failed to save")
      setProfileMsg({ type: "success", text: "Profile saved successfully." })
    } catch (e: unknown) {
      setProfileMsg({ type: "error", text: e instanceof Error ? e.message : "Failed to save profile." })
    } finally {
      setSavingProfile(false)
    }
  }

  async function saveAddress() {
    if (!street.trim() || !city.trim()) {
      setAddressMsg({ type: "error", text: "Please enter both street and city." })
      return
    }
    setSavingAddress(true)
    setAddressMsg(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ street: street.trim(), city: city.trim() }),
      })
      if (!res.ok) throw new Error("Failed to save address")
      const data = await res.json()
      if (data.address) setAddress(data.address)
      setAddressMsg({ type: "success", text: "Address saved successfully." })
    } catch (e: unknown) {
      setAddressMsg({ type: "error", text: e instanceof Error ? e.message : "Failed to save address." })
    } finally {
      setSavingAddress(false)
    }
  }

  async function locateMe() {
    if (!navigator.geolocation) {
      setAddressMsg({ type: "error", text: "Geolocation is not supported by your browser." })
      return
    }
    setLocating(true)
    setAddressMsg(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`/api/geocode?reverse=1&lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
          const data = await res.json()
          if (data?.street) setStreet(data.street)
          if (data?.city) setCity(data.city)
          if (!data?.street && !data?.city)
            setAddressMsg({ type: "error", text: "Could not determine address from location." })
        } catch {
          setAddressMsg({ type: "error", text: "Failed to reverse geocode location." })
        } finally {
          setLocating(false)
        }
      },
      () => {
        setAddressMsg({ type: "error", text: "Location access denied." })
        setLocating(false)
      }
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />

        <div className="p-6 space-y-8">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground text-sm">Manage your account settings</p>
          </div>

          {loadingProfile ? (
            <div className="flex justify-center py-16">
              <Loader2 size={28} className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Personal Info */}
              <Card className="bg-card border border-border">
                <CardContent className="p-5 space-y-4">
                  <h2 className="text-lg font-semibold">Personal Info</h2>

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

                  {profileMsg && (
                    <p className={`text-sm ${profileMsg.type === "success" ? "text-green-500" : "text-destructive"}`}>
                      {profileMsg.text}
                    </p>
                  )}

                  <Button onClick={saveProfile} disabled={savingProfile} className="w-full">
                    {savingProfile && <Loader2 size={14} className="animate-spin mr-2" />}
                    Save Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card className="bg-card border border-border">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Delivery Address</h2>
                    {address?.latitude && address?.longitude && (
                      <span className="text-xs text-green-500 border border-green-500/30 bg-green-500/10 px-2 py-0.5 rounded-full">
                        Geocoded
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm text-muted-foreground">Street Address</label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="123 Main St"
                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-muted-foreground">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="New York"
                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <Button variant="outline" onClick={locateMe} disabled={locating} className="w-full">
                    {locating ? <Loader2 size={14} className="animate-spin mr-2" /> : <MapPin size={14} className="mr-2" />}
                    {locating ? "Locating…" : "Locate Me"}
                  </Button>

                  {addressMsg && (
                    <p className={`text-sm ${addressMsg.type === "success" ? "text-green-500" : "text-destructive"}`}>
                      {addressMsg.text}
                    </p>
                  )}

                  <Button onClick={saveAddress} disabled={savingAddress} className="w-full">
                    {savingAddress && <Loader2 size={14} className="animate-spin mr-2" />}
                    Save Address
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
