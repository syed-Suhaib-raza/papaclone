"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Moon, Sun, Search, MapPin, ChevronRight, Flame, Clock, Star, Bike, Users, Award, Zap } from "lucide-react"
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
      <p className={`text-4xl font-black tracking-tighter leading-none ${dark ? "text-white" : "text-foreground"}`}>
        {d}<span className="text-primary">+</span>
      </p>
      <p className="text-muted-foreground text-[11px] uppercase tracking-[0.15em] mt-1.5">{label}</p>
    </div>
  )
}

function FloatCard({ emoji, title, sub, cls, dark }: { emoji: string; title: string; sub: string; cls: string; dark: boolean }) {
  return (
    <div className={`absolute z-20 backdrop-blur-md rounded-2xl shadow-2xl px-3 py-3 flex items-center gap-3 border ${cls} ${dark ? "bg-card/90 border-border" : "bg-white/90 border-white"}`}>
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className={`text-[11px] font-black leading-none ${dark ? "text-card-foreground" : "text-gray-900"}`}>{title}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

function Logo({ dark, size = "text-xl" }: { dark: boolean; size?: string }) {
  return (
    <span className={`font-black tracking-tight ${size}`}>
      🍕 <span className={dark ? "text-card-foreground" : "text-foreground"}>Smart</span><span style={{ background: "linear-gradient(135deg, oklch(0.586 0.253 17.585), oklch(0.645 0.246 16.439), oklch(0.81 0.117 11.638))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Food</span>
    </span>
  )
}

const ALL_FOODS = [
  // Burgers
  { name: "Smash Burger",       category: "Burgers",  price: "PKR 850",   tag: "Bestseller", rating: 4.9, time: "18 min", calories: 650, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&auto=format",  desc: "Double beef patty, cheddar, caramelised onions" },
  { name: "BBQ Bacon Burger",   category: "Burgers",  price: "PKR 950",   tag: "Hot Deal",   rating: 4.8, time: "20 min", calories: 780, img: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop&auto=format",  desc: "Crispy bacon, BBQ sauce, pickles & American cheese" },
  { name: "Mushroom Swiss",     category: "Burgers",  price: "PKR 899",   tag: "Popular",    rating: 4.7, time: "19 min", calories: 620, img: "https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&h=300&fit=crop&auto=format",  desc: "Sautéed mushrooms, Swiss cheese, garlic aioli" },
  { name: "Spicy Chicken Burger", category: "Burgers", price: "PKR 799",  tag: "New",        rating: 4.6, time: "17 min", calories: 590, img: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop&auto=format",  desc: "Crispy fried chicken, sriracha mayo, coleslaw" },
  // Pizza
  { name: "Pepperoni Pizza",    category: "Pizza",    price: "PKR 1,299", tag: "Hot Deal",   rating: 4.8, time: "22 min", calories: 890, img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&auto=format",  desc: "Wood-fired base, spicy pepperoni, mozzarella" },
  { name: "BBQ Chicken Pizza",  category: "Pizza",    price: "PKR 1,199", tag: "Bestseller", rating: 4.9, time: "25 min", calories: 820, img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&auto=format",  desc: "Grilled chicken, BBQ drizzle, red onion, coriander" },
  { name: "Margherita Pizza",   category: "Pizza",    price: "PKR 999",   tag: "Classic",    rating: 4.7, time: "20 min", calories: 700, img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop&auto=format",  desc: "San Marzano tomatoes, fresh basil, buffalo mozzarella" },
  { name: "Veggie Supreme",     category: "Pizza",    price: "PKR 1,099", tag: "Healthy",    rating: 4.6, time: "22 min", calories: 640, img: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=300&fit=crop&auto=format",  desc: "Bell peppers, olives, mushrooms, cherry tomatoes" },
  // Sushi
  { name: "Sushi Platter",      category: "Sushi",    price: "PKR 1,799", tag: "New",        rating: 5.0, time: "30 min", calories: 420, img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop&auto=format",  desc: "12-piece chef selection with wasabi & soy" },
  { name: "Dragon Roll",        category: "Sushi",    price: "PKR 1,499", tag: "Popular",    rating: 4.8, time: "28 min", calories: 380, img: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&h=300&fit=crop&auto=format",  desc: "Shrimp tempura, avocado, unagi sauce" },
  { name: "Salmon Nigiri",      category: "Sushi",    price: "PKR 1,299", tag: "Fresh",      rating: 4.9, time: "25 min", calories: 310, img: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&h=300&fit=crop&auto=format",  desc: "Premium Atlantic salmon over seasoned sushi rice" },
  { name: "Rainbow Roll",       category: "Sushi",    price: "PKR 1,599", tag: "Chef's Pick", rating: 4.7, time: "32 min", calories: 360, img: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&h=300&fit=crop&auto=format",  desc: "California roll topped with assorted sashimi" },
  // Tacos
  { name: "Taco Fiesta",        category: "Tacos",    price: "PKR 750",   tag: "Popular",    rating: 4.7, time: "15 min", calories: 520, img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&auto=format",  desc: "3 soft tacos, pico de gallo, sour cream" },
  { name: "Birria Tacos",       category: "Tacos",    price: "PKR 899",   tag: "Trending",   rating: 4.9, time: "18 min", calories: 610, img: "https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=400&h=300&fit=crop&auto=format",  desc: "Slow-braised beef, consommé dip, melted cheese" },
  { name: "Fish Tacos",         category: "Tacos",    price: "PKR 799",   tag: "New",        rating: 4.6, time: "16 min", calories: 470, img: "https://images.unsplash.com/photo-1512838243191-e81168acc4f5?w=400&h=300&fit=crop&auto=format",  desc: "Battered cod, lime crema, mango salsa" },
  { name: "Veggie Tacos",       category: "Tacos",    price: "PKR 650",   tag: "Healthy",    rating: 4.5, time: "14 min", calories: 390, img: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400&h=300&fit=crop&auto=format",  desc: "Roasted veggies, black beans, avocado crema" },
  // Desserts
  { name: "Chocolate Lava Cake", category: "Desserts", price: "PKR 550",  tag: "Bestseller", rating: 4.9, time: "12 min", calories: 480, img: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop&auto=format", desc: "Warm molten centre, vanilla ice cream, berry coulis" },
  { name: "Cheesecake Slice",   category: "Desserts", price: "PKR 450",   tag: "Classic",    rating: 4.7, time: "10 min", calories: 420, img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop&auto=format", desc: "New York style, strawberry compote, graham crust" },
  { name: "Waffles & Cream",    category: "Desserts", price: "PKR 599",   tag: "Hot Deal",   rating: 4.8, time: "15 min", calories: 560, img: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&h=300&fit=crop&auto=format", desc: "Belgian waffles, whipped cream, maple syrup, berries" },
  { name: "Mango Sorbet",       category: "Desserts", price: "PKR 350",   tag: "Refreshing", rating: 4.6, time: "8 min",  calories: 190, img: "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&h=300&fit=crop&auto=format", desc: "Real Chaunsa mango, zero fat, refreshing & light" },
  // Drinks
  { name: "Mango Shake",        category: "Drinks",   price: "PKR 299",   tag: "Favourite",  rating: 4.8, time: "8 min",  calories: 310, img: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop&auto=format",  desc: "Fresh Chaunsa mango, full-cream milk, cardamom" },
  { name: "Cold Brew Coffee",   category: "Drinks",   price: "PKR 399",   tag: "New",        rating: 4.7, time: "5 min",  calories: 90,  img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop&auto=format", desc: "16-hour steeped single origin, served over ice" },
  { name: "Strawberry Lemonade", category: "Drinks",  price: "PKR 249",   tag: "Refreshing", rating: 4.6, time: "6 min",  calories: 140, img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop&auto=format", desc: "Fresh strawberries, squeezed lemon, mint & soda" },
  { name: "Matcha Latte",       category: "Drinks",   price: "PKR 449",   tag: "Trending",   rating: 4.9, time: "7 min",  calories: 160, img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&h=300&fit=crop&auto=format", desc: "Ceremonial grade matcha, oat milk, honey drizzle" },
]

const CATEGORIES = ["Burgers", "Pizza", "Sushi", "Tacos", "Desserts", "Drinks"]

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

const PROMOS = [
  { title: "Free Delivery", sub: "On orders above PKR 1,500",    emoji: "🚴", color: "from-[oklch(0.586_0.253_17.585)] to-[oklch(0.645_0.246_16.439)]" },
  { title: "20% Off",       sub: "Save big on your first order", emoji: "🎁", color: "from-purple-500 to-pink-500" },
  { title: "Combo Deal",    sub: "BMix & match your favourites",     emoji: "🍔", color: "from-green-500 to-teal-500" },
]

const ABOUT_STATS = [
  { icon: <Users size={28} />, value: "4,000+", label: "Happy Customers", desc: "Families & foodies across Pakistan trust us daily." },
  { icon: <Award size={28} />, value: "4.9★", label: "App Rating", desc: "Consistently top-rated on App Store & Play Store." },
  { icon: <Zap size={28} />, value: "22 min", label: "Avg. Delivery", desc: "Lightning-fast delivery powered by smart routing." },
]

export default function LandingPage() {
  const statsRef = useRef<HTMLDivElement>(null)
  const heroRef  = useRef<HTMLDivElement>(null)
  const [statsGo, setStatsGo]       = useState(false)
  const [heroVis, setHeroVis]       = useState(false)
  const [scrolled, setScrolled]     = useState(false)
  const [activeNav, setActiveNav]   = useState("Home")
  const [dark, setDark]             = useState(false)
  const [search, setSearch]         = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState("Burgers")
  const [activePromo, setActivePromo] = useState(0)

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
    const t = setInterval(() => setActivePromo(p => (p + 1) % PROMOS.length), 3500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  const scrollToSection = (item: string) => {
    setActiveNav(item)
    const idMap: Record<string, string> = {
      "Home":        "section-hero",
      "Menu":        "section-menu",
      "Deals":       "section-deals",
      "About":       "section-about",
      "Track Order": "section-steps",
    }
    const el = document.getElementById(idMap[item])
    if (el) {
      const offset = 80
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  const navBg = scrolled
    ? (dark ? "bg-background/90 backdrop-blur-xl shadow-lg" : "bg-background/90 backdrop-blur-xl shadow-lg shadow-black/5")
    : "bg-transparent"

  const filteredFoods = ALL_FOODS
    .filter(f => f.category === activeCategory)
    .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background theme-transition">

          {/* ══ NAVBAR ══ */}
          <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${navBg} py-4`}>
            <div className="max-w-7xl mx-auto px-8 flex items-center justify-between gap-4">
              <a href="#"><Logo dark={dark} size="text-xl" /></a>

              <div className="relative hidden lg:flex flex-1 max-w-xs">
                <div className="flex items-center gap-2 w-full rounded-full px-4 py-2 text-sm border bg-muted border-border text-muted-foreground focus-within:ring-2 focus-within:ring-ring transition-all">
                  <Search size={14} className="flex-shrink-0 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setSearchOpen(e.target.value.length > 0) }}
                    onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                    placeholder="Search food, restaurants..."
                    className="bg-transparent outline-none w-full text-sm placeholder-muted-foreground text-foreground"
                  />
                </div>
                {searchOpen && filteredFoods.length > 0 && (
                  <div className="search-dropdown absolute top-full mt-2 w-full rounded-2xl shadow-2xl overflow-hidden z-50 border bg-popover border-border">
                    {filteredFoods.map(f => (
                      <div key={f.name} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-accent">
                        <img src={f.img} className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <p className="text-xs font-bold text-popover-foreground">{f.name}</p>
                          <p className="text-[10px] text-muted-foreground">{f.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <nav className="hidden lg:flex items-center gap-6">
                {["Home","Menu","Deals","About","Track Order"].map(item => (
                  <button key={item} onClick={() => scrollToSection(item)}
                    className={`text-sm font-semibold relative pb-1 transition-colors group ${activeNav===item ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {item}
                    <span className={`absolute bottom-0 left-0 h-0.5 rounded-full bg-primary transition-all duration-300 ${activeNav===item ? "w-full" : "w-0 group-hover:w-full"}`} />
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => setDark(d => !d)}
                      className={`mode-btn bg-card border-border ${dark ? "text-yellow-300" : "text-muted-foreground"}`}>
                      {dark ? <Moon size={16} /> : <Sun size={16} />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{dark ? "Light Mode" : "Dark Mode"}</TooltipContent>
                </Tooltip>

                <a href="./login" className="hidden lg:flex items-center gap-1.5 text-sm font-semibold transition-colors text-muted-foreground hover:text-foreground">
                  <span>🛒</span>
                  <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 rounded-full border-0">0</Badge>
                </a>

                <a href="./login">
                  <Button className="shimmer-btn glow-btn rounded-full px-5 py-2 text-sm font-bold text-primary-foreground border-0">Sign In</Button>
                </a>
              </div>
            </div>
          </header>

          {/* ══ HERO ══ */}
          <section id="section-hero" ref={heroRef} className={`pt-20 pb-2 px-6 ${heroVis ? "hero-visible" : ""}`}>
            <div className="max-w-7xl mx-auto">
              <Card className="bg-card border-border rounded-2xl shadow-2xl overflow-hidden theme-transition">
                <div className="h-1.5" style={{ background: "linear-gradient(to right, oklch(0.586 0.253 17.585), oklch(0.645 0.246 16.439), oklch(0.81 0.117 11.638))" }} />
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full translate-x-0 -translate-y-1/3 pointer-events-none bg-gradient-to-bl from-primary/10 to-transparent" />
                <CardContent className="p-0">
                  <div className="grid lg:grid-cols-2 items-center">

                    {/* LEFT */}
                    <div className="px-12 pt-0 pb-1 relative z-10">
                      <div className="h1 flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border bg-muted border-border text-muted-foreground">
                          <MapPin size={11} className="text-primary" />
                          Karachi, Pakistan
                          <ChevronRight size={11} className="text-muted-foreground" />
                        </div>
                        <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 text-[10px] font-bold hover:bg-primary/10">
                          <span className="relative badge-ping w-1.5 h-1.5 rounded-full bg-primary mr-1.5 inline-block" />
                          25+ Cities
                        </Badge>
                      </div>

                      <h1 className="h2 text-[3.2rem] font-black leading-[1.02] tracking-[-2px] mb-2 text-foreground">
                        Deliciously Fast<br />
                        Freshly{" "}
                        <span className="relative">
                          <span className="gradient-text">Delivered</span>
                          <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 220 10" fill="none">
                            <path d="M2 7 Q55 2 110 6 Q165 10 218 5" stroke="url(#ug)" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".5"/>
                            <defs><linearGradient id="ug" x1="0" x2="1"><stop stopColor="oklch(0.586 0.253 17.585)"/><stop offset="1" stopColor="oklch(0.645 0.246 16.439)"/></linearGradient></defs>
                          </svg>
                        </span>
                      </h1>

                      <p className="h3 max-w-[420px] leading-relaxed text-[.88rem] mb-3 text-muted-foreground">
                        Say goodbye to late meals and cold food! SmartFood brings your cravings to life
                        with lightning-fast delivery, piping-hot freshness and top-notch service.
                      </p>

                      <div className="h4 flex flex-wrap gap-4 items-center mb-4">
                        <a href="./login">
                          <Button className="shimmer-btn glow-btn rounded-full px-8 py-5 text-[.9rem] font-bold text-primary-foreground border-0 shadow-lg">
                            🔐 Sign In
                          </Button>
                        </a>
                        <button
                          onClick={() => scrollToSection("Menu")}
                          className="flex items-center gap-3 text-sm font-bold transition-all group text-muted-foreground hover:text-foreground"
                        >
                          <span className="relative w-11 h-11 rounded-full border-2 flex items-center justify-center text-base transition-all duration-300 group-hover:border-primary group-hover:bg-primary/10 border-border">
                            🍔
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-background animate-pulse" />
                          </span>
                          Browse Menu
                        </button>
                      </div>

                      <div className="h4 flex flex-wrap gap-2 mb-4">
                        {[
                          { icon: <Bike size={12}/>, label: "Free delivery over PKR 1,500" },
                          { icon: <Clock size={12}/>, label: "Avg. 22 min delivery" },
                          { icon: <Star size={12}/>, label: "4.9 rated app" },
                        ].map(({ icon, label }) => (
                          <div key={label} className="flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-3 py-1.5 bg-muted text-muted-foreground">
                            <span className="text-primary">{icon}</span>{label}
                          </div>
                        ))}
                      </div>

                      <div ref={statsRef} className="h5 flex items-center pt-4 border-t border-border">
                        {[{target:4000,label:"Customers"},{target:70000,label:"Delivered"},{target:13000,label:"Reviews"}].map(({target,label},i) => (
                          <div key={label} className="flex items-center">
                            {i > 0 && <Separator orientation="vertical" className="h-10 mx-8 bg-border" />}
                            <Stat target={target} label={label} go={statsGo} dark={dark} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="img relative flex items-center justify-center py-6 min-h-[420px] overflow-hidden">
                      <div className="absolute w-80 h-80 rounded-full blur-3xl opacity-40 bg-gradient-to-br from-primary/60 via-primary/20 to-transparent" />
                      <div className="absolute w-[390px] h-[390px] rounded-full border-[1.5px] border-dashed border-primary/30 spin-cw" />
                      <div className="absolute w-[290px] h-[290px] rounded-full border-[1.5px] border-dotted border-chart-2/30 spin-ccw" />
                      <FloatCard emoji="⚡" title="22 Min Delivery" sub="Fastest in town"     cls="float-b top-8 left-4 lg:left-6"      dark={dark} />
                      <FloatCard emoji="⭐" title="4.9 / 5 Rating"  sub="13K+ happy reviews" cls="float-c top-1/3 right-8 lg:right-4"  dark={dark} />
                      <FloatCard emoji="🎁" title="20% Off Today"   sub="Code: FOOD20"        cls="float-b bottom-6 left-2 lg:-left-0"   dark={dark} />

                      <div className="relative z-10 float-a panda-wrap ml-8"
                        style={{
                          background: dark ? "linear-gradient(135deg,oklch(0.21 0.006 285.885),oklch(0.141 0.005 285.823))" : "linear-gradient(135deg,#fff7ed,#fef2f2)",
                          padding: "16px",
                          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                        }}>
<<<<<<< HEAD
                        <Image src="/panda.svg" alt="SmartFood delivery" width={380} height={380} priority className="rounded-2xl" style={{ display: "block" }} />
=======
                        <Image src="/panda.png" alt="SmartFood delivery" width={380} height={380} priority className="rounded-2xl" style={{ display: "block" }} />
>>>>>>> 247229c7ccdd003915a39bb6133ed94d6b3885a7
                        <div className="mt-3 flex items-center justify-between px-1">
                          <div>
                            <p className="text-xs font-black text-foreground">SmartFood Rider</p>
                            <p className="text-[10px] text-muted-foreground">⚡ Express Delivery</p>
                          </div>
                          <Badge className="bg-primary text-primary-foreground border-0 text-[10px] rounded-full px-2">🔴 Live</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ══ PROMO BANNER ══ */}
          <section id="section-deals" className="px-6 py-4">
            <div className="max-w-7xl mx-auto">
              <Card className="bg-card border-border rounded-2xl shadow-2xl overflow-hidden theme-transition">
                <div className="h-1.5" style={{ background: "linear-gradient(to right, oklch(0.586 0.253 17.585), oklch(0.645 0.246 16.439), oklch(0.81 0.117 11.638))" }} />
                <CardContent className="px-1.5 pb-1.5 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                    {PROMOS.map(({ title, sub, emoji, color }, i) => (
                      <a key={title} href="./login"
                        className={`relative rounded-xl px-1 py-1.5 flex items-center gap-2 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl bg-gradient-to-r ${color} ${activePromo===i ? "ring-2 ring-white/50 shadow-xl" : ""}`}>
                        <span className="text-3xl">{emoji}</span>
                        <div>
                          <p className="text-white font-black text-sm">{title}</p>
                          <p className="text-white/75 text-xs">{sub}</p>
                        </div>
                        <ChevronRight size={16} className="text-white/60 ml-auto" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ══ MARQUEE ══ */}
          <div className="marquee-wrap py-4" style={{ background: "oklch(0.586 0.253 17.585)" }}>
            <div className="marquee-inner">
              {Array(8).fill(["🍕 Pizza","🍔 Burgers","🌮 Tacos","🍱 Sushi","🍜 Noodles","🥗 Salads","🍦 Desserts","☕ Drinks"]).flat().map((item,i) => (
                <span key={i} className="mx-5 text-white font-bold text-sm tracking-wide whitespace-nowrap">{item}</span>
              ))}
            </div>
          </div>

          {/* ══ FOOD CARDS ══ */}
          <section id="section-menu" className="py-4.5 px-5">
            <div className="max-w-7xl mx-auto">
              <Card className="bg-card border-border rounded-2xl shadow-2xl overflow-hidden theme-transition">
                <div className="h-1.5" style={{ background: "linear-gradient(to right, oklch(0.586 0.253 17.585), oklch(0.645 0.246 16.439), oklch(0.81 0.117 11.638))" }} />
                <CardContent className="p-8">

              <div className="flex items-end justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Star size={14} className="text-primary" fill="currentColor" />
                    <p className="text-primary text-xs font-black uppercase tracking-[.2em]">Our Full Menu</p>
                  </div>
                  <h2 className="text-4xl font-black tracking-tight text-foreground">
                    Explore <span className="gradient-text">Every Craving</span>
                  </h2>
                </div>
                <a href="./login">
                  <Button variant="ghost" className="text-sm font-bold text-muted-foreground hover:text-primary hidden sm:flex gap-1">
                    Sign In to Order <ChevronRight size={14} />
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { label: "Burgers",  emoji: "🍔" },
                  { label: "Pizza",    emoji: "🍕" },
                  { label: "Sushi",    emoji: "🍱" },
                  { label: "Tacos",    emoji: "🌮" },
                  { label: "Desserts", emoji: "🍰" },
                  { label: "Drinks",   emoji: "🥤" },
                ].map(({ label, emoji }) => (
                  <button
                    key={label}
                    onClick={() => setActiveCategory(label)}
                    className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-sm font-bold transition-all duration-300 border ${
                      activeCategory === label
                        ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                        : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    <span className="text-base">{emoji}</span>
                    {label}
                    {activeCategory === label && (
                      <span className="ml-1 bg-primary-foreground/20 text-primary-foreground text-[10px] font-black rounded-full px-1.5 py-0.5">
                        {ALL_FOODS.filter(f => f.category === label).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {filteredFoods.map(({ name, price, img, tag, rating, time, calories, desc, category }) => (
                  <a key={name} href="./login" className="block group">
                    <Card className="card-hover bg-card border-border rounded-3xl overflow-hidden shadow-sm cursor-pointer theme-transition h-full">
                      <div className="relative h-30 overflow-hidden">
                        <img src={img} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-black border-0 rounded-full">{tag}</Badge>
                        <Badge className="absolute top-3 right-3 bg-black/50 text-white text-[9px] font-bold border-0 rounded-full backdrop-blur">{category}</Badge>
                        <div className="absolute inset-0 bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="text-center text-white">
                            <p className="text-2xl mb-1">🔐</p>
                            <p className="text-xs font-black">Sign In to Order</p>
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                          <div className="flex gap-1.5">
                            <span className="text-[10px] font-bold bg-black/50 text-white backdrop-blur rounded-full px-2 py-0.5 flex items-center gap-1"><Clock size={9}/>{time}</span>
                            <span className="text-[10px] font-bold bg-black/50 text-white backdrop-blur rounded-full px-2 py-0.5 flex items-center gap-1"><Flame size={9}/>{calories} cal</span>
                          </div>
                          <span className="text-[10px] font-bold bg-yellow-400 text-black rounded-full px-2 py-0.5 flex items-center gap-1"><Star size={9} fill="black"/> {rating}</span>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-black text-sm mb-0.5 text-card-foreground group-hover:text-primary transition-colors">{name}</h3>
                        <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">{desc}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-primary">{price}</span>
                          <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-foreground group-hover:bg-primary text-background transition-colors duration-300">+</span>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>

              {filteredFoods.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="font-black text-foreground">No items found</p>
                  <p className="text-muted-foreground text-sm mt-1">Try a different search or category</p>
                </div>
              )}

              <div className="flex justify-center gap-2 mt-5">
                {CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`rounded-full transition-all duration-300 ${activeCategory === cat ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-muted-foreground/30 hover:bg-primary/50"}`} />
                ))}
              </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ══ ABOUT US ══ */}
          <section id="section-about" className="py-4 px-6">
            <div className="max-w-7xl mx-auto">
              <Card className="bg-card border-border rounded-2xl shadow-2xl overflow-hidden theme-transition">
                <div className="h-1.5" style={{ background: "linear-gradient(to right, oklch(0.586 0.253 17.585), oklch(0.645 0.246 16.439), oklch(0.81 0.117 11.638))" }} />
                <CardContent className="p-8">
              <div className="text-center mb-14">
                <p className="text-primary text-xs font-black uppercase tracking-[.2em] mb-2">Who We Are</p>
                <h2 className="text-4xl font-black tracking-tight text-foreground mb-4">About <span className="gradient-text">SmartFood</span></h2>
                <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
                  We're Pakistan's fastest-growing food delivery platform, built by food lovers, for food lovers.
                  Our mission is simple: get the best food to your door while it's still piping hot.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                <div>
                  <h3 className="text-2xl font-black text-foreground mb-4">Our Story</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    SmartFood was founded in 2022 in Karachi by a group of university friends who were tired of cold, late deliveries.
                    We set out to build something better — a platform that puts speed, quality and experience first.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    Today we operate across 25+ cities in Pakistan, partnering with over 1,200 restaurants and employing
                    a network of dedicated riders who make thousands of deliveries every single day.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {["🏆 Best Delivery App 2023", "🚀 Fastest Growing Startup", "🌟 Top Rated Platform"].map(tag => (
                      <span key={tag} className="text-xs font-bold rounded-full px-4 py-2 bg-primary/10 text-primary border border-primary/20">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {ABOUT_STATS.map(({ icon, value, label, desc }, i) => (
                    <div key={label} className="about-card flex items-center gap-5 p-5 rounded-2xl bg-muted border border-border shadow-sm card-hover"
                      style={{ animationDelay: `${i * 0.15}s` }}>
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        {icon}
                      </div>
                      <div>
                        <p className="text-2xl font-black text-foreground">{value}</p>
                        <p className="text-sm font-bold text-foreground mb-0.5">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { emoji: "⚡", title: "Speed First",   desc: "Every second counts. We optimize every route for maximum speed." },
                  { emoji: "🌡️", title: "Always Fresh",  desc: "Insulated packaging ensures food arrives just as it left the kitchen." },
                  { emoji: "🤝", title: "Partner-First", desc: "We grow with our restaurant partners. Their success is our success." },
                  { emoji: "💚", title: "Sustainable",   desc: "Eco-friendly packaging and optimized routes reduce our carbon footprint." },
                ].map(({ emoji, title, desc }) => (
                  <div key={title} className="text-center p-6 rounded-2xl bg-muted border border-border card-hover">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl mx-auto mb-3">{emoji}</div>
                    <h4 className="font-black text-sm text-foreground mb-1">{title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ══ HOW IT WORKS ══ */}
          <section id="section-steps" className="py-4 px-6">
            <div className="max-w-7xl mx-auto">
              <Card className="bg-card border-border rounded-2xl shadow-2xl overflow-hidden theme-transition">
                <div className="h-1.5" style={{ background: "linear-gradient(to right, oklch(0.586 0.253 17.585), oklch(0.645 0.246 16.439), oklch(0.81 0.117 11.638))" }} />
                <CardContent className="p-8">
              <div className="text-center mb-12">
                <p className="text-primary text-xs font-black uppercase tracking-[.2em] mb-2">Simple Process</p>
                <h2 className="text-4xl font-black tracking-tight text-foreground">Order in <span className="gradient-text">4 Easy Steps</span></h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative">
                {STEPS.map(({ icon, title, desc }, i) => (
                  <Tooltip key={title}>
                    <TooltipTrigger asChild>
                      <div className={`relative text-center group cursor-pointer ${i < STEPS.length-1 ? "step-line" : "step-last"}`}>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 transition-all duration-300 group-hover:bg-primary group-hover:scale-110 group-hover:shadow-lg bg-primary/10">{icon}</div>
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 translate-x-6 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center">{i+1}</div>
                        <h3 className="font-black text-sm mb-1.5 group-hover:text-primary transition-colors text-foreground">{title}</h3>
                        <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Step {i+1}: {title}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ══ REVIEWS ══ */}
          <section className="py-4 px-6">
            <div className="max-w-7xl mx-auto">
              <Card className="bg-card border-border rounded-2xl shadow-2xl overflow-hidden theme-transition">
                <div className="h-1.5" style={{ background: "linear-gradient(to right, oklch(0.586 0.253 17.585), oklch(0.645 0.246 16.439), oklch(0.81 0.117 11.638))" }} />
                <CardContent className="p-8">
              <div className="text-center mb-10">
                <p className="text-primary text-xs font-black uppercase tracking-[.2em] mb-2">Testimonials</p>
                <h2 className="text-4xl font-black tracking-tight text-foreground">Loved by <span className="gradient-text">Thousands</span></h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {REVIEWS.map(({ name, avatar, rating, text, time, orders }) => (
                  <Card key={name} className="bg-muted border-border rounded-3xl shadow-sm card-hover theme-transition">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback style={{ background: "linear-gradient(135deg, oklch(0.645 0.246 16.439), oklch(0.81 0.117 11.638))" }} className="text-white font-bold text-sm">{avatar}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold text-card-foreground">{name}</p>
                            <p className="text-[10px] text-muted-foreground">{orders} orders · {time}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array(rating).fill(0).map((_,i) => <span key={i} className="text-yellow-400 text-xs">★</span>)}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">"{text}"</p>
                      <div className="mt-4 pt-3 border-t border-border flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-[10px] rounded-full bg-secondary text-secondary-foreground">Verified Order ✓</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ══ CTA ══ */}
          <section className="py-4 px-6">
            <div className="max-w-7xl mx-auto">
              <Card className="border-border rounded-2xl shadow-2xl overflow-hidden theme-transition">
                <div className="h-1.5" style={{ background: "linear-gradient(to right, oklch(0.586 0.253 17.585), oklch(0.645 0.246 16.439), oklch(0.81 0.117 11.638))" }} />
                <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, oklch(0.14 0.005 285) 0%, oklch(0.18 0.01 17) 50%, oklch(0.14 0.005 285) 100%)" }}>
                  <div className="absolute top-0 left-0 w-80 h-80 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ background: "oklch(0.586 0.253 17.585 / 25%)" }} />
                  <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" style={{ background: "oklch(0.81 0.117 11.638 / 20%)" }} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "oklch(0.645 0.246 16.439 / 10%)" }} />
                  <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

                  <CardContent className="relative z-10 p-10 lg:p-14">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                      <div className="flex-1">
                        <Badge className="rounded-full mb-4 text-xs font-black px-3 py-1" style={{ background: "oklch(0.455 0.188 13.697 / 40%)", color: "oklch(0.81 0.117 11.638)", border: "1px solid oklch(0.514 0.222 16.935 / 50%)" }}>
                          ⏰ Limited Time Offer
                        </Badge>
                        <h2 className="text-5xl font-black tracking-tight leading-[1.05] mb-4" style={{ color: "oklch(0.98 0 0)" }}>
                          Get <span className="gradient-text">20% Off</span><br />Your First Order
                        </h2>
                        <p className="text-sm mb-5 max-w-sm leading-relaxed" style={{ color: "oklch(0.75 0.01 285)" }}>
                          New to SmartFood? Sign in and use code at checkout to unlock your welcome discount.
                        </p>
                        <div className="inline-flex items-center gap-3 rounded-2xl px-5 py-3 mb-6 border" style={{ background: "oklch(1 0 0 / 8%)", borderColor: "oklch(1 0 0 / 15%)" }}>
                          <span className="text-lg">🎁</span>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "oklch(0.65 0.01 285)" }}>Promo Code</p>
                            <p className="text-xl font-black tracking-widest gradient-text">FOOD20</p>
                          </div>
                        </div>
                        <p className="text-xs" style={{ color: "oklch(0.5 0.01 285)" }}>
                          Valid for new users only · Expires midnight tonight · Max discount PKR 300
                        </p>
                      </div>

                      <div className="flex-shrink-0 w-full lg:w-80">
                        <div className="rounded-3xl p-6 border" style={{ background: "oklch(1 0 0 / 6%)", borderColor: "oklch(1 0 0 / 12%)", backdropFilter: "blur(12px)" }}>
                          <p className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: "oklch(0.65 0.01 285)" }}>What you get</p>
                          <div className="flex flex-col gap-3 mb-6">
                            {[
                              { icon: "💰", label: "20% off your order" },
                              { icon: "🚴", label: "Free delivery included" },
                              { icon: "⚡", label: "Priority dispatch" },
                              { icon: "🎉", label: "Welcome bonus points" },
                            ].map(({ icon, label }) => (
                              <div key={label} className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: "oklch(0.586 0.253 17.585 / 25%)" }}>{icon}</span>
                                <span className="text-sm font-semibold" style={{ color: "oklch(0.88 0.01 285)" }}>{label}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-col gap-3">
                            <a href="./login" className="block">
                              <Button className="w-full shimmer-btn glow-btn rounded-2xl py-5 font-black text-primary-foreground border-0 text-sm">
                                🔐 Sign In to Claim →
                              </Button>
                            </a>
                            <Button
                              variant="ghost"
                              onClick={() => scrollToSection("Menu")}
                              className="w-full rounded-2xl py-4 text-sm font-bold border cursor-pointer"
                              style={{ color: "oklch(0.75 0.01 285)", borderColor: "oklch(1 0 0 / 15%)" }}
                            >
                              Browse Menu First
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>
          </section>

          {/* ══ FOOTER ══ */}
          <footer className="py-4 px-6 pb-6">
            <div className="max-w-7xl mx-auto">
              <Card className="bg-card border-border rounded-2xl shadow-2xl overflow-hidden theme-transition">
                <div className="h-1.5" style={{ background: "linear-gradient(to right, oklch(0.586 0.253 17.585), oklch(0.645 0.246 16.439), oklch(0.81 0.117 11.638))" }} />
                <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 pb-10 border-b border-border">
                <div>
                  <a href="#"><Logo dark={dark} size="text-2xl" /></a>
                  <p className="text-muted-foreground text-xs mt-3 leading-relaxed max-w-[200px]">Pakistan's fastest food delivery platform. Order in seconds.</p>
                  <div className="flex gap-2 mt-4">
                    {["𝕏","in","ig","fb"].map(s => (
                      <Tooltip key={s}>
                        <TooltipTrigger asChild>
                          <button className="w-8 h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center hover:bg-primary hover:text-primary-foreground bg-muted text-muted-foreground">{s}</button>
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
                    <p className="text-xs font-black uppercase tracking-widest mb-4 text-foreground">{heading}</p>
                    <div className="flex flex-col gap-2.5">
                      {links.map(l => <a key={l} href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">{l}</a>)}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-muted-foreground text-xs mt-6 font-medium">
                © {new Date().getFullYear()} SmartFood Inc. All rights reserved. Made with ❤️ by Rizwan, Aqib and Suhaib.
              </p>
                </CardContent>
              </Card>
            </div>
          </footer>

        </div>
    </TooltipProvider>
  )
}