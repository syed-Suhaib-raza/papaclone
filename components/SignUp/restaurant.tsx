// components/SignUp/OwnerForm.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AlertCircle, Loader2, Eye, EyeOff,
  Mail, Lock, User, CheckCircle2, Phone,
  Building2, ImageIcon, FileText,
} from "lucide-react"
import { Button }    from "@/components/ui/button"
import { Input }     from "@/components/ui/input"
import { Progress }  from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { supabase }   from "@/lib/supaBaseClient"
import LocationPicker from "./LocationPicker"

// ── Password strength ──────────────────────────────────
function getStrength(p: string) {
  if (!p) return { score: 0, label: "", color: "" }
  let s = 0
  if (p.length >= 8)          s += 25
  if (/[A-Z]/.test(p))        s += 25
  if (/[0-9]/.test(p))        s += 25
  if (/[^A-Za-z0-9]/.test(p)) s += 25
  if (s <= 25) return { score: s, label: "Weak",   color: "text-red-500"    }
  if (s <= 50) return { score: s, label: "Fair",   color: "text-yellow-500" }
  if (s <= 75) return { score: s, label: "Good",   color: "text-blue-500"   }
  return               { score: s, label: "Strong", color: "text-green-500" }
}

function PasswordInput({ id, value, onChange, placeholder = "Password" }: {
  id: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input id={id} type={show ? "text" : "password"} value={value}
        onChange={e => onChange(e.target.value)} placeholder={placeholder} className="pr-10"/>
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
        {show ? <EyeOff size={15}/> : <Eye size={15}/>}
      </button>
    </div>
  )
}

interface Props { onSuccess: () => void }

export default function OwnerForm({ onSuccess }: Props) {

  // ── Auth fields → auth.users ──────────────────────────
  const [email,    setEmail]    = useState("")
  const [phone,    setPhone]    = useState("")
  const [password, setPassword] = useState("")
  const [confirm,  setConfirm]  = useState("")

  // ── users table: id, name, role ──────────────────────
  const [name, setName] = useState("")

  // ── restaurants table ─────────────────────────────────
  // schema: id, owner_id, name, description, latitude, longitude, rating, image_url, created_at
  const [restName,    setRestName]    = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl,    setImageUrl]    = useState("")
  const [location,    setLocation]    = useState<{
    address: string; latitude: number; longitude: number
  } | null>(null)

  const [agreed,  setAgreed]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [errors,  setErrors]  = useState<Record<string, string>>({})

  const strength = getStrength(password)

  function validate() {
    const e: Record<string, string> = {}
    if (!name)                            e.name        = "Full name is required"
    if (!email)                           e.email       = "Email is required"
    if (!phone || !/^03\d{9}$/.test(phone.replace(/-/g, ""))) e.phone = "Enter valid number e.g. 03001234567"
    if (!password || password.length < 8) e.password    = "Min 8 characters"
    if (password !== confirm)             e.confirm     = "Passwords do not match"
    if (!restName)                        e.restName    = "Restaurant name is required"
    if (!description)                     e.description = "Description is required"
    if (!location)                        e.location    = "Please select your restaurant location on the map"
    if (!agreed)                          e.agreed      = "Please agree to the terms"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true); setError("")

    try {
      // 1. Create auth user
      const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password })
      if (authErr) throw new Error(`Auth error: ${authErr.message}`)

      let userId = authData.user?.id

      if (!userId) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
        if (signInErr) throw new Error(`Sign in error: ${signInErr.message}`)
        userId = signInData.user?.id
      }

      if (!userId) throw new Error("Could not get user ID. Please try again.")

      // 2. Insert into users table
      // schema: id, name, role, created_at
      const { error: userErr } = await supabase
        .from("users")
        .upsert({ id: userId, name, phone, role: "restaurant" }, { onConflict: "id" })
      if (userErr) throw new Error(`Users table error: ${userErr.message}`)

      // 3. Insert into restaurants table
      // schema: id, owner_id, name, description, latitude, longitude, rating, image_url, created_at
      const { error: restErr } = await supabase
        .from("restaurants")
        .insert({
          owner_id:    userId,
          name:        restName,
          description,
          latitude:    location!.latitude,
          longitude:   location!.longitude,
          image_url:   imageUrl || null,
          rating:      0,
        })
      if (restErr) throw new Error(`Restaurants table error: ${restErr.message}`)

      setLoading(false)
      onSuccess()

    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="py-2">

        {/* ── Account fields ── */}
        <Field>
          <FieldLabel htmlFor="o-name">
            <User size={13} className="text-muted-foreground"/> Full Name
          </FieldLabel>
          <Input id="o-name" value={name} onChange={e => setName(e.target.value)} placeholder="Ali Hassan" required/>
          {errors.name && <FieldError>{errors.name}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="o-email">
            <Mail size={13} className="text-muted-foreground"/> Email
          </FieldLabel>
          <Input id="o-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ali@gmail.com" required/>
          {errors.email && <FieldError>{errors.email}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="o-phone">
            <Phone size={13} className="text-muted-foreground"/> Phone Number
          </FieldLabel>
          <Input id="o-phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="03001234567"/>
          {errors.phone && <FieldError>{errors.phone}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="o-pass">
            <Lock size={13} className="text-muted-foreground"/> Password
          </FieldLabel>
          <PasswordInput id="o-pass" value={password} onChange={setPassword}/>
          {password && (
            <div className="mt-1.5 flex items-center gap-2">
              <Progress value={strength.score} className="flex-1 h-1.5"/>
              <span className={`text-[10px] font-black ${strength.color}`}>{strength.label}</span>
            </div>
          )}
          {errors.password && <FieldError>{errors.password}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="o-confirm">
            <Lock size={13} className="text-muted-foreground"/> Confirm Password
          </FieldLabel>
          <PasswordInput id="o-confirm" value={confirm} onChange={setConfirm} placeholder="Repeat password"/>
          {confirm && password === confirm && (
            <p className="text-[10px] text-green-500 flex items-center gap-1 mt-1">
              <CheckCircle2 size={11}/> Passwords match
            </p>
          )}
          {errors.confirm && <FieldError>{errors.confirm}</FieldError>}
        </Field>

        {/* ── Restaurant details ── */}
        <Separator/>
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Restaurant Details
        </p>

        <Field>
          <FieldLabel htmlFor="o-rname">
            <Building2 size={13} className="text-muted-foreground"/> Restaurant Name
          </FieldLabel>
          <Input id="o-rname" value={restName} onChange={e => setRestName(e.target.value)} placeholder="e.g. Burger Lab"/>
          {errors.restName && <FieldError>{errors.restName}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="o-desc">
            <FileText size={13} className="text-muted-foreground"/> Description
          </FieldLabel>
          <textarea
            id="o-desc" value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tell customers what makes your restaurant special..."
            rows={3}
            className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm outline-none focus-visible:border-ring resize-none placeholder:text-muted-foreground"
          />
          {errors.description && <FieldError>{errors.description}</FieldError>}
        </Field>

        {/* ── Google Maps location picker ── */}
        <Field>
          <FieldLabel>
            Restaurant Location
          </FieldLabel>
          <LocationPicker
            onLocationSelect={data => {
              setLocation(data)
              setErrors(e => ({ ...e, location: "" }))
            }}
          />
          {errors.location && <FieldError>{errors.location}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="o-img">
            <ImageIcon size={13} className="text-muted-foreground"/> Restaurant Image URL
            <span className="text-muted-foreground font-normal ml-1">(optional)</span>
          </FieldLabel>
          <Input id="o-img" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..."/>
        </Field>

        {/* Terms */}
        <div className="flex items-start gap-2.5">
          <input type="checkbox" id="o-terms" checked={agreed}
            onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-primary"/>
          <label htmlFor="o-terms" className="text-xs text-muted-foreground leading-relaxed">
            I agree to the{" "}
            <Link href="/terms"   className="text-primary font-bold hover:underline">Terms</Link>{" "}and{" "}
            <Link href="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>
          </label>
        </div>
        {errors.agreed && <FieldError>{errors.agreed}</FieldError>}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
            <AlertCircle size={14}/>{error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="shimmer-btn text-white border-0 w-full h-11">
          {loading ? <Loader2 size={15} className="animate-spin"/> : "Register Restaurant"}
        </Button>

      </FieldGroup>
    </form>
  )
}