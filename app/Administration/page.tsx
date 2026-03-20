// AdminPage.tsx
"use client"

import { useState } from "react"
import {
  Home,
  Users as UsersIcon,        // ← renamed to avoid conflict with Users page
  UtensilsCrossed,
  ShoppingBag,
  Package,
  Bike,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  Search,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

// ── Uploaded components ───────────────────────────────────
import { Avatar, AvatarFallback }                                   from "@/components/ui/avatar"
import { Badge }                                                     from "@/components/ui/badge"
import { Button }                                                    from "@/components/ui/button"
import { Card, CardContent }                                         from "@/components/ui/card"
import { Input }                                                     from "@/components/ui/input"
import { ScrollArea }                                                from "@/components/ui/scroll-area"
import { Separator }                                                 from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetTrigger }                        from "@/components/ui/sheet"
import ThemeToggle                                                   from "@/components/theme-toggle"

// ── or update the path below to match where you place it ──
import StatusBadge from "@/components/admin/StatusBadge"

import ChartTooltip from "@/components/admin/ChartTooltip"

// ── Recharts ──────────────────────────────────────────────
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  Legend, ResponsiveContainer,
} from "recharts"

// ── Sub pages — update paths to match YOUR folder structure
import UsersPage     from "./User_Management/Page_User"
import Restaurants   from "./Restaurant_Management/Page_Restaurant"
import MenuPage      from "./Menu_Management/Page_Menu"
import Orders        from "./Order_Mangement/Page_Order"
import Delivery      from "./Delivery_Management/Page_Delivery"
import Payments      from "./Payment_Management/Page_Payment"
import Analytics     from "./Analytics/Page_Analytics"
import Notifications from "./Messages/Page_Message"
import SettingsPage  from "./Settings/Page_Settings"

// ═══════════════════════════════════════════════════════════
// DASHBOARD CONTENT — replace arrays with your real API data
// ═══════════════════════════════════════════════════════════
const STATS = [
  { label:"Total Orders",   value:"—", change:"—", up:true,  sparkline:[40,55,48,62,58,72,65,80,74,88,82,95], sColor:"#3b82f6" },
  { label:"Revenue",        value:"—", change:"—", up:true,  sparkline:[28,32,29,41,38,45,42,51,48,56,53,62], sColor:"#22c55e" },
  { label:"Active Riders",  value:"—", change:"—", up:true,  sparkline:[110,120,115,130,125,135,128,140,138,145,142,148], sColor:"hsl(var(--primary))" },
  { label:"Pending Issues", value:"—", change:"—", up:false, sparkline:[12,18,15,22,19,25,21,28,24,30,27,23], sColor:"#eab308" },
]
const RECENT_ORDERS: any[]   = [] // → replace with API call
const TOP_RESTAURANTS: any[] = [] // → replace with API call
const LINE_DATA: any[]       = [] // → replace with API call

function DashboardContent() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, Admin 👋 Here's what's happening today.
          </p>
        </div>
      </div>

      {/* Stat Cards with Sparklines */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map((s, i) => (
          <Card key={s.label} className="bg-card border-border rounded-2xl theme-transition">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground font-bold">{s.label}</p>
                <span className={`text-xs font-bold flex items-center gap-0.5 ${s.up ? "text-green-500" : "text-red-500"}`}>
                  {s.up ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}{s.change}
                </span>
              </div>
              <p className="text-2xl font-black text-foreground mb-2">{s.value}</p>
              <ResponsiveContainer width="100%" height={40}>
                <AreaChart data={s.sparkline.map((v, j) => ({ j, v }))} margin={{ top:2, right:0, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id={`sg${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={s.sColor} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={s.sColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={s.sColor} strokeWidth={2} fill={`url(#sg${i})`} dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders + Top Restaurants */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card className="bg-card border-border rounded-2xl theme-transition">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-foreground">Recent Orders</h3>
              <Button variant="link" size="sm" className="text-primary text-xs font-bold h-auto p-0">
                View all →
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {RECENT_ORDERS.slice(0, 4).map((o: any) => (
                <div key={o.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                      {o.id?.slice(-2)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{o.customer}</p>
                      <p className="text-[10px] text-muted-foreground">{o.restaurant}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-primary">{o.amount}</p>
                    <StatusBadge status={o.status}/>
                  </div>
                </div>
              ))}
              {RECENT_ORDERS.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Connect your API to show orders</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-2xl theme-transition">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-foreground">Top Restaurants</h3>
              <Button variant="link" size="sm" className="text-primary text-xs font-bold h-auto p-0">
                View all →
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {TOP_RESTAURANTS.slice(0, 4).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-lg">🍽️</div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{r.name}</p>
                      <p className="text-[10px] text-muted-foreground">{r.cuisine} · {r.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-yellow-500">⭐ {r.rating}</p>
                    <p className="text-[10px] text-muted-foreground">{r.orders} orders</p>
                  </div>
                </div>
              ))}
              {TOP_RESTAURANTS.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Connect your API to show restaurants</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Line Chart */}
      <Card className="bg-card border-border rounded-2xl theme-transition">
        <CardContent className="p-5">
          <h3 className="font-black text-foreground mb-4">This Week — Orders vs Deliveries</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={LINE_DATA} margin={{ top:0, right:10, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false}/>
              <XAxis dataKey="day" tick={{ fontSize:10, fill:"hsl(var(--muted-foreground))", fontWeight:700 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:"hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false}/>
              <ReTooltip content={<ChartTooltip/>}/>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:"11px", fontWeight:700, paddingTop:"12px" }}/>
              <Line type="monotone" dataKey="orders"    name="Orders"    stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} activeDot={{ r:5 }}/>
              <Line type="monotone" dataKey="delivered" name="Delivered" stroke="#22c55e"              strokeWidth={2.5} dot={false} activeDot={{ r:5 }}/>
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// NAV CONFIG
// ═══════════════════════════════════════════════════════════
const NAV = [
  { page:"dashboard",     label:"Dashboard",     icon:<Home size={16}/>                    },
  { page:"users",         label:"Users",         icon:<UsersIcon size={16}/>,          badge:6  },
  { page:"restaurants",   label:"Restaurants",   icon:<UtensilsCrossed size={16}/>,    badge:1  },
  { page:"menu",          label:"Menu Items",    icon:<ShoppingBag size={16}/>             },
  { page:"orders",        label:"Orders",        icon:<Package size={16}/>,            badge:23 },
  { page:"delivery",      label:"Delivery",      icon:<Bike size={16}/>                    },
  { page:"payments",      label:"Payments",      icon:<CreditCard size={16}/>              },
  { page:"analytics",     label:"Analytics",     icon:<BarChart3 size={16}/>               },
  { page:"notifications", label:"Notifications", icon:<Bell size={16}/>,               badge:3  },
  { page:"settings",      label:"Settings",      icon:<Settings size={16}/>                },
]

// ═══════════════════════════════════════════════════════════
// ROOT — AdminPage IS the dashboard
// ═══════════════════════════════════════════════════════════
export default function AdminPage() {
  const [activePage, setActivePage] = useState("dashboard")

  const PAGE_MAP: Record<string, React.ReactNode> = {
    dashboard:     <DashboardContent/>,
    users:         <UsersPage/>,
    restaurants:   <Restaurants/>,
    menu:          <MenuPage/>,
    orders:        <Orders/>,
    delivery:      <Delivery/>,
    payments:      <Payments/>,
    analytics:     <Analytics/>,
    notifications: <Notifications/>,
    settings:      <SettingsPage/>,
  }

  function SidebarNav({ onClose }: { onClose?: () => void }) {
    return (
      <>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="font-black text-lg">
            🍕 <span className="text-foreground">Smart</span>
            <span className="gradient-text">Food</span>
            <span className="text-[10px] text-muted-foreground font-bold ml-1 align-middle">Admin</span>
          </span>
          {onClose && (
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X size={16}/>
            </Button>
          )}
        </div>

        {/* ScrollArea */}
        <ScrollArea className="flex-1 py-3 px-3">
          {NAV.map(({ page, label, icon, badge }) => (
            <button
              key={page}
              onClick={() => { setActivePage(page); onClose?.() }}
              className={`
                w-full flex items-center justify-between
                px-3 py-2.5 rounded-xl mb-0.5 text-sm font-bold
                transition-all duration-200
                ${activePage === page
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }
              `}
            >
              <div className="flex items-center gap-3">{icon}{label}</div>
              {badge && (
                <Badge className={`text-[10px] font-black h-5 min-w-5 px-1.5 border-transparent ${
                  activePage === page ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                }`}>
                  {badge}
                </Badge>
              )}
            </button>
          ))}
        </ScrollArea>

        {/* Separator */}
        <Separator/>

        {/* Admin footer */}
        <div className="p-4">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-muted">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">AD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-foreground truncate">Admin User</p>
              <p className="text-[10px] text-muted-foreground truncate">Super Admin</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="flex h-screen bg-background theme-transition overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border theme-transition">
        <SidebarNav/>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Navbar */}
        <header className="flex items-center justify-between px-6 py-3 bg-card border-b border-border theme-transition flex-shrink-0">
          <div className="flex items-center gap-3">

            {/* Sheet — mobile */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="lg:hidden">
                  <Menu size={20}/>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 flex flex-col" showCloseButton={false}>
                <SidebarNav onClose={() => {}}/>
              </SheetContent>
            </Sheet>

            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 bg-muted rounded-xl px-3 py-2 w-56">
              <Search size={13} className="text-muted-foreground flex-shrink-0"/>
              <Input
                placeholder="Search anything..."
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-auto p-0 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bell */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost" size="icon"
                    className="relative rounded-xl bg-muted"
                    onClick={() => setActivePage("notifications")}
                  >
                    <Bell size={15}/>
                    <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-[9px] font-black flex items-center justify-center rounded-full">
                      3
                    </Badge>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <ThemeToggle/>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {PAGE_MAP[activePage]}
        </main>
      </div>
    </div>
  )
}