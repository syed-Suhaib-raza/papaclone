"use client"

import { Bell, Search, Store } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"

export default function RestaurantNavbar() {

  return (
    <header className="w-full h-16 border-b border-border flex items-center justify-between px-6 bg-background">

      <div className="flex items-center gap-3">
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">

        {/* Restaurant Status */}
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Store size={18}/>
          <span className="text-green-500">Open</span>
        </div>

        {/* Notifications */}
        <button className="relative text-muted-foreground hover:text-foreground transition">
          <Bell size={20}/>
          <span className="badge-ping absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
          R
        </div>

      </div>

    </header>
  )
}