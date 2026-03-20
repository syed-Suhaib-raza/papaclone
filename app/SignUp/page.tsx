// app/signup/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, ArrowLeft, Sparkles, Star, Zap, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import ThemeToggle from "@/components/theme-toggle"

import CustomerForm from "@/components/SignUp/customer"
import OwnerForm    from "@/components/SignUp/restaurant"
import RiderForm    from "@/components/SignUp/rider"

// ── Role config ───────────────────────────────────────────
const ROLES = [
  {
    id:       "customer",
    emoji:    "🛒",
    label:    "Customer",
    sub:      "Order Food",
    desc:     "Browse 500+ restaurants and get food delivered to your door",
    grad:     "from-blue-500/20 via-blue-400/10 to-transparent",
    border:   "border-blue-400/60",
    activeBg: "bg-blue-500/10",
    badge:    "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    glow:     "shadow-blue-500/20",
  },
  {
    id:       "owner",
    emoji:    "🍽️",
    label:    "Restaurant",
    sub:      "Sell Food",
    desc:     "List your restaurant and reach thousands of hungry customers",
    grad:     "from-primary/20 via-orange-400/10 to-transparent",
    border:   "border-primary/60",
    activeBg: "bg-primary/10",
    badge:    "bg-primary/15 text-primary",
    glow:     "shadow-primary/20",
  },
  {
    id:       "rider",
    emoji:    "🏍️",
    label:    "Rider",
    sub:      "Deliver & Earn",
    desc:     "Deliver orders on your schedule and earn great income",
    grad:     "from-green-500/20 via-emerald-400/10 to-transparent",
    border:   "border-green-400/60",
    activeBg: "bg-green-500/10",
    badge:    "bg-green-500/15 text-green-600 dark:text-green-400",
    glow:     "shadow-green-500/20",
  },
]

// ── Feature highlights ────────────────────────────────────
const FEATURES = [
  { icon: <Zap size={14}/>,    label: "Instant delivery" },
  { icon: <Shield size={14}/>, label: "100% secure"      },
  { icon: <Star size={14}/>,   label: "500+ restaurants" },
]

export default function SignUpPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("customer")
  const [verified,  setVerified]  = useState(false)

  const activeRole = ROLES.find(r => r.id === activeTab)!

  function handleFormSuccess() {
    setVerified(true)
    setTimeout(() => {
      if (activeTab === "customer") router.push("/customer")
      if (activeTab === "owner")    router.push("/restaurant")
      if (activeTab === "rider")    router.push("/rider/dashboard")
    }, 1800)
  }



  // ── Success screen ────────────────────────────────────────
  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden theme-transition
        bg-[linear-gradient(135deg,#fff5f5_0%,#fff0e8_40%,#fff5f5_100%)]
        dark:bg-[linear-gradient(135deg,oklch(0.10_0.01_285)_0%,oklch(0.16_0.04_17)_40%,oklch(0.10_0.01_285)_100%)]">
        <div className="absolute top-[-10%] left-[-8%] w-[40vw] h-[40vw] rounded-full blur-[90px] pointer-events-none bg-[oklch(0.586_0.253_17.585/25%)]"/>
        <div className="absolute bottom-[-10%] right-[-8%] w-[35vw] h-[35vw] rounded-full blur-[80px] pointer-events-none bg-[oklch(0.81_0.117_11.638/20%)]"/>
        <div className="text-center relative z-10">
          <div className="text-7xl mb-6 animate-bounce">🎉</div>
          <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30">
            <CheckCircle2 size={44} className="text-green-500"/>
          </div>
          <h2 className="text-3xl font-black text-foreground mb-2">You're in!</h2>
          <p className="text-muted-foreground">Account created. Redirecting you now...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden theme-transition
      bg-[linear-gradient(135deg,#fff5f5_0%,#fff0e8_40%,#fff5f5_100%)]
      dark:bg-[linear-gradient(135deg,oklch(0.10_0.01_285)_0%,oklch(0.16_0.04_17)_40%,oklch(0.10_0.01_285)_100%)]">

      {/* ── Background ── */}
      <div className="absolute top-[-15%] left-[-10%] w-[45vw] h-[45vw] rounded-full blur-[100px] pointer-events-none bg-[oklch(0.586_0.253_17.585/22%)]"/>
      <div className="absolute bottom-[-15%] right-[-10%] w-[40vw] h-[40vw] rounded-full blur-[90px] pointer-events-none bg-[oklch(0.81_0.117_11.638/18%)]"/>
      <div className="absolute top-[35%] right-[8%] w-[22vw] h-[22vw] rounded-full blur-[70px] pointer-events-none bg-[oklch(0.645_0.246_16.439/12%)]"/>
      <div className="absolute bottom-[25%] left-[8%] w-[18vw] h-[18vw] rounded-full blur-[60px] pointer-events-none bg-[oklch(0.586_0.253_17.585/10%)]"/>

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none
        [background-image:radial-gradient(circle,#000_1px,transparent_1px)]
        dark:[background-image:radial-gradient(circle,#fff_1px,transparent_1px)]
        [background-size:26px_26px]"/>

      {/* Spinning rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] max-w-[900px] max-h-[900px] rounded-full border border-black/[0.03] dark:border-white/[0.03] spin-cw pointer-events-none"/>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65vw] h-[65vw] max-w-[650px] max-h-[650px] rounded-full border border-black/[0.03] dark:border-white/[0.03] spin-ccw pointer-events-none"/>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42vw] h-[42vw] max-w-[420px] max-h-[420px] rounded-full border border-primary/[0.08] spin-cw pointer-events-none"/>

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-3.5
        border-b border-black/[0.06] dark:border-white/[0.05]
        backdrop-blur-md bg-white/50 dark:bg-black/15">

        <Link href="/" className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full
          text-black/50 dark:text-white/50 border border-black/10 dark:border-white/10
          bg-black/[0.03] dark:bg-white/5 hover:scale-105 transition-transform">
          <ArrowLeft size={11}/> Home
        </Link>

        <Link href="/" className="font-black text-xl tracking-tight absolute left-1/2 -translate-x-1/2">
          🍕 <span className="text-foreground">Smart</span>
          <span className="gradient-text">Food</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
            Have an account? <span className="text-primary">Sign in</span>
          </Link>
          <ThemeToggle/>
        </div>
      </header>

      {/* ── Two-column layout ── */}
      <main className="relative z-10 min-h-[calc(100vh-57px)] lg:grid lg:grid-cols-[1fr_1.1fr]">

        {/* ── LEFT PANEL ── */}
        <div className="hidden lg:flex flex-col justify-center px-12 xl:px-16 py-12 pt-19">

          {/* Heading */}
          <h1 className="text-5xl xl:text-6xl font-black text-foreground leading-[1.1] mb-4">
            Join{" "}
            <span className="relative inline-block">
              <span className="gradient-text">SmartFood</span>
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" preserveAspectRatio="none">
                <path d="M0 4 Q25 1 50 4 Q75 7 100 4 Q125 1 150 4 Q175 7 200 4"
                  fill="none" stroke="oklch(0.586 0.253 17.585)" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </span>
            <br/>today 🚀
          </h1>

          <p className="text-muted-foreground mb-8 text-base leading-relaxed max-w-sm">
            Order food, run a restaurant, or deliver on your schedule. Pick your role and get started in minutes.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mb-10">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                bg-white/60 dark:bg-white/5 border border-black/[0.07] dark:border-white/[0.07]
                text-xs font-bold text-foreground/70 backdrop-blur-sm">
                <span className="text-primary">{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

          {/* Role cards — vertical */}
          <div className="flex flex-col gap-3">
            {ROLES.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveTab(r.id)}
                className={`
                  relative flex items-center gap-4 px-5 py-4 rounded-2xl
                  border-2 text-left transition-all duration-200
                  ${activeTab === r.id
                    ? `${r.activeBg} ${r.border} shadow-xl ${r.glow} scale-[1.02]`
                    : "border-black/[0.07] dark:border-white/[0.07] bg-white/30 dark:bg-white/[0.03] hover:bg-white/50 dark:hover:bg-white/[0.06] hover:scale-[1.01]"
                  }
                `}
              >
                {activeTab === r.id && (
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${r.grad} pointer-events-none`}/>
                )}
                {activeTab === r.id && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md z-10">
                    <CheckCircle2 size={11} className="text-white"/>
                  </span>
                )}
                <span className="text-3xl relative z-10 flex-shrink-0">{r.emoji}</span>
                <div className="relative z-10 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm font-black ${activeTab === r.id ? "text-foreground" : "text-foreground/70"}`}>
                      {r.label}
                    </p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      activeTab === r.id ? r.badge : "bg-muted text-muted-foreground"
                    }`}>
                      {r.sub}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{r.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Sign in */}
          <p className="text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-black hover:underline">Sign in →</Link>
          </p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex flex-col justify-center px-4 sm:px-8 lg:px-10 xl:px-16 py-8 lg:pt-16
          lg:border-l lg:border-black/[0.06] lg:dark:border-white/[0.05]
          lg:bg-white/20 lg:dark:bg-black/10 lg:backdrop-blur-sm">

          {/* Mobile-only title */}
          <div className="lg:hidden text-center mb-6 mt-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3
              bg-primary/10 border border-primary/20 text-primary text-xs font-black">
              <Sparkles size={11}/>
              Pakistan's #1 Food Platform
            </div>
            <h1 className="text-3xl font-black text-foreground mb-1">
              Join <span className="gradient-text">SmartFood</span> 🚀
            </h1>
            <p className="text-muted-foreground text-sm">Pick your role to get started</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>

            {/* Mobile-only role cards */}
            <div className="lg:hidden grid grid-cols-3 gap-2 mb-5">
              {ROLES.map(r => (
                <button key={r.id} type="button" onClick={() => setActiveTab(r.id)}
                  className={`relative flex flex-col items-center gap-1.5 px-2 py-3 rounded-2xl border-2 transition-all duration-200
                    ${activeTab === r.id
                      ? `${r.activeBg} ${r.border} shadow-lg scale-[1.04]`
                      : "border-black/[0.07] dark:border-white/[0.07] bg-white/40 dark:bg-white/[0.03]"
                    }`}
                >
                  {activeTab === r.id && (
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${r.grad} pointer-events-none`}/>
                  )}
                  {activeTab === r.id && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center z-10">
                      <CheckCircle2 size={9} className="text-white"/>
                    </span>
                  )}
                  <span className="text-xl relative z-10">{r.emoji}</span>
                  <span className={`text-[10px] font-black relative z-10 ${activeTab === r.id ? "text-foreground" : "text-muted-foreground"}`}>
                    {r.label}
                  </span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full relative z-10 ${
                    activeTab === r.id ? r.badge : "bg-muted text-muted-foreground"
                  }`}>{r.sub}</span>
                </button>
              ))}
            </div>

            {/* Hidden TabsList */}
            <TabsList className="hidden">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="owner">Owner</TabsTrigger>
              <TabsTrigger value="rider">Rider</TabsTrigger>
            </TabsList>

            {/* Right panel header — desktop only */}
            <div className="hidden lg:block mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl leading-none">{activeRole.emoji}</span>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mb-0.5">
                      Signing up as
                    </p>
                    <p className="text-xl font-black text-foreground leading-none">
                      {activeRole.label}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${activeRole.badge}`}>
                  {activeRole.sub}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 pl-9">
                {activeRole.desc}
              </p>
            </div>

            {/* Form card */}
            <div className="relative">
              <div
                className="absolute -inset-[1.5px] rounded-[1.75rem] pointer-events-none"
                style={{ background: "linear-gradient(135deg, oklch(0.586 0.253 17.585 / 50%), oklch(0.645 0.246 16.439 / 22%), oklch(0.81 0.117 11.638 / 32%))" }}
              />
              <div
                className="absolute -inset-6 rounded-[2.5rem] pointer-events-none blur-2xl opacity-25"
                style={{ background: "linear-gradient(135deg, oklch(0.586 0.253 17.585 / 35%), transparent 55%)" }}
              />
              <Card className="relative bg-white/92 dark:bg-[oklch(0.13_0.008_285/93%)] backdrop-blur-2xl border-0 rounded-[1.65rem] overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/40">
                <div
                  className="absolute top-0 left-0 right-0 h-[2.5px]"
                  style={{ background: "linear-gradient(to right, oklch(0.586 0.253 17.585), oklch(0.645 0.246 16.439), oklch(0.81 0.117 11.638))" }}
                />
                <div
                  className="absolute top-0 left-0 right-0 h-28 pointer-events-none opacity-[0.05]"
                  style={{ background: "linear-gradient(to bottom, oklch(0.586 0.253 17.585), transparent)" }}
                />
                <CardContent className="relative p-6 pt-7">
                  <TabsContent value="customer" className="mt-0">
                    <CustomerForm onSuccess={handleFormSuccess}/>
                  </TabsContent>
                  <TabsContent value="owner" className="mt-0">
                    <OwnerForm onSuccess={handleFormSuccess}/>
                  </TabsContent>
                  <TabsContent value="rider" className="mt-0">
                    <RiderForm onSuccess={handleFormSuccess}/>
                  </TabsContent>
                </CardContent>
              </Card>
            </div>

            {/* Mobile sign in */}
            <p className="lg:hidden text-center text-sm text-muted-foreground mt-5">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-black hover:underline">Sign in →</Link>
            </p>

          </Tabs>
        </div>
      </main>


    </div>
  )
}