// components/SignUp/RiderForm.tsx
"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import {
  AlertCircle, Loader2, Eye, EyeOff,
  Mail, Lock, User, CheckCircle2,
  Phone, Car, CreditCard, Building2,
  Upload, FileText, X,
} from "lucide-react"
import { Button }    from "@/components/ui/button"
import { Input }     from "@/components/ui/input"
import { Progress }  from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
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
      <Input id={id} type={show ? "text" : "password"} value={value}
        onChange={e => onChange(e.target.value)} placeholder={placeholder} className="pr-10"/>
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
        {show ? <EyeOff size={15}/> : <Eye size={15}/>}
      </button>
    </div>
  )
}

const BANKS = [
  "HBL", "UBL", "MCB", "Allied Bank", "Meezan Bank",
  "Bank Alfalah", "Askari Bank", "Standard Chartered",
  "Easypaisa", "JazzCash",
]

interface Props { onSuccess: () => void }

export default function RiderForm({ onSuccess }: Props) {

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name,              setName]              = useState("")
  const [email,             setEmail]             = useState("")
  const [phone,             setPhone]             = useState("")
  const [password,          setPassword]          = useState("")
  const [confirm,           setConfirm]           = useState("")
  const [vehicleType,       setVehicleType]       = useState("")
  const [bankAccountName,   setBankAccountName]   = useState("")
  const [bankAccountNumber, setBankAccountNumber] = useState("")
  const [bankName,          setBankName]          = useState("")
  const [agreed,            setAgreed]            = useState(false)

  // ── Document upload state ──────────────────────────────
  const [docFile,       setDocFile]       = useState<File | null>(null)
  const [uploading,     setUploading]     = useState(false)
  const [docUrl,        setDocUrl]        = useState("")

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const [errors,  setErrors]  = useState<Record<string, string>>({})

  const strength = getStrength(password)

  // ── Handle file select ────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Only allow images and PDFs
    const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    if (!allowed.includes(file.type)) {
      setErrors(prev => ({ ...prev, doc: "Only JPG, PNG or PDF allowed" }))
      return
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, doc: "File must be under 5MB" }))
      return
    }

    setDocFile(file)
    setErrors(prev => ({ ...prev, doc: "" }))
  }

  function removeFile() {
    setDocFile(null)
    setDocUrl("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // ── Upload doc to Supabase Storage ────────────────────
  async function uploadDocument(userId: string): Promise<string | null> {
    if (!docFile) return null
    setUploading(true)

    const ext      = docFile.name.split(".").pop()
    const filePath = `${userId}/vehicle-doc.${ext}`

    const { error } = await supabase.storage
      .from("rider-documents")
      .upload(filePath, docFile, { upsert: true })

    setUploading(false)

    if (error) throw new Error(`Document upload error: ${error.message}`)

    // Get public URL — since bucket is private, use signed URL
    const { data } = supabase.storage
      .from("rider-documents")
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!name)                                                  e.name              = "Full name is required"
    if (!email)                                                 e.email             = "Email is required"
    if (!phone || !/^03\d{9}$/.test(phone.replace(/-/g, "")))  e.phone             = "Enter valid number e.g. 03001234567"
    if (!password || password.length < 8)                       e.password          = "Min 8 characters"
    if (password !== confirm)                                   e.confirm           = "Passwords do not match"
    if (!vehicleType)                                           e.vehicleType       = "Select vehicle type"
    if (!docFile)                                               e.doc               = "Vehicle document is required"
    if (!bankAccountName)                                       e.bankAccountName   = "Account holder name is required"
    if (!bankAccountNumber)                                     e.bankAccountNumber = "Account number is required"
    if (!bankName)                                              e.bankName          = "Select your bank"
    if (!agreed)                                                e.agreed            = "Please agree to the terms"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError("")

    try {
      // ── Step 1: Create auth user ───────────────────────
      const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password })
      if (authErr) throw new Error(`Auth error: ${authErr.message}`)

      let userId = authData.user?.id

      if (!userId) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
        if (signInErr) throw new Error(`Sign in error: ${signInErr.message}`)
        userId = signInData.user?.id
      }

      if (!userId) throw new Error("Could not get user ID. Please try again.")

      // ── Step 2: Upload vehicle document ───────────────
      const vehicleDocUrl = await uploadDocument(userId)

      // ── Step 3: Insert into users table ───────────────
      const { error: userErr } = await supabase
        .from("users")
        .upsert({ id: userId, name, role: "rider" }, { onConflict: "id" })
      if (userErr) throw new Error(`Users table error: ${userErr.message}`)

      // ── Step 4: Insert into riders table ──────────────
      const { error: riderErr } = await supabase
        .from("riders")
        .upsert({
          id:                   userId,
          name,
          email,
          phone,
          vehicle_type:         vehicleType,
          vehicle_document_url: vehicleDocUrl,
          bank_account_name:    bankAccountName,
          bank_account_number:  bankAccountNumber,
          bank_name:            bankName,
          rating:               null,
          total_deliveries:     0,
          status:               "inactive",
          document_verified:    false,
        }, { onConflict: "id" })
      if (riderErr) throw new Error(`Riders table error: ${riderErr.message}`)

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
          <FieldLabel htmlFor="r-name">
            <User size={13} className="text-muted-foreground"/> Full Name
          </FieldLabel>
          <Input id="r-name" value={name} onChange={e => setName(e.target.value)} placeholder="Ali Hassan" required/>
          {errors.name && <FieldError>{errors.name}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="r-email">
            <Mail size={13} className="text-muted-foreground"/> Email
          </FieldLabel>
          <Input id="r-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ali@gmail.com" required/>
          {errors.email && <FieldError>{errors.email}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="r-phone">
            <Phone size={13} className="text-muted-foreground"/> Phone Number
          </FieldLabel>
          <Input id="r-phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="03001234567"/>
          {errors.phone && <FieldError>{errors.phone}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="r-pass">
            <Lock size={13} className="text-muted-foreground"/> Password
          </FieldLabel>
          <PasswordInput id="r-pass" value={password} onChange={setPassword}/>
          {password && (
            <div className="mt-1.5 flex items-center gap-2">
              <Progress value={strength.score} className="flex-1 h-1.5"/>
              <span className={`text-[10px] font-black ${strength.color}`}>{strength.label}</span>
            </div>
          )}
          {errors.password && <FieldError>{errors.password}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="r-confirm">
            <Lock size={13} className="text-muted-foreground"/> Confirm Password
          </FieldLabel>
          <PasswordInput id="r-confirm" value={confirm} onChange={setConfirm} placeholder="Repeat password"/>
          {confirm && password === confirm && (
            <p className="text-[10px] text-green-500 flex items-center gap-1 mt-1">
              <CheckCircle2 size={11}/> Passwords match
            </p>
          )}
          {errors.confirm && <FieldError>{errors.confirm}</FieldError>}
        </Field>

        {/* ── Rider details ── */}
        <Separator/>
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Rider Details
        </p>

        <Field>
          <FieldLabel htmlFor="r-vtype">
            <Car size={13} className="text-muted-foreground"/> Vehicle Type
          </FieldLabel>
          <select id="r-vtype" value={vehicleType} onChange={e => setVehicleType(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm outline-none focus-visible:border-ring">
            <option value="">Select vehicle type</option>
            <option value="bike">Bike</option>
            <option value="cycle">Cycle</option>
            <option value="scooter">Scooter</option>
          </select>
          {errors.vehicleType && <FieldError>{errors.vehicleType}</FieldError>}
        </Field>

        {/* ── Vehicle Document Upload ── */}
        <Field>
          <FieldLabel>
            <FileText size={13} className="text-muted-foreground"/> Vehicle Document
          </FieldLabel>

          {!docFile ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center gap-2 px-4 py-5 rounded-xl
                border-2 border-dashed border-input hover:border-primary/50
                bg-muted/50 hover:bg-muted transition-all cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload size={16} className="text-primary"/>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-foreground">Click to upload vehicle document</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Registration, license or CNIC — JPG, PNG or PDF · Max 5MB
                </p>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                <FileText size={14} className="text-green-600 dark:text-green-400"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{docFile.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {(docFile.size / 1024).toFixed(0)} KB · Ready to upload
                </p>
              </div>
              <button type="button" onClick={removeFile}
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                <X size={14}/>
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          {errors.doc && <FieldError>{errors.doc}</FieldError>}
        </Field>

        {/* ── Bank details ── */}
        <Separator/>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Bank Details
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            For receiving your delivery earnings
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="r-bname">
            <Building2 size={13} className="text-muted-foreground"/> Bank Name
          </FieldLabel>
          <select id="r-bname" value={bankName} onChange={e => setBankName(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm outline-none focus-visible:border-ring">
            <option value="">Select bank</option>
            {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          {errors.bankName && <FieldError>{errors.bankName}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="r-baname">
            <User size={13} className="text-muted-foreground"/> Account Holder Name
          </FieldLabel>
          <Input id="r-baname" value={bankAccountName}
            onChange={e => setBankAccountName(e.target.value)}
            placeholder="As shown on your bank account"/>
          {errors.bankAccountName && <FieldError>{errors.bankAccountName}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="r-banum">
            <CreditCard size={13} className="text-muted-foreground"/> Account Number / IBAN
          </FieldLabel>
          <Input id="r-banum" value={bankAccountNumber}
            onChange={e => setBankAccountNumber(e.target.value)}
            placeholder="PK00XXXX0000000000000000"/>
          {errors.bankAccountNumber && <FieldError>{errors.bankAccountNumber}</FieldError>}
        </Field>

        <div className="flex items-start gap-2.5">
          <input type="checkbox" id="r-terms" checked={agreed}
            onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-primary"/>
          <label htmlFor="r-terms" className="text-xs text-muted-foreground leading-relaxed">
            I agree to the{" "}
            <Link href="/terms" className="text-primary font-bold hover:underline">Terms</Link>{" "}and{" "}
            <Link href="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>
          </label>
        </div>
        {errors.agreed && <FieldError>{errors.agreed}</FieldError>}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
            <AlertCircle size={14}/> {error}
          </div>
        )}

        <Button type="submit" disabled={loading || uploading} className="shimmer-btn text-white border-0 w-full h-11">
          {uploading
            ? <><Loader2 size={15} className="animate-spin"/> Uploading document...</>
            : loading
            ? <><Loader2 size={15} className="animate-spin"/> Creating account...</>
            : "Join as Rider"
          }
        </Button>

      </FieldGroup>
    </form>
  )
}