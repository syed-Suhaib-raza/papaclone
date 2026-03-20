// components/SignUp/CustomerForm.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AlertCircle, Loader2, Eye, EyeOff,
  Mail, Lock, User, CheckCircle2, Phone,
} from "lucide-react"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { supabase } from "@/lib/supaBaseClient"

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
      <Input
        id={id} type={show ? "text" : "password"}
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} className="pr-10"
      />
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
        {show ? <EyeOff size={15}/> : <Eye size={15}/>}
      </button>
    </div>
  )
}

interface Props { onSuccess: () => void }

export default function CustomerForm({ onSuccess }: Props) {

  // ── Fields ────────────────────────────────────────────
  const [name,     setName]     = useState("")  // → users.name
  const [email,    setEmail]    = useState("")  // → auth.users (supabase handles)
  const [phone,    setPhone]    = useState("")  // → users.phone
  const [password, setPassword] = useState("")  // → auth.users (supabase handles)
  const [confirm,  setConfirm]  = useState("")
  const [agreed,   setAgreed]   = useState(false)

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [errors,  setErrors]  = useState<Record<string, string>>({})

  const strength = getStrength(password)

  function validate() {
    const e: Record<string, string> = {}
    if (!name)                                                 e.name     = "Full name is required"
    if (!email)                                                e.email    = "Email is required"
    if (!phone || !/^03\d{9}$/.test(phone.replace(/-/g, ""))) e.phone    = "Enter valid number e.g. 03001234567"
    if (!password || password.length < 8)                      e.password = "Min 8 characters"
    if (password !== confirm)                                  e.confirm  = "Passwords do not match"
    if (!agreed)                                               e.agreed   = "Please agree to the terms"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError("")

    // 1. Create auth user — email + password go to Supabase auth.users
    const { data, error: authErr } = await supabase.auth.signUp({ email, password })
    if (authErr) { setError(authErr.message); setLoading(false); return }

    // 2. Insert into users table
    // schema: id, name, phone, role, created_at
    const { error: dbErr } = await supabase
      .from("users")
      .upsert([{
        id:    data.user?.id,
        name,
        phone,
        role:  "customer",
      }], { onConflict: "id" })

    if (dbErr) { setError(dbErr.message); setLoading(false); return }

    setLoading(false)
    onSuccess() // ← no args, just notify page
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="py-2">

        {/* Name → users.name */}
        <Field>
          <FieldLabel htmlFor="c-name">
            <User size={13} className="text-muted-foreground"/> Full Name
          </FieldLabel>
          <Input
            id="c-name" value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ali Hassan" required
          />
          {errors.name && <FieldError>{errors.name}</FieldError>}
        </Field>

        {/* Email → auth.users */}
        <Field>
          <FieldLabel htmlFor="c-email">
            <Mail size={13} className="text-muted-foreground"/> Email
          </FieldLabel>
          <Input
            id="c-email" type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="ali@gmail.com" required
          />
          {errors.email && <FieldError>{errors.email}</FieldError>}
        </Field>

        {/* Phone → users.phone */}
        <Field>
          <FieldLabel htmlFor="c-phone">
            <Phone size={13} className="text-muted-foreground"/> Phone Number
          </FieldLabel>
          <Input
            id="c-phone" value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="03001234567"
          />
          {errors.phone && <FieldError>{errors.phone}</FieldError>}
        </Field>

        {/* Password → auth.users */}
        <Field>
          <FieldLabel htmlFor="c-pass">
            <Lock size={13} className="text-muted-foreground"/> Password
          </FieldLabel>
          <PasswordInput id="c-pass" value={password} onChange={setPassword}/>
          {password && (
            <div className="mt-1.5 flex items-center gap-2">
              <Progress value={strength.score} className="flex-1 h-1.5"/>
              <span className={`text-[10px] font-black ${strength.color}`}>{strength.label}</span>
            </div>
          )}
          {errors.password && <FieldError>{errors.password}</FieldError>}
        </Field>

        {/* Confirm password */}
        <Field>
          <FieldLabel htmlFor="c-confirm">
            <Lock size={13} className="text-muted-foreground"/> Confirm Password
          </FieldLabel>
          <PasswordInput id="c-confirm" value={confirm} onChange={setConfirm} placeholder="Repeat password"/>
          {confirm && password === confirm && (
            <p className="text-[10px] text-green-500 flex items-center gap-1 mt-1">
              <CheckCircle2 size={11}/> Passwords match
            </p>
          )}
          {errors.confirm && <FieldError>{errors.confirm}</FieldError>}
        </Field>

        {/* Terms */}
        <div className="flex items-start gap-2.5">
          <input type="checkbox" id="c-terms" checked={agreed}
            onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-primary"/>
          <label htmlFor="c-terms" className="text-xs text-muted-foreground leading-relaxed">
            I agree to the{" "}
            <Link href="/terms"   className="text-primary font-bold hover:underline">Terms</Link>{" "}and{" "}
            <Link href="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>
          </label>
        </div>
        {errors.agreed && <FieldError>{errors.agreed}</FieldError>}

        {/* API error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
            <AlertCircle size={14}/>{error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="shimmer-btn text-white border-0 w-full h-11">
          {loading ? <Loader2 size={15} className="animate-spin"/> : "Create Account"}
        </Button>

      </FieldGroup>
    </form>
  )
}