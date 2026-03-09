"use client"

import { ShoppingCart, Bell, Search } from "lucide-react"

export default function Navbar() {
  return (
    <header className="w-full h-16 border-b border-border flex items-center justify-between px-6 bg-background">

      <div className="flex items-center gap-3">
        <Search size={18}/>
        <input
          placeholder="Search restaurants or food..."
          className="bg-muted px-3 py-1 rounded-md outline-none"
        />
      </div>

      <div className="flex items-center gap-6">

        <button className="relative">
          <Bell size={20}/>
          <span className="badge-ping absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        <button className="relative">
          <ShoppingCart size={20}/>
        </button>

        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
          U
        </div>

      </div>

    </header>
  )
}