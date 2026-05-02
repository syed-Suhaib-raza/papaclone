"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ClipboardList,
  UtensilsCrossed,
  BarChart3,
  Settings,
  LogOut
} from "lucide-react"
import { supabase } from "@/lib/supaBaseClient"

export default function RestaurantSidebar() {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col p-4 fixed left-0 top-0 z-40">

      {/* Logo */}
      <Link href="/restaurant" className="flex items-center gap-3 mb-8">
        <h2 className="text-xl font-bold gradient-text">
          SmartFood
        </h2>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">

        <Link
          href="/restaurant/orders"
          className="flex items-center gap-3 p-3 rounded-lg card-hover"
        >
          <ClipboardList size={18} />
          Orders
        </Link>

        <Link
          href="/restaurant/menu"
          className="flex items-center gap-3 p-3 rounded-lg card-hover"
        >
          <UtensilsCrossed size={18} />
          Menu
        </Link>

        <Link
          href="/restaurant/analytics"
          className="flex items-center gap-3 p-3 rounded-lg card-hover"
        >
          <BarChart3 size={18} />
          Analytics
        </Link>

        <Link
          href="/restaurant/settings"
          className="flex items-center gap-3 p-3 rounded-lg card-hover"
        >
          <Settings size={18} />
          Settings
        </Link>

      </nav>

      {/* Logout */}
      <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-lg hover:bg-destructive/20 text-destructive">
        <LogOut size={18} />
        Logout
      </button>

    </aside>
  )
}