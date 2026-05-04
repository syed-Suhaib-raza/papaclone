"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Home, Users as UsersIcon, UtensilsCrossed, BarChart3,
  Settings, Search, Menu, X, TrendingUp, TrendingDown,
  RefreshCw, AlertTriangle, Download, DollarSign
} from "lucide-react"

// UI Components
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet"
import ThemeToggle from "@/components/theme-toggle"
import StatusBadge from "@/components/admin/StatusBadge"
import ChartTooltip from "@/components/admin/ChartTooltip"

import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer,
} from "recharts"

// Sub pages (Ensure these paths match your folder structure)
import UsersPage from "./usermanage/page"
import Restaurants from "./resmanage/page"
import Analytics from "./analytics/page"
import SettingsPage from "./settings/page"
import AlertsPage from "./alerts/page"
import CommissionsPage from "./commissions/page"

// --- DASHBOARD CONTENT SUB-COMPONENT ---
function DashboardContent({ setPage }: { setPage: (page: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();
      setData(json);
    } catch (err) { 
      console.error("Dashboard Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = () => {
    if (!data || !data.recentOrders) return;
    const headers = ["Order ID", "Customer", "Amount", "Status"];
    const rows = data.recentOrders.map((o: any) => [
      o.id, o.customer, `"${o.amount}"`, o.status
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `SmartFood_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !data) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
       <RefreshCw className="animate-spin text-primary" size={32} />
       <p className="text-muted-foreground text-sm font-bold">Syncing live data...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Welcome back, Admin 👋</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="rounded-xl font-bold gap-2">
            <Download size={14} /> Export Report
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setLoading(true); fetchData(); }} className="rounded-xl font-bold gap-2">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>
      </div>

      {/* STATS CARDS - Fixed Keys */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {data.stats.map((s: any, i: number) => (
          <Card key={`stat-${s.label}-${i}`} className="bg-card border-border rounded-2xl theme-transition">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground font-bold">{s.label}</p>
                <span className={`text-xs font-bold flex items-center gap-0.5 ${s.up ? "text-green-500" : "text-red-500"}`}>
                  {s.up ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}{s.change}
                </span>
              </div>
              <p className="text-2xl font-black text-foreground mb-2">{s.value}</p>
              <div className="h-[40px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={s.sparkline.map((v: any, j: any) => ({ j, v }))}>
                    <defs>
                      <linearGradient id={`sg${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={s.sColor} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={s.sColor} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={s.sColor} strokeWidth={2} fill={`url(#sg${i})`} dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* RECENT ORDERS - Fixed Keys */}
        <Card className="bg-card border-border rounded-2xl theme-transition">
          <CardContent className="p-5">
            <h3 className="font-black text-foreground mb-4">Recent Orders</h3>
            <div className="flex flex-col gap-4">
              {data.recentOrders?.map((o: any, idx: number) => (
                <div key={`order-${o.id}-${idx}`} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">ORD</div>
                      <div>
                        <p className="text-xs font-bold">{o.customer}</p>
                        <p className="text-[10px] text-muted-foreground">Order Ref: {o.id?.slice(0,5) || "N/A"}</p>
                      </div>
                   </div>
                   <StatusBadge status={o.status}/>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* TOP RESTAURANTS - Fixed Keys */}
        <Card className="bg-card border-border rounded-2xl theme-transition">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-foreground">Top Restaurants</h3>
              <Button variant="link" size="sm" className="text-primary text-xs font-bold h-auto p-0" onClick={() => setPage("restaurants")}>View all →</Button>
            </div>
            <div className="flex flex-col gap-4">
              {data.topRestaurants.map((r: any, idx: number) => (
                <div key={`res-${r.id}-${idx}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-lg">🍽️</div>
                    <div>
                      <p className="text-xs font-bold">{r.name}</p>
                      <p className="text-[10px] text-muted-foreground">{r.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-yellow-500">⭐ {r.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border rounded-2xl theme-transition">
        <CardContent className="p-5">
          <h3 className="font-black text-foreground mb-4">This Week Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.lineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize:10, fontWeight:700}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize:10}} />
              <ReTooltip content={<ChartTooltip/>}/>
              <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="delivered" stroke="#22c55e" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

// --- MAIN PAGE COMPONENT ---
export default function AdminPage() {
  const [activePage, setActivePage] = useState("dashboard")
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const PAGE_MAP: Record<string, React.ReactNode> = {
    dashboard: <DashboardContent setPage={setActivePage}/>,
    users: <UsersPage/>,
    restaurants: <Restaurants/>,
    commissions: <CommissionsPage/>,
    alerts: <AlertsPage/>,
    analytics: <Analytics/>,
    settings: <SettingsPage/>,
  }

  const NAV = [
    { page:"dashboard", label:"Dashboard", icon:<Home size={16}/> },
    { page:"users", label:"Users", icon:<UsersIcon size={16}/> },
    { page:"restaurants", label:"Restaurants", icon:<UtensilsCrossed size={16}/> },
    { page:"commissions", label:"Commissions", icon:<DollarSign size={16}/> },
    { page:"alerts", label:"System Alerts", icon:<AlertTriangle size={16}/>, badge: "!" },
    { page:"analytics", label:"Analytics", icon:<BarChart3 size={16}/> },
    { page:"settings", label:"Settings", icon:<Settings size={16}/> },
  ]

  function SidebarNav({ onClose }: { onClose?: () => void }) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="font-black text-lg">
            🍕 <span className="text-foreground">Smart</span>
            <span className="text-primary">Food</span>
          </span>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X size={16}/>
            </Button>
          )}
        </div>

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
                <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center rounded-full p-0 text-[10px]">
                  {badge}
                </Badge>
              )}
            </button>
          ))}
        </ScrollArea>

        <Separator/>
        <div className="p-4">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-muted">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">AD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-black text-foreground truncate">Admin User</p>
              <p className="text-[10px] text-muted-foreground truncate">Super Admin</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background theme-transition overflow-hidden">
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border theme-transition">
        <SidebarNav/>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-3 bg-card border-b border-border theme-transition flex-shrink-0">
          <div className="flex items-center gap-3">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu size={20}/>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 flex flex-col">
                <div className="sr-only">
                  <SheetHeader>
                    <SheetTitle>Admin Navigation</SheetTitle>
                    <SheetDescription>Mobile navigation sidebar</SheetDescription>
                  </SheetHeader>
                </div>
                <SidebarNav onClose={() => setIsSheetOpen(false)}/>
              </SheetContent>
            </Sheet>

            <div className="hidden sm:flex items-center gap-2 bg-muted rounded-xl px-3 py-2 w-56">
              <Search size={13} className="text-muted-foreground flex-shrink-0"/>
              <Input
                placeholder="Search analytics..."
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-auto p-0 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle/>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {PAGE_MAP[activePage]}
        </main>
      </div>
    </div>
  )
}