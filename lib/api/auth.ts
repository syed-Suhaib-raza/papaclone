// lib/api/auth.ts
// All authentication API call functions

// ─── Types ────────────────────────────────────────────────
export type Role = "customer" | "owner" | "rider"

export interface RegisterPayload {
  name:            string
  email:           string
  phone:           string
  password:        string
  role:            Role
  // owner fields
  restaurantName?: string
  address?:        string
  city?:           string
  cuisine?:        string
  cnic?:           string
  // rider fields
  vehicleType?:    string
  vehicleNumber?:  string
}

export interface AuthResponse {
  user:  { id: string; name: string; email: string; role: Role }
  token: string
}

// ─── Register ─────────────────────────────────────────────
export async function apiRegister(data: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch("/api/auth/register", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  })
  if (!res.ok) throw new Error((await res.json()).message || "Registration failed")
  return res.json()
}

// ─── Check if email already exists ────────────────────────
export async function apiCheckEmail(email: string): Promise<{ exists: boolean }> {
  const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`)
  if (!res.ok) throw new Error("Failed to check email")
  return res.json()
}

// ─── Send OTP to phone ────────────────────────────────────
export async function apiSendOtp(phone: string): Promise<{ success: boolean }> {
  const res = await fetch("/api/auth/send-otp", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ phone }),
  })
  if (!res.ok) throw new Error("Failed to send OTP")
  return res.json()
}

// ─── Verify OTP ───────────────────────────────────────────
export async function apiVerifyOtp(phone: string, otp: string): Promise<{ verified: boolean }> {
  const res = await fetch("/api/auth/verify-otp", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ phone, otp }),
  })
  if (!res.ok) throw new Error("Invalid OTP")
  return res.json()
}

// ─── Password strength helper ─────────────────────────────
export function getPasswordStrength(p: string): {
  score: number; label: string; color: string
} {
  if (!p) return { score: 0, label: "", color: "" }
  let score = 0
  if (p.length >= 8)          score += 25
  if (/[A-Z]/.test(p))        score += 25
  if (/[0-9]/.test(p))        score += 25
  if (/[^A-Za-z0-9]/.test(p)) score += 25
  if (score <= 25) return { score, label: "Weak",   color: "bg-red-500"    }
  if (score <= 50) return { score, label: "Fair",   color: "bg-yellow-500" }
  if (score <= 75) return { score, label: "Good",   color: "bg-blue-500"   }
  return               { score, label: "Strong", color: "bg-green-500"  }
}

// ─── Validation helpers ───────────────────────────────────
export interface BaseForm {
  name:            string
  email:           string
  phone:           string
  password:        string
  confirmPassword: string
  agreed:          boolean
}

export function validateBase(form: BaseForm): Partial<Record<keyof BaseForm, string>> {
  const e: Partial<Record<keyof BaseForm, string>> = {}
  if (!form.name || form.name.length < 3)
    e.name = "Name must be at least 3 characters"
  if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
    e.email = "Enter a valid email"
  if (!form.phone || !/^03\d{2}-?\d{7}$/.test(form.phone))
    e.phone = "Enter a valid Pakistani number e.g. 03xx-xxxxxxx"
  if (!form.password || form.password.length < 8)
    e.password = "Password must be at least 8 characters"
  if (form.password !== form.confirmPassword)
    e.confirmPassword = "Passwords do not match"
  if (!form.agreed)
    e.agreed = "You must agree to the terms"
  return e
}