"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Search, Shield, ShieldOff, UserCheck, UserX,
  RefreshCw, Users, UserCog, Bike, AlertTriangle
} from "lucide-react"

/* ─── Types ──────────────────────────────────────────── */
type Role   = "admin" | "manager" | "support" | "customer" | "rider"
type Status = "active" | "blocked"

interface User {
  id: string; name: string; email: string; role: Role; status: Status
  orders: number; joined: string; lastActive: string; city: string
}

/* ─── Theme Mapping (Uses variables from your globals.css) ─── */
const ROLE_THEME: Record<Role, { color: string; label: string }> = {
  admin:    { color: "var(--destructive)", label: "Administrator" },
  manager:  { color: "var(--chart-5)",     label: "Manager" },
  support:  { color: "var(--chart-3)",     label: "Support" },
  customer: { color: "var(--primary)",     label: "Customer" },
  rider:    { color: "var(--chart-2)",     label: "Delivery Rider" },
}

const ROLES: Role[] = ["admin", "manager", "support", "customer", "rider"]

// Safety Helper: Prevents "Cannot destructure property 'color' of undefined"
const getTheme = (role: string) => {
  return ROLE_THEME[role as Role] || ROLE_THEME.customer;
}

/* ─── Sub-components ─────────────────────────────────── */
function RoleBadge({ role }: { role: string }) {
  const { color } = getTheme(role)
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all"
      style={{ backgroundColor: `${color}15`, color: color, borderColor: `${color}30` } as any}>
      {role || "user"}
    </span>
  )
}

function Avatar({ name, role, size = "md" }: { name: string; role: string; size?: "md" | "lg" }) {
  const { color } = getTheme(role)
  const initials = (name || "?").split(" ").map(n => n[0] ?? "").join("").slice(0, 2).toUpperCase()
  const s = size === "md" ? "w-10 h-10 text-[11px]" : "w-16 h-16 text-[18px]"
  return (
    <div className={`${s} rounded-full flex items-center justify-center font-black border-2 transition-all duration-500 shadow-sm`}
      style={{ background: `linear-gradient(135deg, ${color}20, ${color}40)`, borderColor: `${color}30`, color: color } as any}>
      {initials}
    </div>
  )
}

function StatCard({ label, val, color, icon }: {
  label: string; val: number; color: string; icon: React.ReactNode
}) {
  return (
    <div className="card-hover bg-card border border-border p-5 rounded-[2rem] flex items-center gap-4 transition-all"
         style={{ '--accent': color } as any}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" 
           style={{ backgroundColor: `${color}15`, color }}>{icon}</div>
      <div>
        <div className="text-2xl font-black leading-none tracking-tight" style={{ color }}>{val.toLocaleString()}</div>
        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)
  const [search, setSearch] = useState("")
  const [roleF, setRoleF] = useState<Role|"all">("all")
  const [modal, setModal] = useState<User|null>(null)
  const [detailU, setDetailU] = useState<User|null>(null)
  const [newRole, setNewRole] = useState<Role>("customer")
  const [acting, setActing] = useState<string|null>(null)
  const [toast, setToast] = useState<{msg:string;type:"success"|"error"}|null>(null)

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/usermanage")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load")
      setUsers(data.users ?? [])
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const blockUser = async (id: string, block: boolean) => {
    setActing(id)
    try {
      const res = await fetch("/api/admin/usermanage", { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ id, action: block ? "block" : "unblock" }) 
      })
      if (!res.ok) throw new Error("Update failed")
      setUsers(us => us.map(u => u.id === id ? { ...u, status: block ? "blocked" : "active" } : u))
      if (detailU?.id === id) setDetailU({ ...detailU, status: block ? "blocked" : "active" })
      showToast(`User ${block ? "blocked" : "unblocked"}`, "success")
    } catch(e:any) { showToast(e.message, "error") }
    finally { setActing(null) }
  }

  const changeRole = async () => {
    if (!modal) return
    setActing(modal.id)
    try {
      const res = await fetch("/api/admin/usermanage", { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ id: modal.id, action: "role", role: newRole }) 
      })
      if (!res.ok) throw new Error("Role update failed")
      setUsers(us => us.map(u => u.id === modal.id ? { ...u, role: newRole } : u))
      if (detailU?.id === modal.id) setDetailU({ ...detailU, role: newRole })
      showToast("Role updated successfully", "success")
      setModal(null)
    } catch(e:any) { showToast(e.message, "error") }
    finally { setActing(null) }
  }

  const filtered = useMemo(() => {
    return users.filter(u => {
      const ms = search.toLowerCase()
      const matchesSearch = u.name?.toLowerCase().includes(ms) || u.email?.toLowerCase().includes(ms) || u.city?.toLowerCase().includes(ms)
      const matchesRole = roleF === "all" || u.role === roleF
      return matchesSearch && matchesRole
    })
  }, [users, search, roleF])

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-background theme-transition">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] px-6 py-3 rounded-2xl border backdrop-blur-md added-pop flex items-center gap-3 font-bold text-sm shadow-2xl ${
          toast.type === 'success' ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-destructive/20 border-destructive/30 text-destructive'
        }`}>
          {toast.type === 'success' ? <UserCheck size={16}/> : <AlertTriangle size={16}/>}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 shimmer-btn float-b">
            <Users size={28} className="text-primary-foreground"/>
          </div>
          <div>
            <h1 className="gradient-text font-black text-3xl tracking-tight">System Users</h1>
            <p className="text-muted-foreground text-sm font-medium">Manage permissions and security</p>
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
        <StatCard label="Total" val={users.length} color="var(--foreground)" icon={<Users size={20}/>}/>
        <StatCard label="Admins" val={users.filter(u=>u.role==='admin').length} color="var(--destructive)" icon={<Shield size={20}/>}/>
        <StatCard label="Customers" val={users.filter(u=>u.role==='customer').length} color="var(--primary)" icon={<Users size={20}/>}/>
        <StatCard label="Riders" val={users.filter(u=>u.role==='rider').length} color="var(--chart-2)" icon={<Bike size={20}/>}/>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border p-3 rounded-2xl flex flex-wrap gap-4 items-center mb-6 shadow-sm">
        <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-xl flex-1 min-w-[240px]">
          <Search size={16} className="text-muted-foreground"/>
          <input className="bg-transparent border-none outline-none text-sm w-full" 
                 placeholder="Search name, email, city..." value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="flex gap-1 bg-muted/30 p-1 rounded-lg">
          {["all", ...ROLES].map(r => (
            <button key={r} onClick={() => setRoleF(r as any)} 
              className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                roleF === r ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'
              }`}>
              {r}
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
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identity</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">City</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map(u => (
                  <tr key={u.id} 
                      className={`group cursor-pointer transition-colors ${detailU?.id === u.id ? "bg-primary/5" : "hover:bg-muted/20"}`}
                      onClick={() => setDetailU(u)}>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar name={u.name} role={u.role}/>
                        <div>
                          <div className="font-bold text-sm leading-none">{u.name}</div>
                          <div className="text-[11px] text-muted-foreground mt-1">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><RoleBadge role={u.role}/></td>
                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground">{u.city || "—"}</td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${u.status === 'active' ? 'text-primary' : 'text-destructive'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-primary animate-pulse' : 'bg-destructive'}`}/>
                        {u.status}
                      </div>
                    </td>
                    <td className="px-8 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-center gap-2">
                        <button className={`p-2 rounded-lg border transition-all ${u.status === 'active' ? 'border-destructive/20 text-destructive hover:bg-destructive/10' : 'border-primary/20 text-primary hover:bg-primary/10'}`}
                          onClick={() => blockUser(u.id, u.status === 'active')} disabled={acting === u.id}>
                          {acting === u.id ? <RefreshCw size={14} className="animate-spin"/> : (u.status === 'active' ? <UserX size={14}/> : <UserCheck size={14}/>)}
                        </button>
                        <button className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground"
                                onClick={() => { setModal(u); setNewRole(u.role); }}>
                          <UserCog size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Detail Panel */}
        {detailU && (
          <div className="w-full lg:w-80 sticky top-8 bg-card border border-border rounded-[2.5rem] p-6 shadow-2xl added-pop">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">User Insight</span>
              <button onClick={() => setDetailU(null)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors">✕</button>
            </div>
            <div className="flex flex-col items-center text-center mb-8">
              <Avatar name={detailU.name} role={detailU.role} size="lg"/>
              <h3 className="mt-4 font-black text-xl leading-tight">{detailU.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">{detailU.email}</p>
              <RoleBadge role={detailU.role}/>
            </div>
            <div className="space-y-3 bg-muted/30 p-5 rounded-3xl border border-border/50 mb-6 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Total Orders</span>
                <span className="font-black text-primary">{detailU.orders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Location</span>
                <span className="font-black">{detailU.city || "Not Set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Joined Date</span>
                <span className="font-black">{new Date(detailU.joined).toLocaleDateString()}</span>
              </div>
            </div>
            <button className="w-full py-3.5 rounded-2xl bg-foreground text-background font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              onClick={() => { setModal(detailU); setNewRole(detailU.role); }}>
              <UserCog size={14}/> Modify Permissions
            </button>
          </div>
        )}
      </div>

      {/* Role Update Modal */}
      {modal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setModal(null)}>
          <div className="relative w-full max-w-sm bg-card border border-border rounded-[2.5rem] p-8 shadow-3xl added-pop" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield size={24}/>
              </div>
              <h3 className="font-black text-2xl tracking-tight mb-1">Update Role</h3>
              <p className="text-xs text-muted-foreground font-medium">Select a new access level for {modal.name}</p>
            </div>
            <div className="space-y-2 mb-8">
              {ROLES.map(r => (
                <button key={r} onClick={() => setNewRole(r)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    newRole === r ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-border'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getTheme(r).color }}/>
                    <span className={`text-xs font-black uppercase tracking-wider ${newRole === r ? 'text-primary' : 'text-muted-foreground'}`}>{r}</span>
                  </div>
                  {newRole === r && <UserCheck size={14} className="text-primary"/>}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-xl border border-border font-bold text-xs" onClick={() => setModal(null)}>Cancel</button>
              <button className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                      onClick={changeRole} disabled={acting === modal.id}>
                {acting === modal.id ? <RefreshCw size={14} className="animate-spin"/> : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}