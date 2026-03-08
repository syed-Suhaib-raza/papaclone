"use client"

import Image from "next/image"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"

function Logo() {
  return (
    <span className="font-black tracking-tight text-4xl">
      🍕{" "}
      <span className="text-foreground">Smart</span>
      <span className="gradient-text">Food</span>
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

  return (
    <div className="h-screen w-screen flex items-center justify-center relative overflow-hidden theme-transition
      bg-[linear-gradient(135deg,#fff5f5_0%,#fff0e8_40%,#fff5f5_100%)]
      dark:bg-[linear-gradient(135deg,oklch(0.10_0.01_285)_0%,oklch(0.16_0.04_17)_40%,oklch(0.10_0.01_285)_100%)]">

      {/* Gradient blobs */}
      <div className="absolute top-[-10%] left-[-8%] w-[35vw] h-[35vw] rounded-full blur-[80px] pointer-events-none bg-[oklch(0.586_0.253_17.585/25%)]" />
      <div className="absolute bottom-[-10%] right-[-8%] w-[32vw] h-[32vw] rounded-full blur-[80px] pointer-events-none bg-[oklch(0.81_0.117_11.638/20%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[25vw] rounded-full blur-[100px] pointer-events-none bg-[oklch(0.645_0.246_16.439/10%)]" />

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none
        [background-image:radial-gradient(circle,#000_1px,transparent_1px)]
        dark:[background-image:radial-gradient(circle,#fff_1px,transparent_1px)]
        [background-size:26px_26px]" />

      {/* Spinning rings */}
      <div className="absolute w-[50vw] h-[50vw] max-w-[560px] max-h-[560px] rounded-full border border-black/5 dark:border-white/5 spin-cw pointer-events-none" />
      <div className="absolute w-[36vw] h-[36vw] max-w-[400px] max-h-[400px] rounded-full border border-black/5 dark:border-white/5 spin-ccw pointer-events-none" />

      {/* Back button */}
      <Link href="/" className="absolute top-5 left-5 z-20">
        <button className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-all backdrop-blur-sm hover:scale-105
          text-black/50 dark:text-white/60 border border-black/10 dark:border-white/10 bg-black/[0.04] dark:bg-white/[0.05]">
          <ArrowLeft size={12} /> Home
        </button>
      </Link>

      {/* Dark / Light toggle */}
      <button
        onClick={() => setDark(d => !d)}
        className="mode-btn absolute top-5 right-5 z-20
          bg-black/[0.06] dark:bg-white/[0.07]
          border-black/[0.12] dark:border-white/[0.12]
          text-gray-500 dark:text-yellow-300"
      >
        {dark ? <Moon size={15} /> : <Sun size={15} />}
      </button>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[400px] mx-4">

        {/* Gradient border glow */}
        <div className="absolute -inset-[1px] rounded-[2rem] pointer-events-none"
          style={{ background: "linear-gradient(135deg, oklch(0.586 0.253 17.585 / 55%), oklch(0.645 0.246 16.439 / 25%), oklch(0.81 0.117 11.638 / 35%))" }} />

        <div className="relative rounded-[2rem] overflow-hidden backdrop-blur-2xl px-7 py-7 theme-transition
          bg-white/[0.92] dark:bg-[oklch(0.13_0.008_285/88%)]">

          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: "linear-gradient(to right, oklch(0.586 0.253 17.585), oklch(0.645 0.246 16.439), oklch(0.81 0.117 11.638))" }} />

          {/* Panda + Logo row */}
          <div className="flex items-center justify-between mb-5">
            <Logo />
            <div className="relative">
              <div className="absolute inset-0 rounded-xl blur-lg scale-110 bg-[oklch(0.586_0.253_17.585/45%)]" />
              <Image src="/panda.svg" alt="SmartFood mascot" width={80} height={80} className="relative rounded-xl" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-white dark:border-[oklch(0.13_0.008_285)]" />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-5">
            <h1 className="text-base font-black leading-tight mb-0.5 text-foreground">Welcome back 👋</h1>
            <p className="text-xs text-muted-foreground">Sign in to continue ordering</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full rounded-xl pl-9 pr-4 py-3 text-sm outline-none transition-all
                    bg-muted border border-border text-foreground
                    focus:border-primary/70 placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</label>
                <a href="#" className="text-[10px] font-bold hover:underline text-chart-1">Forgot?</a>
              </div>
              <div className="relative">
                <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full rounded-xl pl-9 pr-10 py-3 text-sm outline-none transition-all
                    bg-muted border border-border text-foreground
                    focus:border-primary/70 placeholder:text-muted-foreground"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors text-muted-foreground">
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
              <Separator className="flex-1 bg-border" />
              <span className="text-[10px] font-semibold text-muted-foreground">or continue with</span>
              <Separator className="flex-1 bg-border" />
            </div>

            {/* Social */}
            <div className="grid grid-cols-1 gap-2.5">
              <button className="shimmer-btn glow-btn-150 flex items-center justify-center border rounded-lg shadow-sm px-4 py-2 text-sm font-medium text-white-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
  <img src="https://docs.material-tailwind.com/icons/google.svg" alt="Google logo" className="h-5 w-5 mr-3" />
  Continue with Google
</button>

              
            </div>

          </form>

          {/* Sign up */}
          <p className="text-center text-[11px] mt-4 text-muted-foreground">
            New to SmartFood?{" "}
            <a href="#" className="font-black hover:underline text-chart-1">Create account →</a>
          </p>

          {/* FOOD20 nudge */}
          <div className="mt-3 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 bg-primary/10 border border-primary/20">
            <span className="text-lg">🎁</span>
            <div>
              <p className="text-[11px] font-black text-foreground">New user? Get 20% off</p>
              <p className="text-[10px] text-muted-foreground">
                Use code <span className="font-black text-chart-1">FOOD20</span> · Expires tonight
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}