"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Home, Store, Package, MapPin, User, LogOut } from "lucide-react"
import { supabase } from "@/lib/supaBaseClient"

export default function Sidebar() {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col p-4 fixed left-0 top-0 z-40">
      
      <Link href="/customer" className="flex items-center gap-3 mb-8">
      <h2 className="text-xl font-bold mb-8 gradient-text">
        SmartFood
      </h2>
      </Link>
      <nav className="flex flex-col gap-2 flex-1">

        <Link href="/customer/orders" className="flex items-center gap-3 p-3 rounded-lg card-hover">
          <Package size={18}/>
          Orders
        </Link>

        <Link href="/customer/tracking" className="flex items-center gap-3 p-3 rounded-lg card-hover">
          <MapPin size={18}/>
          Track Order
        </Link>

        <Link href="/customer/profile" className="flex items-center gap-3 p-3 rounded-lg card-hover">
          <User size={18}/>
          Profile
        </Link>

      </nav>

      <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-lg hover:bg-destructive/20 text-destructive">
        <LogOut size={18}/>
        Logout
      </button>

    </aside>
  )
}