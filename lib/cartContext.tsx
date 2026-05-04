"use client"

import { createContext, useContext, useEffect, useState } from "react"

export type CartItem = {
  id: string
  name: string
  price: number
  image_url: string | null
  quantity: number
}

export type Cart = {
  restaurantId: string
  restaurantName: string
  items: CartItem[]
}

type CartContext = {
  cart: Cart | null
  cartCount: number
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  addToCart: (restaurantId: string, restaurantName: string, item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContext | null>(null)

const STORAGE_KEY = "smartfood_cart"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setCart(JSON.parse(stored))
    } catch {}
  }, [])

  function addToCart(restaurantId: string, restaurantName: string, item: Omit<CartItem, "quantity">, quantity = 1) {
    setCart((prev) => {
      let base: Cart

      if (!prev || prev.restaurantId !== restaurantId) {
        base = { restaurantId, restaurantName, items: [] }
      } else {
        base = { ...prev, items: [...prev.items] }
      }

      const existing = base.items.find((i) => i.id === item.id)
      if (existing) {
        base.items = base.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        )
      } else {
        base.items = [...base.items, { ...item, quantity }]
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(base))
      return base
    })
  }

  function removeFromCart(itemId: string) {
    setCart((prev) => {
      if (!prev) return null
      const items = prev.items.filter((i) => i.id !== itemId)
      const next = items.length === 0 ? null : { ...prev, items }
      if (next) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
      return next
    })
  }

  function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) { removeFromCart(itemId); return }
    setCart((prev) => {
      if (!prev) return null
      const next = {
        ...prev,
        items: prev.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function clearCart() {
    localStorage.removeItem(STORAGE_KEY)
    setCart(null)
  }

  const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0

  return (
    <CartContext.Provider value={{ cart, cartCount, cartOpen, setCartOpen, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}
