"use client"

import Image from "next/image"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"

function Logo({ dark }: { dark: boolean }) {
  return (
    <span className="font-black tracking-tight text-4xl">
      🍕{" "}
      <span style={{ color: dark ? "rgba(255,255,255,0.9)" : "#111" }}>Smart</span>
      <span style={{
        background: "linear-gradient(135deg, oklch(0.586 0.253 17.585), oklch(0.645 0.246 16.439), oklch(0.81 0.117 11.638))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>Food</span>
    </span>
  )
}

export default function LoginPage() {
  const [dark, setDark]         = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 1800)
  }

  // Dynamic theme values
  const pageBg = dark
    ? "linear-gradient(135deg, oklch(0.10 0.01 285) 0%, oklch(0.16 0.04 17) 40%, oklch(0.10 0.01 285) 100%)"
    : "linear-gradient(135deg, #fff5f5 0%, #fff0e8 40%, #fff5f5 100%)"
  const cardBg      = dark ? "oklch(0.13 0.008 285 / 88%)" : "rgba(255,255,255,0.92)"
  const inputBg     = dark ? "oklch(1 0 0 / 5%)"           : "rgba(0,0,0,0.04)"
  const inputBorder = dark ? "oklch(1 0 0 / 10%)"          : "rgba(0,0,0,0.12)"
  const labelColor  = dark ? "rgba(255,255,255,0.35)"       : "rgba(0,0,0,0.4)"
  const textColor   = dark ? "white"                        : "#111"
  const subColor    = dark ? "rgba(255,255,255,0.35)"       : "rgba(0,0,0,0.4)"
  const ringColor   = dark ? "border-white/5"               : "border-black/5"
  const dotColor    = dark ? "white"                        : "#000"
  const nudgeBg     = dark ? "oklch(0.586 0.253 17.585 / 10%)" : "oklch(0.586 0.253 17.585 / 6%)"
  const nudgeBorder = dark ? "oklch(0.586 0.253 17.585 / 22%)" : "oklch(0.586 0.253 17.585 / 30%)"
  const socialBg    = dark ? "oklch(1 0 0 / 8%)"            : "rgba(0,0,0,0.05)"
  const socialBorder= dark ? "oklch(1 0 0 / 12%)"           : "rgba(0,0,0,0.1)"
  const backBtnStyle= dark
    ? { color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }
    : { color: "rgba(0,0,0,0.5)",       border: "1px solid rgba(0,0,0,0.1)",       background: "rgba(0,0,0,0.04)" }

  return (
    <div className="h-screen w-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: pageBg, transition: "background 0.4s ease" }}>

      {/* Gradient blobs */}
      <div className="absolute top-[-10%] left-[-8%] w-[35vw] h-[35vw] rounded-full blur-[80px] pointer-events-none"
        style={{ background: "oklch(0.586 0.253 17.585 / 25%)" }} />
      <div className="absolute bottom-[-10%] right-[-8%] w-[32vw] h-[32vw] rounded-full blur-[80px] pointer-events-none"
        style={{ background: "oklch(0.81 0.117 11.638 / 20%)" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[25vw] rounded-full blur-[100px] pointer-events-none"
        style={{ background: "oklch(0.645 0.246 16.439 / 10%)" }} />

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`, backgroundSize: "26px 26px" }} />

      {/* Spinning rings */}
      <div className={`absolute w-[50vw] h-[50vw] max-w-[560px] max-h-[560px] rounded-full border spin-cw pointer-events-none ${ringColor}`} />
      <div className={`absolute w-[36vw] h-[36vw] max-w-[400px] max-h-[400px] rounded-full border spin-ccw pointer-events-none ${ringColor}`} />

      {/* Back button */}
      <Link href="/" className="absolute top-5 left-5 z-20">
        <button className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-all backdrop-blur-sm hover:scale-105"
          style={backBtnStyle}>
          <ArrowLeft size={12} /> Home
        </button>
      </Link>

      {/* Dark / Light toggle */}
      <button
        onClick={() => setDark(d => !d)}
        className="mode-btn absolute top-5 right-5 z-20"
        style={{
          background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
          borderColor: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
          color: dark ? "#fbbf24" : "#6b7280",
        }}
      >
        {dark ? <Moon size={15} /> : <Sun size={15} />}
      </button>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[400px] mx-4">

        {/* Gradient border glow */}
        <div className="absolute -inset-[1px] rounded-[2rem] pointer-events-none"
          style={{ background: "linear-gradient(135deg, oklch(0.586 0.253 17.585 / 55%), oklch(0.645 0.246 16.439 / 25%), oklch(0.81 0.117 11.638 / 35%))" }} />

        <div className="relative rounded-[2rem] overflow-hidden backdrop-blur-2xl px-7 py-7"
          style={{ background: cardBg, transition: "background 0.4s ease" }}>

          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: "linear-gradient(to right, oklch(0.586 0.253 17.585), oklch(0.645 0.246 16.439), oklch(0.81 0.117 11.638))" }} />

          {/* Panda + Logo row */}
          <div className="flex items-center justify-between mb-5">
            <Logo dark={dark} />
            <div className="relative">
              <div className="absolute inset-0 rounded-xl blur-lg scale-110"
                style={{ background: "oklch(0.586 0.253 17.585 / 45%)" }} />
              <Image src="/panda.svg" alt="SmartFood mascot" width={80} height={80} className="relative rounded-xl" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2"
                style={{ borderColor: dark ? "oklch(0.13 0.008 285)" : "white" }} />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-5">
            <h1 className="text-base font-black leading-tight mb-0.5" style={{ color: textColor }}>Welcome back 👋</h1>
            <p className="text-xs" style={{ color: subColor }}>Sign in to continue ordering</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: labelColor }}>Email</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: labelColor }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full rounded-xl pl-9 pr-4 py-3 text-sm outline-none transition-all"
                  style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textColor }}
                  onFocus={e => e.currentTarget.style.borderColor = "oklch(0.586 0.253 17.585 / 70%)"}
                  onBlur={e => e.currentTarget.style.borderColor = inputBorder}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: labelColor }}>Password</label>
                <a href="#" className="text-[10px] font-bold hover:underline" style={{ color: "oklch(0.81 0.117 11.638)" }}>Forgot?</a>
              </div>
              <div className="relative">
                <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: labelColor }} />
                <input
                  type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full rounded-xl pl-9 pr-10 py-3 text-sm outline-none transition-all"
                  style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textColor }}
                  onFocus={e => e.currentTarget.style.borderColor = "oklch(0.586 0.253 17.585 / 70%)"}
                  onBlur={e => e.currentTarget.style.borderColor = inputBorder}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: labelColor }}>
                  {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="shimmer-btn glow-btn w-full rounded-xl py-3.5 font-black text-white text-sm disabled:opacity-60 flex items-center justify-center gap-2 transition-all mt-0.5">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
              ) : "Sign In →"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <Separator className="flex-1" style={{ background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }} />
              <span className="text-[10px] font-semibold" style={{ color: subColor }}>or continue with</span>
              <Separator className="flex-1" style={{ background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }} />
            </div>

            {/* Social */}
            <div className="grid grid-cols-2 gap-2.5">
              <button type="button"
                className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all hover:scale-[1.02]"
                style={{ background: socialBg, border: `1px solid ${socialBorder}`, color: textColor }}>
                <span className="font-black text-sm">G</span> Google
              </button>
              <button type="button"
                className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all hover:scale-[1.02]"
                style={{ background: "#1877f2", color: "white" }}>
                <span className="font-black text-sm">f</span> Facebook
              </button>
            </div>

          </form>

          {/* Sign up */}
          <p className="text-center text-[11px] mt-4" style={{ color: subColor }}>
            New to SmartFood?{" "}
            <a href="#" className="font-black hover:underline" style={{ color: "oklch(0.81 0.117 11.638)" }}>Create account →</a>
          </p>

          {/* FOOD20 nudge */}
          <div className="mt-3 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
            style={{ background: nudgeBg, border: `1px solid ${nudgeBorder}` }}>
            <span className="text-lg">🎁</span>
            <div>
              <p className="text-[11px] font-black" style={{ color: textColor }}>New user? Get 20% off</p>
              <p className="text-[10px]" style={{ color: subColor }}>
                Use code <span className="font-black" style={{ color: "oklch(0.81 0.117 11.638)" }}>FOOD20</span> · Expires tonight
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}