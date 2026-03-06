"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Moon, Sun, Search, Bell, MapPin, ChevronRight, Flame, Clock, Star, TrendingUp, Gift, Bike } from "lucide-react"
import { useEffect, useRef, useState } from "react"

function useCounter(target: number, duration = 2000, go = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!go) return
    let t0: number | null = null
    const tick = (ts: number) => {
      if (!t0) t0 = ts
      const p = Math.min((ts - t0) / duration, 1)
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, go])
  return count
}

function Stat({ target, label, go, dark }: { target: number; label: string; go: boolean; dark: boolean }) {
  const n = useCounter(target, 2200, go)
  const d = target >= 1000 ? `${Math.floor(n / 1000)}K` : `${n}`
  return (
    <div className="text-center">
      <p className={`text-4xl font-black tracking-tighter leading-none ${dark ? "text-white" : "text-black"}`}>
        {d}<span className="text-red-500">+</span>
      </p>
      <p className="text-gray-400 text-[11px] uppercase tracking-[0.15em] mt-1.5">{label}</p>
    </div>
  )
}

function FloatCard({ emoji, title, sub, cls, dark }: { emoji: string; title: string; sub: string; cls: string; dark: boolean }) {
  return (
    <div className={`absolute z-20 backdrop-blur-md rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 border ${cls} ${dark ? "bg-gray-800/90 border-gray-700" : "bg-white/90 border-white"}`}>
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className={`text-[11px] font-black leading-none ${dark ? "text-white" : "text-gray-900"}`}>{title}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

function Logo({ dark, size = "text-xl" }: { dark: boolean; size?: string }) {
  return (
    <span className={`font-black tracking-tight ${size}`}>
      🍕 <span className={dark ? "text-white" : "text-black"}>Smart</span><span style={{ background: "linear-gradient(135deg,#ef4444,#f97316,#eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Food</span>
    </span>
  )
}

const FOODS = [
  { name: "Smash Burger",    price: "PKR 850",  priceNum: 850,  tag: "Bestseller", rating: 4.9, time: "18 min", calories: 650, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&auto=format", desc: "Double beef patty, cheddar, caramelised onions" },
  { name: "Pepperoni Pizza", price: "PKR 1,299", priceNum: 1299, tag: "Hot Deal",   rating: 4.8, time: "22 min", calories: 890, img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&auto=format", desc: "Wood-fired base, spicy pepperoni, mozzarella" },
  { name: "Sushi Platter",   price: "PKR 1,799", priceNum: 1799, tag: "New",        rating: 5.0, time: "30 min", calories: 420, img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop&auto=format", desc: "12-piece chef selection with wasabi & soy" },
  { name: "Taco Fiesta",     price: "PKR 750",  priceNum: 750,  tag: "Popular",    rating: 4.7, time: "15 min", calories: 520, img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&auto=format", desc: "3 soft tacos, pico de gallo, sour cream" },
]

const CATEGORIES = ["All", "Burgers", "Pizza", "Sushi", "Tacos", "Desserts", "Drinks"]

const REVIEWS = [
  { name: "Sarah K.", avatar: "SK", rating: 5, text: "Fastest delivery ever! Food was still piping hot 🔥", time: "2h ago", orders: 24 },
  { name: "James M.", avatar: "JM", rating: 5, text: "SmartFood is my go-to. Incredible variety and quality.", time: "5h ago", orders: 41 },
  { name: "Priya R.", avatar: "PR", rating: 4, text: "Great app, great food. The live tracking is a game changer.", time: "1d ago", orders: 17 },
]

const STEPS = [
  { icon: "🗺️", title: "Pick a Restaurant", desc: "Browse curated spots near you filtered by cuisine, rating & ETA." },
  { icon: "🛒", title: "Build Your Order",   desc: "Customize every item, add extras, apply promo codes." },
  { icon: "📍", title: "Live Tracking",      desc: "Watch your rider in real-time down to the last meter." },
  { icon: "🎉", title: "Enjoy Your Meal",    desc: "Hot, fresh and delivered right to your door. Every time." },
]

const CART_ITEMS = [
  { name: "Smash Burger",  price: 850,  img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop&auto=format" },
  { name: "Sushi Platter", price: 1799, img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=80&h=80&fit=crop&auto=format" },
]

const PROMOS = [
  { title: "Free Delivery", sub: "On orders above PKR 1,500", emoji: "🚴", color: "from-red-500 to-orange-500" },
  { title: "20% Off",       sub: "Use code FOOD20",           emoji: "🎁", color: "from-purple-500 to-pink-500" },
  { title: "Combo Deal",    sub: "Burger + Drink = PKR 999",  emoji: "🍔", color: "from-green-500 to-teal-500" },
]

export default function LandingPage() {
  const statsRef = useRef<HTMLDivElement>(null)
  const heroRef  = useRef<HTMLDivElement>(null)
  const [statsGo, setStatsGo]       = useState(false)
  const [heroVis, setHeroVis]       = useState(false)
  const [scrolled, setScrolled]     = useState(false)
  const [activeNav, setActiveNav]   = useState("Home")
  const [activeDot, setActiveDot]   = useState(0)
  const [dark, setDark]             = useState(false)
  const [cartQtys, setCartQtys]     = useState([1, 2])
  const [progress, setProgress]     = useState(68)
  const [liked, setLiked]           = useState<boolean[]>(FOODS.map(() => false))
  const [search, setSearch]         = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [activePromo, setActivePromo] = useState(0)
  const [addedToCart, setAddedToCart] = useState<number | null>(null)
  const [notifOpen, setNotifOpen]   = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsGo(true); io.disconnect() } }, { threshold: 0.3 })
    if (statsRef.current) io.observe(statsRef.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setHeroVis(true) }, { threshold: 0.1 })
    if (heroRef.current) io.observe(heroRef.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActiveDot(d => (d + 1) % FOODS.length), 3000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setProgress(p => p >= 100 ? 20 : p + 1), 120)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActivePromo(p => (p + 1) % PROMOS.length), 3500)
    return () => clearInterval(t)
  }, [])

  const handleAddToCart = (i: number) => {
    setAddedToCart(i)
    setTimeout(() => setAddedToCart(null), 1200)
  }

  const bg    = dark ? "bg-gray-950"   : "bg-[#EFEFED]"
  const card  = dark ? "bg-gray-900 border-gray-800" : "bg-white border-transparent"
  const txt   = dark ? "text-white"    : "text-black"
  const sub   = dark ? "text-gray-400" : "text-gray-500"
  const navBg = scrolled
    ? (dark ? "bg-gray-950/90 backdrop-blur-xl shadow-lg" : "bg-white/90 backdrop-blur-xl shadow-lg shadow-black/5")
    : "bg-transparent"
  const cartTotal = CART_ITEMS.reduce((s, item, i) => s + item.price * cartQtys[i], 0)

  const filteredFoods = FOODS.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <TooltipProvider>
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          * { font-family: 'Inter', sans-serif; }

          @keyframes floatA  { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-16px) rotate(1deg)} }
          @keyframes floatB  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
          @keyframes floatC  { 0%,100%{transform:translateY(-6px)} 50%{transform:translateY(6px)} }
          @keyframes spin    { to{transform:rotate(360deg)} }
          @keyframes spinR   { to{transform:rotate(-360deg)} }
          @keyframes fadeUp  { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
          @keyframes fadeRight{ from{opacity:0;transform:translateX(32px)} to{opacity:1;transform:translateX(0)} }
          @keyframes fadeLeft { from{opacity:0;transform:translateX(-32px)} to{opacity:1;transform:translateX(0)} }
          @keyframes glow    { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.35)} 50%{box-shadow:0 0 0 16px rgba(239,68,68,0)} }
          @keyframes shimmer { from{background-position:-200% 0} to{background-position:200% 0} }
          @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
          @keyframes ping2   { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.2);opacity:0} }
          @keyframes popIn   { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
          @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
          @keyframes promoSlide { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }

          .float-a  { animation: floatA 4s ease-in-out infinite; }
          .float-b  { animation: floatB 3.6s ease-in-out infinite .5s; }
          .float-c  { animation: floatC 3s ease-in-out infinite 1s; }
          .spin-cw  { animation: spin 14s linear infinite; }
          .spin-ccw { animation: spinR 10s linear infinite; }

          .hero-visible .h1 { animation: fadeLeft  .7s ease both .05s; }
          .hero-visible .h2 { animation: fadeLeft  .7s ease both .18s; }
          .hero-visible .h3 { animation: fadeUp    .7s ease both .30s; }
          .hero-visible .h4 { animation: fadeUp    .7s ease both .42s; }
          .hero-visible .h5 { animation: fadeUp    .7s ease both .54s; }
          .hero-visible .img{ animation: fadeRight .8s ease both .20s; }
          .h1,.h2,.h3,.h4,.h5,.img { opacity:0; }
          .hero-visible .h1,.hero-visible .h2,.hero-visible .h3,
          .hero-visible .h4,.hero-visible .h5,.hero-visible .img { opacity:1; }

          .shimmer-btn { background:linear-gradient(90deg,#111 40%,#444 50%,#111 60%); background-size:200% 100%; }
          .shimmer-btn:hover { animation:shimmer 1.4s linear infinite; }
          .glow-btn:hover { animation:glow 1.2s ease infinite; transform:translateY(-2px); }
          .card-hover { transition:all .3s cubic-bezier(.34,1.56,.64,1); }
          .card-hover:hover { transform:translateY(-8px) scale(1.02); box-shadow:0 24px 48px rgba(0,0,0,.12); }
          .marquee-wrap { overflow:hidden; }
          .marquee-inner { display:flex; width:max-content; animation:marquee 20s linear infinite; }
          .badge-ping::after { content:''; position:absolute; inset:-4px; border-radius:9999px; background:rgba(239,68,68,.3); animation:ping2 1.5s ease infinite; }
          .gradient-text { background:linear-gradient(135deg,#ef4444,#f97316,#eab308); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
          .theme-transition { transition:background-color .4s ease,color .4s ease,border-color .4s ease; }
          .mode-btn { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .3s cubic-bezier(.34,1.56,.64,1); border:1.5px solid; }
          .mode-btn:hover { transform:scale(1.12) rotate(15deg); }
          .step-line::after { content:''; position:absolute; top:28px; left:calc(50% + 40px); width:calc(100% - 80px); height:2px; background:repeating-linear-gradient(90deg,#f87171 0,#f87171 6px,transparent 6px,transparent 12px); }
          .step-last::after { display:none; }
          .panda-wrap { border-radius:2rem; overflow:hidden; position:relative; }
          .added-pop { animation: popIn .4s cubic-bezier(.34,1.56,.64,1) both; }
          .search-dropdown { animation: slideDown .2s ease both; }
          .promo-card { animation: promoSlide .4s ease both; }

          /* Scrollbar */
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #ef4444; border-radius: 99px; }
        `}</style>

        <div className={`min-h-screen ${bg} theme-transition`}>

          {/* ══ NAVBAR ══ */}
          <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${navBg} py-4`}>
            <div className="max-w-7xl mx-auto px-8 flex items-center justify-between gap-4">
              <a href="#"><Logo dark={dark} size="text-xl" /></a>

              {/* Search bar */}
              <div className="relative hidden lg:flex flex-1 max-w-xs">
                <div className={`flex items-center gap-2 w-full rounded-full px-4 py-2 text-sm border transition-all ${dark ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-gray-100 border-gray-200 text-gray-600"} focus-within:ring-2 focus-within:ring-red-400`}>
                  <Search size={14} className="flex-shrink-0 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setSearchOpen(e.target.value.length > 0) }}
                    onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                    placeholder="Search food, restaurants..."
                    className={`bg-transparent outline-none w-full text-sm ${dark ? "placeholder-gray-600 text-white" : "placeholder-gray-400"}`}
                  />
                </div>
                {searchOpen && filteredFoods.length > 0 && (
                  <div className={`search-dropdown absolute top-full mt-2 w-full rounded-2xl shadow-2xl overflow-hidden z-50 border ${dark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"}`}>
                    {filteredFoods.map(f => (
                      <div key={f.name} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${dark ? "hover:bg-gray-800" : "hover:bg-gray-50"}`}>
                        <img src={f.img} className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <p className={`text-xs font-bold ${txt}`}>{f.name}</p>
                          <p className="text-[10px] text-gray-400">{f.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <nav className="hidden lg:flex items-center gap-6">
                {["Home","Menu","Deals","About","Track Order"].map(item => (
                  <button key={item} onClick={() => setActiveNav(item)}
                    className={`text-sm font-semibold relative pb-1 transition-colors group ${activeNav===item ? txt : "text-gray-400 hover:text-gray-600"}`}>
                    {item}
                    <span className={`absolute bottom-0 left-0 h-0.5 rounded-full bg-red-500 transition-all duration-300 ${activeNav===item ? "w-full" : "w-0 group-hover:w-full"}`} />
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-2">

                {/* Notification bell */}
                <div className="relative">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => setNotifOpen(n => !n)}
                        className={`mode-btn ${dark ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-white border-gray-200 text-gray-600"}`}>
                        <Bell size={15} />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-black flex items-center justify-center">3</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Notifications</TooltipContent>
                  </Tooltip>
                  {notifOpen && (
                    <div className={`search-dropdown absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-2xl border z-50 overflow-hidden ${dark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"}`}>
                      <div className={`px-4 py-3 border-b font-bold text-sm ${dark ? "border-gray-700 text-white" : "border-gray-100"}`}>🔔 Notifications</div>
                      {[
                        { icon: "🛵", msg: "Rizwan picked up your order!", t: "2 min ago" },
                        { icon: "🎁", msg: "FOOD20 — 20% off expires tonight", t: "1h ago" },
                        { icon: "⭐", msg: "Rate your last order from PizzaHub", t: "3h ago" },
                      ].map((n, i) => (
                        <div key={i} className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${dark ? "hover:bg-gray-800" : "hover:bg-gray-50"}`}>
                          <span className="text-xl mt-0.5">{n.icon}</span>
                          <div>
                            <p className={`text-xs font-semibold ${txt}`}>{n.msg}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{n.t}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dark mode */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => setDark(d => !d)}
                      className={`mode-btn ${dark ? "bg-gray-800 border-gray-600 text-yellow-300" : "bg-white border-gray-200 text-gray-700"}`}>
                      {dark ? <Moon size={16} /> : <Sun size={16} />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{dark ? "Light Mode" : "Dark Mode"}</TooltipContent>
                </Tooltip>

                {/* Cart */}
                <Sheet>
                  <SheetTrigger asChild>
                    <button className={`hidden lg:flex items-center gap-1.5 text-sm font-semibold transition-colors ${dark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-black"}`}>
                      <span>🛒</span>
                      <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 rounded-full border-0">{cartQtys.reduce((a,b)=>a+b,0)}</Badge>
                    </button>
                  </SheetTrigger>
                  <SheetContent className={`${dark ? "bg-gray-900 border-gray-800 text-white" : ""} w-[380px]`}>
                    <SheetHeader>
                      <SheetTitle className={dark ? "text-white" : ""}>🛒 Your Cart</SheetTitle>
                    </SheetHeader>

                    {/* Promo input */}
                    <div className={`mt-4 flex gap-2 p-3 rounded-2xl ${dark ? "bg-gray-800" : "bg-gray-50"}`}>
                      <Gift size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                      <input placeholder="Enter promo code..." className={`bg-transparent text-xs outline-none flex-1 ${dark ? "text-white placeholder-gray-600" : "placeholder-gray-400"}`} />
                      <button className="text-[10px] font-black text-red-500">APPLY</button>
                    </div>

                    <ScrollArea className="h-[50vh] mt-4">
                      <div className="flex flex-col gap-3 pr-4">
                        {CART_ITEMS.map((item, i) => (
                          <div key={item.name} className={`flex items-center gap-3 p-3 rounded-2xl ${dark ? "bg-gray-800" : "bg-gray-50"}`}>
                            <img src={item.img} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                            <div className="flex-1">
                              <p className={`text-sm font-bold ${dark ? "text-white" : ""}`}>{item.name}</p>
                              <p className="text-xs text-gray-400">PKR {item.price.toLocaleString()}</p>
                              <p className="text-xs font-black text-red-500 mt-0.5">PKR {(item.price * cartQtys[i]).toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                              <button onClick={() => setCartQtys(q => q.map((v,j) => j===i ? v+1 : v))}
                                className="w-7 h-7 rounded-full bg-red-500 text-white text-sm font-bold flex items-center justify-center">+</button>
                              <span className={`text-sm font-black ${dark ? "text-white" : ""}`}>{cartQtys[i]}</span>
                              <button onClick={() => setCartQtys(q => q.map((v,j) => j===i ? Math.max(1,v-1) : v))}
                                className={`w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center ${dark ? "bg-gray-700 text-white" : "bg-gray-200"}`}>−</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <Separator className="my-4" />

                    <div className={`rounded-2xl p-4 mb-4 ${dark ? "bg-gray-800" : "bg-gray-50"}`}>
                      {[["Subtotal", `PKR ${cartTotal.toLocaleString()}`],["Delivery", "PKR 99"],["Discount", "− PKR 0"]].map(([l,v]) => (
                        <div key={l} className="flex justify-between text-xs mb-2">
                          <span className="text-gray-400">{l}</span>
                          <span className={`font-bold ${dark ? "text-white" : ""}`}>{v}</span>
                        </div>
                      ))}
                      <Separator className="my-2" />
                      <div className="flex justify-between">
                        <span className={`font-black text-sm ${dark ? "text-white" : ""}`}>Total</span>
                        <span className="text-base font-black text-red-500">PKR {(cartTotal + 99).toLocaleString()}</span>
                      </div>
                    </div>
                    <Button className="w-full shimmer-btn glow-btn rounded-full font-bold text-white border-0 py-5 text-sm">
                      Proceed to Checkout →
                    </Button>
                  </SheetContent>
                </Sheet>

                <Button className="shimmer-btn glow-btn rounded-full px-5 py-2 text-sm font-bold text-white border-0">Order Now</Button>
              </div>
            </div>
          </header>

          {/* ══ HERO ══ */}
          <section ref={heroRef} className={`pt-28 pb-6 px-6 ${heroVis ? "hero-visible" : ""}`}>
            <div className="max-w-7xl mx-auto">
              <Card className={`${card} rounded-[2.5rem] shadow-2xl overflow-hidden theme-transition`}>
                <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400" />
                <div className={`absolute top-0 right-0 w-96 h-96 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none ${dark ? "bg-gradient-to-bl from-red-900/30 to-transparent" : "bg-gradient-to-bl from-red-50 via-orange-50 to-transparent"}`} />
                <CardContent className="p-0">
                  <div className="grid lg:grid-cols-2 items-center">

                    {/* LEFT */}
                    <div className="px-12 py-14 relative z-10">

                      {/* Location pill */}
                      <div className="h1 flex items-center gap-3 mb-6">
                        <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border ${dark ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-gray-100 border-gray-200 text-gray-600"}`}>
                          <MapPin size={11} className="text-red-500" />
                          Karachi, Pakistan
                          <ChevronRight size={11} className="text-gray-400" />
                        </div>
                        <Badge className="bg-red-50 text-red-600 border border-red-100 rounded-full px-3 py-1 text-[10px] font-bold hover:bg-red-50">
                          <span className="relative badge-ping w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 inline-block" />
                          25+ Cities
                        </Badge>
                      </div>

                      <h1 className={`h2 text-[3.4rem] font-black leading-[1.02] tracking-[-2px] mb-4 ${txt}`}>
                        Deliciously Fast<br />
                        Freshly{" "}
                        <span className="relative">
                          <span className="gradient-text">Delivered</span>
                          <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 220 10" fill="none">
                            <path d="M2 7 Q55 2 110 6 Q165 10 218 5" stroke="url(#ug)" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".5"/>
                            <defs><linearGradient id="ug" x1="0" x2="1"><stop stopColor="#ef4444"/><stop offset="1" stopColor="#f97316"/></linearGradient></defs>
                          </svg>
                        </span>
                      </h1>

                      <p className={`h3 max-w-[420px] leading-relaxed text-[.93rem] mb-8 ${sub}`}>
                        Say goodbye to late meals and cold food! SmartFood brings your cravings to life
                        with lightning-fast delivery, piping-hot freshness and top-notch service.
                      </p>

                      <div className="h4 flex flex-wrap gap-4 items-center mb-10">
                        <Button className="shimmer-btn glow-btn rounded-full px-8 py-5 text-[.9rem] font-bold text-white border-0 shadow-lg">
                          🚀 Order Now
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className={`flex items-center gap-3 text-sm font-bold transition-colors group ${dark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`}>
                              <span className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-xs transition-all duration-300 group-hover:border-red-400 group-hover:bg-red-50 ${dark ? "border-gray-600" : "border-gray-200"}`}>▶</span>
                              See How It Works
                            </button>
                          </DialogTrigger>
                          <DialogContent className={`max-w-md ${dark ? "bg-gray-900 border-gray-800 text-white" : ""}`}>
                            <DialogHeader>
                              <DialogTitle className={dark ? "text-white" : ""}>How SmartFood Works</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col gap-5 mt-4">
                              {STEPS.map(({ icon, title, desc }, i) => (
                                <div key={title} className="flex gap-4 items-start">
                                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-xl flex-shrink-0">{icon}</div>
                                  <div>
                                    <p className={`font-bold text-sm mb-1 ${dark ? "text-white" : ""}`}>
                                      <span className="text-red-500 mr-1">{i+1}.</span>{title}
                                    </p>
                                    <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Feature pills */}
                      <div className="h4 flex flex-wrap gap-2 mb-10">
                        {[
                          { icon: <Bike size={12}/>, label: "Free delivery over PKR 1,500" },
                          { icon: <Clock size={12}/>, label: "Avg. 22 min delivery" },
                          { icon: <Star size={12}/>, label: "4.9 rated app" },
                        ].map(({ icon, label }) => (
                          <div key={label} className={`flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-3 py-1.5 ${dark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                            <span className="text-red-500">{icon}</span>{label}
                          </div>
                        ))}
                      </div>

                      <div ref={statsRef} className={`h5 flex items-center pt-6 border-t ${dark ? "border-gray-700" : "border-gray-100"}`}>
                        {[{target:4000,label:"Customers"},{target:70000,label:"Delivered"},{target:13000,label:"Reviews"}].map(({target,label},i) => (
                          <div key={label} className="flex items-center">
                            {i > 0 && <Separator orientation="vertical" className={`h-10 mx-8 ${dark ? "bg-gray-700" : ""}`} />}
                            <Stat target={target} label={label} go={statsGo} dark={dark} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="img relative flex items-center justify-center py-10 min-h-[540px] overflow-hidden">
                      <div className={`absolute w-80 h-80 rounded-full blur-3xl opacity-70 ${dark ? "bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900" : "bg-gradient-to-br from-red-200 via-orange-100 to-yellow-100"}`} />
                      <div className="absolute w-[390px] h-[390px] rounded-full border-[1.5px] border-dashed border-red-200 spin-cw" />
                      <div className="absolute w-[290px] h-[290px] rounded-full border-[1.5px] border-dotted border-orange-200 spin-ccw" />
                      <FloatCard emoji="⚡" title="22 min delivery" sub="Fastest in town"     cls="float-b top-8 left-4 lg:left-6"     dark={dark} />
                      <FloatCard emoji="⭐" title="4.9 / 5 Rating"  sub="13K+ happy reviews" cls="float-c top-1/3 right-4 lg:-right-2" dark={dark} />
                      <FloatCard emoji="🎁" title="20% Off Today"   sub="Code: FOOD20"        cls="float-b bottom-16 left-4 lg:left-6" dark={dark} />

                      <div className="relative z-10 float-a panda-wrap"
                        style={{
                          background: dark ? "linear-gradient(135deg,#1f2937,#111827)" : "linear-gradient(135deg,#fff7ed,#fef2f2)",
                          padding: "16px",
                          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                        }}>
                        <Image src="/panda.png" alt="SmartFood delivery" width={360} height={360} priority className="rounded-2xl" style={{ display: "block" }} />
                        <div className="mt-3 flex items-center justify-between px-1">
                          <div>
                            <p className={`text-xs font-black ${dark ? "text-white" : "text-gray-800"}`}>SmartFood Rider</p>
                            <p className="text-[10px] text-gray-400">⚡ Express Delivery</p>
                          </div>
                          <Badge className="bg-red-500 text-white border-0 text-[10px] rounded-full px-2">🔴 Live</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ══ PROMO BANNER ══ */}
          <section className="px-6 py-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PROMOS.map(({ title, sub, emoji, color }, i) => (
                <div key={title}
                  className={`relative rounded-2xl p-5 flex items-center gap-4 overflow-hidden cursor-pointer transition-all hover:scale-[1.02] bg-gradient-to-r ${color} ${activePromo===i ? "ring-2 ring-white/50 shadow-xl" : ""}`}>
                  <span className="text-3xl">{emoji}</span>
                  <div>
                    <p className="text-white font-black text-sm">{title}</p>
                    <p className="text-white/75 text-xs">{sub}</p>
                  </div>
                  <ChevronRight size={16} className="text-white/60 ml-auto" />
                </div>
              ))}
            </div>
          </section>

          {/* ══ LIVE TRACKING ══ */}
          <section className="px-6 pb-6">
            <div className="max-w-7xl mx-auto">
              <Card className={`${card} rounded-3xl shadow-md theme-transition`}>
                <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-5">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center text-xl flex-shrink-0">📍</div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1.5">
                        <p className={`text-sm font-bold ${txt}`}>Order #SF-2847 is on the way!</p>
                        <span className="text-xs font-black text-red-500">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between mt-1.5">
                        <p className="text-[11px] text-gray-400">🛵 1.2 km away · Est. 4 min</p>
                        <p className="text-[11px] text-green-500 font-semibold">On Schedule ✓</p>
                      </div>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-12 hidden sm:block" />
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10 ring-2 ring-red-500">
                        <AvatarFallback className="bg-orange-100 text-orange-600 font-bold text-xs">RZ</AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${txt}`}>Rizwan</p>
                      <p className="text-[10px] text-gray-400">⭐ 4.97 · 1,240 deliveries</p>
                    </div>
                    <Button size="sm" variant="outline" className={`rounded-full text-xs ml-1 ${dark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : ""}`}>📞 Call</Button>
                    <Button size="sm" className="rounded-full text-xs bg-green-500 hover:bg-green-600 text-white border-0">💬 Chat</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ══ MARQUEE ══ */}
          <div className="marquee-wrap bg-red-500 py-3 -rotate-[0.4deg] scale-105">
            <div className="marquee-inner">
              {Array(8).fill(["🍕 Pizza","🍔 Burgers","🌮 Tacos","🍱 Sushi","🍜 Noodles","🥗 Salads","🍦 Desserts","☕ Drinks"]).flat().map((item,i) => (
                <span key={i} className="mx-5 text-white font-bold text-sm tracking-wide whitespace-nowrap">{item}</span>
              ))}
            </div>
          </div>

          {/* ══ FOOD CARDS ══ */}
          <section className="py-16 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-7">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={14} className="text-red-500" />
                    <p className="text-red-500 text-xs font-black uppercase tracking-[.2em]">Top Picks</p>
                  </div>
                  <h2 className={`text-4xl font-black tracking-tight ${txt}`}>Trending <span className="gradient-text">Right Now</span></h2>
                </div>
                <Button variant="ghost" className="text-sm font-bold text-gray-400 hover:text-red-500 hidden sm:flex gap-1">
                  View All <ChevronRight size={14} />
                </Button>
              </div>

              <Tabs defaultValue="All" className="mb-7">
                <TabsList className={`${dark ? "bg-gray-800" : "bg-gray-100"} rounded-full p-1 h-auto flex-wrap gap-1`}>
                  {CATEGORIES.map(cat => (
                    <TabsTrigger key={cat} value={cat}
                      className="rounded-full text-xs font-bold px-4 py-1.5 data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all">
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {FOODS.map(({ name, price, img, tag, rating, time, calories, desc }, i) => (
                  <Card key={name} className={`card-hover ${card} rounded-3xl overflow-hidden shadow-sm cursor-pointer group theme-transition`}>
                    <div className="relative h-44 overflow-hidden">
                      <img src={img} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black border-0 rounded-full">{tag}</Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={() => setLiked(l => l.map((v,j) => j===i ? !v : v))}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:scale-110 transition-all">
                            {liked[i] ? "❤️" : "🤍"}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{liked[i] ? "Remove" : "Favourite"}</TooltipContent>
                      </Tooltip>
                      {/* bottom info overlay */}
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                        <div className="flex gap-1.5">
                          <span className={`text-[10px] font-bold bg-black/50 text-white backdrop-blur rounded-full px-2 py-0.5 flex items-center gap-1`}><Clock size={9}/>{time}</span>
                          <span className={`text-[10px] font-bold bg-black/50 text-white backdrop-blur rounded-full px-2 py-0.5 flex items-center gap-1`}><Flame size={9}/>{calories}</span>
                        </div>
                        <span className="text-[10px] font-bold bg-yellow-400 text-black rounded-full px-2 py-0.5 flex items-center gap-1"><Star size={9} fill="black"/>  {rating}</span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className={`font-bold text-sm mb-0.5 ${txt}`}>{name}</h3>
                      <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">{desc}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-black ${txt}`}>{price}</span>
                        <button
                          onClick={() => handleAddToCart(i)}
                          className={`relative w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${addedToCart===i ? "bg-green-500 added-pop" : "bg-black group-hover:bg-red-500"} text-white`}>
                          {addedToCart===i ? "✓" : "+"}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center gap-2 mt-7">
                {FOODS.map((_,i) => (
                  <button key={i} onClick={() => setActiveDot(i)}
                    className={`rounded-full transition-all duration-300 ${activeDot===i ? "w-6 h-2 bg-red-500" : `w-2 h-2 ${dark?"bg-gray-600":"bg-gray-300"}`}`} />
                ))}
              </div>
            </div>
          </section>

          {/* ══ HOW IT WORKS ══ */}
          <section className={`py-16 px-6 ${dark ? "bg-gray-900" : "bg-white"} theme-transition`}>
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-red-500 text-xs font-black uppercase tracking-[.2em] mb-2">Simple Process</p>
                <h2 className={`text-4xl font-black tracking-tight ${txt}`}>Order in <span className="gradient-text">4 Easy Steps</span></h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative">
                {STEPS.map(({ icon, title, desc }, i) => (
                  <Tooltip key={title}>
                    <TooltipTrigger asChild>
                      <div className={`relative text-center group cursor-pointer ${i < STEPS.length-1 ? "step-line" : "step-last"}`}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 transition-all duration-300 group-hover:bg-red-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-red-200 ${dark ? "bg-gray-800" : "bg-red-50"}`}>{icon}</div>
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 translate-x-6 w-6 h-6 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">{i+1}</div>
                        <h3 className={`font-black text-sm mb-1.5 group-hover:text-red-500 transition-colors ${txt}`}>{title}</h3>
                        <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Step {i+1}: {title}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </section>

          {/* ══ REVIEWS ══ */}
          <section className="py-16 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-10">
                <p className="text-red-500 text-xs font-black uppercase tracking-[.2em] mb-2">Testimonials</p>
                <h2 className={`text-4xl font-black tracking-tight ${txt}`}>Loved by <span className="gradient-text">Thousands</span></h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {REVIEWS.map(({ name, avatar, rating, text, time, orders }) => (
                  <Card key={name} className={`${card} rounded-3xl shadow-sm card-hover theme-transition`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-gradient-to-br from-red-400 to-orange-400 text-white font-bold text-sm">{avatar}</AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${txt}`}>{name}</p>
                            <p className="text-[10px] text-gray-400">{orders} orders · {time}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array(rating).fill(0).map((_,i) => <span key={i} className="text-yellow-400 text-xs">★</span>)}
                        </div>
                      </div>
                      <p className={`text-sm leading-relaxed ${sub}`}>"{text}"</p>
                      <div className={`mt-4 pt-3 border-t flex items-center gap-1.5 ${dark ? "border-gray-700" : "border-gray-100"}`}>
                        <Badge variant="secondary" className={`text-[10px] rounded-full ${dark ? "bg-gray-700 text-gray-300" : ""}`}>Verified Order ✓</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* ══ CTA ══ */}
          <section className="py-8 px-6">
            <div className="max-w-7xl mx-auto">
              <div className={`relative rounded-[2rem] overflow-hidden px-12 py-16 flex flex-col lg:flex-row items-center justify-between gap-8 ${dark ? "bg-gray-900 border border-gray-800" : "bg-black"}`}>
                <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-red-600/20 blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-orange-500/20 blur-3xl translate-x-1/3 translate-y-1/3" />
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                <div className="relative z-10">
                  <Badge className="bg-red-900/50 text-red-400 border-red-800 rounded-full mb-3">⏰ Limited Offer</Badge>
                  <h2 className="text-4xl font-black text-white tracking-tight leading-tight mb-3">
                    Get 20% Off Your<br /><span className="gradient-text">First Order</span>
                  </h2>
                  <p className="text-gray-400 text-sm max-w-md mb-2">
                    Use code <Badge variant="outline" className="text-white border-white/30 bg-white/10 font-mono mx-1">FOOD20</Badge> at checkout.
                  </p>
                  <p className="text-gray-600 text-xs">Valid for new users · Expires midnight tonight</p>
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row gap-4">
                  <Button className="shimmer-btn glow-btn rounded-full px-8 py-5 font-bold text-white border-0">Claim Offer →</Button>
                  <Button variant="outline" className="rounded-full px-8 border-white/20 text-white hover:bg-white/5 bg-transparent">Browse Menu</Button>
                </div>
              </div>
            </div>
          </section>

          {/* ══ FOOTER ══ */}
          <footer className={`py-12 px-6 mt-4 ${dark ? "bg-gray-900" : "bg-white"} theme-transition`}>
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 pb-10 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <a href="#"><Logo dark={dark} size="text-2xl" /></a>
                  <p className="text-gray-400 text-xs mt-3 leading-relaxed max-w-[200px]">Pakistan's fastest food delivery platform. Order in seconds.</p>
                  <div className="flex gap-2 mt-4">
                    {["𝕏","in","ig","fb"].map(s => (
                      <Tooltip key={s}>
                        <TooltipTrigger asChild>
                          <button className={`w-8 h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center hover:bg-red-500 hover:text-white ${dark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"}`}>{s}</button>
                        </TooltipTrigger>
                        <TooltipContent>Follow on {s}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
                {[
                  { heading: "Company",  links: ["About Us","Careers","Blog","Press"] },
                  { heading: "Support",  links: ["Help Centre","Track Order","Refunds","Contact"] },
                  { heading: "Legal",    links: ["Privacy","Terms","Cookies","Sitemap"] },
                ].map(({ heading, links }) => (
                  <div key={heading}>
                    <p className={`text-xs font-black uppercase tracking-widest mb-4 ${txt}`}>{heading}</p>
                    <div className="flex flex-col gap-2.5">
                      {links.map(l => <a key={l} href="#" className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium">{l}</a>)}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-gray-400 text-xs mt-6 font-medium">
                © {new Date().getFullYear()} SmartFood Inc. All rights reserved. Made with ❤️ by Rizwan, Aqib and Suhaib.
              </p>
            </div>
          </footer>

        </div>
      </>
    </TooltipProvider>
  )
}