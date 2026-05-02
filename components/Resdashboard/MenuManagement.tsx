"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, UtensilsCrossed, CheckCircle, XCircle } from "lucide-react"

type Category = { id: string; name: string }

type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  available: boolean
  category_id: string | null
  categories: Category | null
}

type FormData = {
  name: string
  description: string
  price: string
  category_id: string
  image_url: string
  available: boolean
}

type DialogMode = "add" | "edit"

function CategorySection({
  title,
  items,
  onEdit,
  onDelete,
  onToggle,
}: {
  title: string
  items: MenuItem[]
  onEdit: (item: MenuItem) => void
  onDelete: (item: MenuItem) => void
  onToggle: (item: MenuItem) => void
}) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {title}
      </h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground border-b border-border">
            <tr>
              <th className="text-left py-3 px-4 font-medium">Item</th>
              <th className="text-left px-4 font-medium">Description</th>
              <th className="text-center px-4 font-medium">Price</th>
              <th className="text-center px-4 font-medium">Status</th>
              <th className="px-4"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border hover:bg-accent/30 transition-colors">
                <td className="py-3 px-4 font-medium">
                  <div className="flex items-center gap-3">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <UtensilsCrossed size={16} className="text-muted-foreground" />
                      </div>
                    )}
                    <span>{item.name}</span>
                  </div>
                </td>
                <td className="px-4 text-muted-foreground max-w-[200px]">
                  <span className="block truncate">{item.description ?? "—"}</span>
                </td>
                <td className="px-4 text-center font-medium">
                  PKR {item.price.toLocaleString()}
                </td>
                <td className="px-4 text-center">
                  <button
                    onClick={() => onToggle(item)}
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                      item.available
                        ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {item.available ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {item.available ? "Available" : "Unavailable"}
                  </button>
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                      <Pencil size={14} />
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(item)}>
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function MenuManagement({ accessToken }: { accessToken: string }) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<DialogMode>("add")
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    category_id: "",
    image_url: "",
    available: true,
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [newCategoryName, setNewCategoryName] = useState("")
  const [showCategoryInput, setShowCategoryInput] = useState(false)
  const [creatingCategory, setCreatingCategory] = useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  }

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [itemsRes, catsRes] = await Promise.all([
        fetch("/api/restaurant/menu", { headers: authHeaders }),
        fetch("/api/restaurant/categories", { headers: authHeaders }),
      ])
      if (!itemsRes.ok || !catsRes.ok) throw new Error("Failed to load menu data")
      const [itemsData, catsData] = await Promise.all([itemsRes.json(), catsRes.json()])
      setItems(itemsData)
      setCategories(catsData)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function openAddDialog() {
    setDialogMode("add")
    setEditingItem(null)
    setForm({ name: "", description: "", price: "", category_id: "", image_url: "", available: true })
    setFormError(null)
    setShowCategoryInput(false)
    setNewCategoryName("")
    setDialogOpen(true)
  }

  function openEditDialog(item: MenuItem) {
    setDialogMode("edit")
    setEditingItem(item)
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      category_id: item.category_id ?? "",
      image_url: item.image_url ?? "",
      available: item.available,
    })
    setFormError(null)
    setShowCategoryInput(false)
    setNewCategoryName("")
    setDialogOpen(true)
  }

  function openDeleteDialog(item: MenuItem) {
    setDeleteTarget(item)
    setDeleteDialogOpen(true)
  }

  async function handleSubmit() {
    setFormError(null)
    if (!form.name.trim()) { setFormError("Item name is required"); return }
    const priceNum = parseFloat(form.price)
    if (isNaN(priceNum) || priceNum < 0) { setFormError("Valid price is required"); return }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: priceNum,
        category_id: form.category_id || null,
        image_url: form.image_url.trim() || null,
        available: form.available,
      }

      if (dialogMode === "add") {
        const res = await fetch("/api/restaurant/menu", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(payload),
        })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed to add item") }
        const newItem: MenuItem = await res.json()
        setItems((prev) => [...prev, newItem].sort((a, b) => a.name.localeCompare(b.name)))
      } else {
        const res = await fetch(`/api/restaurant/menu/${editingItem!.id}`, {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify(payload),
        })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed to update item") }
        const updated: MenuItem = await res.json()
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      }
      setDialogOpen(false)
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleAvailable(item: MenuItem) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, available: !i.available } : i)))
    const res = await fetch(`/api/restaurant/menu/${item.id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        name: item.name,
        description: item.description,
        price: item.price,
        category_id: item.category_id,
        image_url: item.image_url,
        available: !item.available,
      }),
    })
    if (!res.ok) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, available: item.available } : i)))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/restaurant/menu/${deleteTarget.id}`, {
        method: "DELETE",
        headers: authHeaders,
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed to delete") }
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id))
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
    } catch {
      // keep dialog open on failure
    } finally {
      setDeleting(false)
    }
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return
    setCreatingCategory(true)
    try {
      const res = await fetch("/api/restaurant/categories", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ name: newCategoryName.trim() }),
      })
      if (!res.ok) throw new Error("Failed to create category")
      const cat: Category = await res.json()
      setCategories((prev) => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)))
      setForm((prev) => ({ ...prev, category_id: cat.id }))
      setNewCategoryName("")
      setShowCategoryInput(false)
    } finally {
      setCreatingCategory(false)
    }
  }

  const groupedItems = categories.map((cat) => ({
    category: cat,
    items: items.filter((i) => i.category_id === cat.id),
  })).filter((g) => g.items.length > 0)

  const uncategorizedItems = items.filter((i) => i.category_id === null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <Button onClick={openAddDialog}>
          <Plus size={16} />
          Add Item
        </Button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-8">
          {groupedItems.map(({ category, items: catItems }) => (
            <CategorySection
              key={category.id}
              title={category.name}
              items={catItems}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              onToggle={handleToggleAvailable}
            />
          ))}

          {uncategorizedItems.length > 0 && (
            <CategorySection
              title="Uncategorized"
              items={uncategorizedItems}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              onToggle={handleToggleAvailable}
            />
          )}

          {items.length === 0 && (
            <div className="text-center text-muted-foreground py-20">
              <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-30" />
              <p>No menu items yet. Click &quot;Add Item&quot; to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add Menu Item" : "Edit Menu Item"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <div className="space-y-1">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Zinger Burger"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Price (PKR) *</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                placeholder="e.g. 550"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— No category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {showCategoryInput ? (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                    onKeyDown={(e) => { if (e.key === "Enter") handleCreateCategory() }}
                  />
                  <Button size="sm" onClick={handleCreateCategory} disabled={creatingCategory}>
                    {creatingCategory ? "..." : "Add"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowCategoryInput(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  className="text-xs text-primary mt-1 hover:underline"
                  onClick={() => setShowCategoryInput(true)}
                >
                  + Create new category
                </button>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                value={form.image_url}
                onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Available</label>
              <button
                type="button"
                role="switch"
                aria-checked={form.available}
                onClick={() => setForm((p) => ({ ...p, available: !p.available }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  form.available ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    form.available ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <DialogFooter showCloseButton>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : dialogMode === "add" ? "Add Item" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
