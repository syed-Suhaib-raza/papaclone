"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Search, RefreshCw, DollarSign, CheckCircle,
  AlertTriangle, Percent, Edit2, X, Save
} from "lucide-react"

interface CommissionRow {
  id: string
  name: string
  commission_percentage: number
  total_commission: number
}

function StatCard({ label, val, color, icon }: {
  label: string; val: string | number; color: string; icon: React.ReactNode
}) {
  return (
    <div className="card-hover bg-card border border-border p-5 rounded-[2rem] flex items-center gap-4 transition-all"
         style={{ "--accent": color } as any}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
           style={{ backgroundColor: `${color}15`, color }}>{icon}</div>
      <div>
        <div className="text-2xl font-black leading-none tracking-tight" style={{ color }}>{val}</div>
        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  )
}

function ResAvatar({ name }: { name: string }) {
  const initial = (name || "?")[0].toUpperCase()
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black border-2 transition-all shadow-sm text-[11px]"
         style={{ background: "linear-gradient(135deg, hsl(var(--primary)/20%), hsl(var(--primary)/40%))", borderColor: "hsl(var(--primary)/30%)", color: "hsl(var(--primary))" }}>
      {initial}
    </div>
  )
}

export default function CommissionsPage() {
  const [rows, setRows] = useState<CommissionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [search, setSearch] = useState("")
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/commissions")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load")
      setRows(data.rows ?? [])
    } catch (e: any) {
      showToast(e.message, "error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const startEdit = (row: CommissionRow) => {
    setEditId(row.id)
    setEditValue(row.commission_percentage.toString())
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditValue("")
  }

  const saveEdit = async (id: string) => {
    const pct = parseFloat(editValue)
    if (isNaN(pct) || pct < 0 || pct > 1) {
      showToast("Percentage must be between 0 and 1 (e.g. 0.15 for 15%)", "error")
      return
    }
    setActing(id)
    try {
      const res = await fetch("/api/admin/commissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, commission_percentage: pct }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Update failed")
      showToast("Commission rate updated", "success")
      cancelEdit()
      await load()
    } catch (e: any) {
      showToast(e.message, "error")
    } finally {
      setActing(null)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rows.filter(r => r.name.toLowerCase().includes(q))
  }, [rows, search])

  const configuredCount = rows.filter(r => r.commission_percentage > 0).length
  const totalEarned = rows.reduce((sum, r) => sum + r.total_commission, 0)

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-background theme-transition">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] px-6 py-3 rounded-2xl border backdrop-blur-md flex items-center gap-3 font-bold text-sm shadow-2xl ${
          toast.type === "success"
            ? "bg-primary/20 border-primary/30 text-primary"
            : "bg-destructive/20 border-destructive/30 text-destructive"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 float-b">
            <DollarSign size={28} className="text-primary-foreground"/>
          </div>
          <div>
            <h1 className="gradient-text font-black text-3xl tracking-tight">Commission Management</h1>
            <p className="text-muted-foreground text-sm font-medium">Set per-restaurant rider commission rates</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all font-bold text-xs uppercase tracking-widest"
                onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""}/>
          {loading ? "Syncing..." : "Refresh"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard label="Restaurants Configured" val={configuredCount} color="hsl(var(--primary))" icon={<Percent size={18}/>}/>
        <StatCard label="Total Commissions Earned" val={`PKR ${totalEarned.toLocaleString()}`} color="#22c55e" icon={<DollarSign size={18}/>}/>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-2.5 mb-6 w-full max-w-sm">
        <Search size={14} className="text-muted-foreground flex-shrink-0"/>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search restaurants..."
          className="bg-transparent text-sm font-medium placeholder:text-muted-foreground outline-none w-full"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b border-border bg-muted/40">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Restaurant</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Commission %</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Earned</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw className="animate-spin text-primary" size={28}/>
            <p className="text-muted-foreground text-sm font-bold">Loading commissions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <DollarSign size={32} className="text-muted-foreground"/>
            <p className="text-muted-foreground text-sm font-bold">No restaurants found</p>
          </div>
        ) : (
          filtered.map((row, idx) => (
            <div
              key={row.id}
              className={`grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-center px-6 py-4 transition-colors hover:bg-muted/30 ${
                idx !== filtered.length - 1 ? "border-b border-border" : ""
              }`}
            >
              {/* Restaurant */}
              <div className="flex items-center gap-3">
                <ResAvatar name={row.name}/>
                <div>
                  <p className="text-sm font-black text-foreground">{row.name}</p>
                  <p className="text-[10px] text-muted-foreground">ID: {row.id.slice(0, 8)}…</p>
                </div>
              </div>

              {/* Commission % */}
              <div>
                {editId === row.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="w-20 text-sm font-bold bg-muted border border-border rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary/40"
                      autoFocus
                    />
                    <span className="text-xs text-muted-foreground font-bold">/ 1</span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20">
                    <Percent size={10}/>
                    {(row.commission_percentage * 100).toFixed(1)}%
                  </span>
                )}
              </div>

              {/* Total Earned */}
              <div>
                <span className="text-sm font-bold text-foreground">PKR {row.total_commission.toLocaleString()}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {editId === row.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(row.id)}
                      disabled={acting === row.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-black hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {acting === row.id ? <RefreshCw size={11} className="animate-spin"/> : <Save size={11}/>}
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs font-black hover:bg-muted transition-colors"
                    >
                      <X size={11}/> Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => startEdit(row)}
                    disabled={!!editId}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs font-black hover:bg-muted transition-colors disabled:opacity-40"
                  >
                    <Edit2 size={11}/> Edit
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
