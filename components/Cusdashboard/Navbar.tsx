"use client"

import { ShoppingCart, Bell, Search } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"
import { useCart } from "@/lib/cartContext"

interface NavbarProps {
  searchQuery?: string
  onSearchChange?: (value: string) => void
}

export default function Navbar({ searchQuery = "", onSearchChange }: NavbarProps) {
  const { cartCount, setCartOpen } = useCart()

  return (
    <header className="w-full h-16 border-b border-border flex items-center justify-between px-6 bg-background">

      {/* Search */}
      <div className="flex items-center gap-3">
        <Search size={18} className="text-muted-foreground" />

        <input
          placeholder="Search restaurants or food..."
          className="bg-muted text-sm px-4 py-1.5 rounded-md outline-none focus:ring-2 ring-primary/40 transition"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">

        {/* Notifications */}
        <button className="relative text-muted-foreground hover:text-foreground transition">
          <Bell size={20}/>
          <span className="badge-ping absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        {/* Cart */}
        <button onClick={() => setCartOpen(true)} className="relative text-muted-foreground hover:text-foreground transition">
          <ShoppingCart size={20}/>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
          U
        </div>

      </div>

    </header>
  )
}