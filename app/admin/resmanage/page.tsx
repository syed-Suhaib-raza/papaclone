"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Search, CheckCircle, RefreshCw, Store, 
  Star, TrendingUp, AlertTriangle, ToggleLeft, 
  ToggleRight, FileText, MapPin, DollarSign
} from "lucide-react"

/* ─── Types ──────────────────────────────────────────── */
type Status = "active" | "paused" | "disabled" | "pending"

interface Restaurant {
  id: string
  name: string
  city: string
  orders: number
  revenue: string
  rating: number
  cancelRate: string
  avgTime: string
  status: Status
  joined: string
  category: string
  user_id: string // Added to ensure we have the reference for role transitions
}

/* ─── Theme Mapping (Aligned with User Management) ─── */
const STATUS_THEME: Record<Status, { color: string; label: string }> = {
  active:   { color: "var(--primary)",     label: "Active" },
  pending:  { color: "var(--chart-3)",     label: "Pending Review" },
  paused:   { color: "var(--chart-2)",     label: "Paused" },
  disabled: { color: "var(--destructive)", label: "Disabled" },
}

const STATUSES: Status[] = ["active", "pending", "paused", "disabled"]

const getTheme = (status: string) => {
  return STATUS_THEME[status as Status] || STATUS_THEME.active;
}

/* ─── Sub-components ─────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const { color } = getTheme(status)
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all"
      style={{ backgroundColor: `${color}15`, color: color, borderColor: `${color}30` } as any}>
      {status}
    </span>
  )
}

function ResAvatar({ name, status }: { name: string; status: string }) {
  const { color } = getTheme(status)
  const initial = (name || "?")[0].toUpperCase()
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black border-2 transition-all duration-500 shadow-sm text-[11px]"
      style={{ background: `linear-gradient(135deg, ${color}20, ${color}40)`, borderColor: `${color}30`, color: color } as any}>
      {initial}
    </div>
  )
}

function StatCard({ label, val, color, icon }: {
  label: string; val: string | number; color: string; icon: React.ReactNode
}) {
  return (
    <div className="card-hover bg-card border border-border p-5 rounded-[2rem] flex items-center gap-4 transition-all"
         style={{ '--accent': color } as any}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" 
           style={{ backgroundColor: `${color}15`, color }}>{icon}</div>
      <div>
        <div className="text-2xl font-black leading-none tracking-tight" style={{ color }}>{val}</div>
        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  )
}

export default function RestaurantsPage() {
  const [rows, setRows] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusF, setStatusF] = useState<Status | "all">("all")
  const [detailR, setDetailR] = useState<Restaurant | null>(null)
  const [modal, setModal] = useState<Restaurant | null>(null)
  const [acting, setActing] = useState<string | null>(null)
  const [toast, setToast] = useState<{msg:string; type:"success"|"error"}|null>(null)

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/resmanage")
      const data = await res.json()
      setRows(data.restaurants ?? [])
    } catch (e) {
      showToast("Failed to sync database", "error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleAction = async (id: string, actionType: "enable" | "disable" | "approve" | "reject") => {
    setActing(id)
    try {
      const res = await fetch(`/api/admin/resmanage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: actionType }),
      })
      
      const responseData = await res.json()
      if (!res.ok) throw new Error(responseData.error || "Update failed")
      
      const successMsg = actionType === "approve" 
        ? "Partner approved and role transitioned!" 
        : `Restaurant ${actionType}d successfully`
        
      showToast(successMsg, "success")
      
      // Refresh data to show new statuses and role changes
      await load()
      setModal(null)
      
      // Update the detail panel if the active restaurant was the one modified
      if (detailR?.id === id) {
          setDetailR(prev => prev ? { ...prev, status: (actionType === 'approve' || actionType === 'enable') ? 'active' : 'disabled' } : null)
      }
    } catch (e: any) {
      showToast(e.message, "error")
    } finally {
      setActing(null)
    }
  }

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const ms = search.toLowerCase()
      const matchesSearch = (r.name || "").toLowerCase().includes(ms) || (r.city || "").toLowerCase().includes(ms)
      const matchesStatus = statusF === "all" || r.status === statusF
      return matchesSearch && matchesStatus
    })
  }, [rows, search, statusF])

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-background theme-transition">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] px-6 py-3 rounded-2xl border backdrop-blur-md added-pop flex items-center gap-3 font-bold text-sm shadow-2xl ${
          toast.type === 'success' ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-destructive/20 border-destructive/30 text-destructive'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 shimmer-btn float-b">
            <Store size={28} className="text-primary-foreground"/>
          </div>
          <div>
            <h1 className="gradient-text font-black text-3xl tracking-tight">Restaurant Fleet</h1>
            <p className="text-muted-foreground text-sm font-medium">Manage marketplace vendors and approvals</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all font-bold text-xs uppercase tracking-widest"
                onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Syncing..." : "Refresh"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Vendors" val={rows.length} color="var(--foreground)" icon={<Store size={20}/>}/>
        <StatCard label="Live Now" val={rows.filter(r=>r.status==='active').length} color="var(--primary)" icon={<TrendingUp size={20}/>}/>
        <StatCard label="Pending" val={rows.filter(r=>r.status==='pending').length} color="var(--chart-3)" icon={<AlertTriangle size={20}/>}/>
        <StatCard label="Disabled" val={rows.filter(r=>r.status==='disabled').length} color="var(--destructive)" icon={<ToggleLeft size={20}/>}/>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border p-3 rounded-2xl flex flex-wrap gap-4 items-center mb-6 shadow-sm">
        <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-xl flex-1 min-w-[240px]">
          <Search size={16} className="text-muted-foreground"/>
          <input className="bg-transparent border-none outline-none text-sm w-full" 
                 placeholder="Search restaurant or city..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="flex gap-1 bg-muted/30 p-1 rounded-lg">
          {["all", ...STATUSES].map(s => (
            <button key={s} onClick={() => setStatusF(s as any)} 
              className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                statusF === s ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 w-full bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-xl about-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Restaurant</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Performance</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Revenue</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map(r => (
                  <tr key={r.id} 
                      className={`group cursor-pointer transition-colors ${detailR?.id === r.id ? "bg-primary/5" : "hover:bg-muted/20"}`}
                      onClick={() => setDetailR(r)}>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <ResAvatar name={r.name} status={r.status}/>
                        <div>
                          <div className="font-bold text-sm leading-none">{r.name}</div>
                          <div className="text-[11px] text-muted-foreground mt-1">{r.category} • {r.city}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-xs font-black">
                                <Star size={12} className="text-chart-3" fill="var(--chart-3)"/> {r.rating}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-medium">{r.orders} Orders</div>
                        </div>
                    </td>
                    <td className="px-6 py-4 font-black text-xs text-primary">{r.revenue}</td>
                    <td className="px-6 py-4"><StatusBadge status={r.status}/></td>
                    <td className="px-8 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-center gap-2">
                        {r.status === 'pending' ? (
                            <button className="p-2 rounded-lg border border-primary/20 text-primary hover:bg-primary/10 transition-all"
                                onClick={() => setModal(r)}>
                                <CheckCircle size={14}/>
                            </button>
                        ) : (
                            <button className={`p-2 rounded-lg border transition-all ${r.status === 'active' ? 'border-destructive/20 text-destructive hover:bg-destructive/10' : 'border-primary/20 text-primary hover:bg-primary/10'}`}
                                onClick={() => handleAction(r.id, r.status === 'active' ? 'disable' : 'enable')} disabled={acting === r.id}>
                                {acting === r.id ? <RefreshCw size={14} className="animate-spin"/> : (r.status === 'active' ? <ToggleRight size={14}/> : <ToggleLeft size={14}/>)}
                            </button>
                        )}
                        <button className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground">
                          <FileText size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Detail Panel (Restaurant Insight) */}
        {detailR && (
          <div className="w-full lg:w-80 sticky top-8 bg-card border border-border rounded-[2.5rem] p-6 shadow-2xl added-pop">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vendor Insight</span>
              <button onClick={() => setDetailR(null)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors">✕</button>
            </div>
            <div className="flex flex-col items-center text-center mb-8">
              <ResAvatar name={detailR.name} status={detailR.status}/>
              <h3 className="mt-4 font-black text-xl leading-tight">{detailR.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">{detailR.category}</p>
              <StatusBadge status={detailR.status}/>
            </div>
            <div className="space-y-3 bg-muted/30 p-5 rounded-3xl border border-border/50 mb-6 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Location</span>
                <span className="font-black flex items-center gap-1"><MapPin size={10}/> {detailR.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Total Revenue</span>
                <span className="font-black text-primary flex items-center gap-1"><DollarSign size={10}/> {detailR.revenue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Partner Since</span>
                <span className="font-black">{detailR.joined}</span>
              </div>
            </div>
            <button className="w-full py-3.5 rounded-2xl bg-foreground text-background font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              onClick={() => { setModal(detailR); }}>
              <CheckCircle size={14}/> Review Documents
            </button>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {modal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setModal(null)}>
          <div className="relative w-full max-w-sm bg-card border border-border rounded-[2.5rem] p-8 shadow-3xl added-pop" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Store size={24}/>
              </div>
              <h3 className="font-black text-2xl tracking-tight mb-1">Verify Partner</h3>
              <p className="text-xs text-muted-foreground font-medium">Complete approval for {modal.name}</p>
            </div>
            
            <div className="space-y-4 mb-8">
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                    <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Business Details</div>
                    <div className="text-sm font-bold">{modal.name}</div>
                    <div className="text-[11px] text-muted-foreground">{modal.city} • {modal.category}</div>
                </div>
                <p className="text-[11px] text-center text-muted-foreground px-4">
                    Approving this vendor will make their menu live and allow them to start receiving customer orders immediately.
                </p>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-xl border border-border font-bold text-xs" onClick={() => setModal(null)}>Cancel</button>
              <button className="flex-1 py-3 rounded-xl bg-destructive text-white font-black text-xs uppercase tracking-widest"
                      onClick={() => handleAction(modal.id, "reject")} disabled={acting === modal.id}>
                Reject
              </button>
              <button className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                      onClick={() => handleAction(modal.id, "approve")} disabled={acting === modal.id}>
                {acting === modal.id ? <RefreshCw size={14} className="animate-spin"/> : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}