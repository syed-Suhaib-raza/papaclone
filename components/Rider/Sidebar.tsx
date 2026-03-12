"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  TrendingUp,
  User,
  MessageSquare,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/rider/deliveries", label: "Deliveries", icon: Package },
  { href: "/rider/earnings", label: "Earnings", icon: TrendingUp },
  { href: "/rider/profile", label: "Profile", icon: User },
  { href: "/rider/support", label: "Support", icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen fixed left-0 top-0 overflow-y-auto theme-transition flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border sticky top-0 bg-sidebar">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl float-a">🍔</span>

          <div>
            <h1 className="text-lg font-black tracking-tight gradient-text">
              Smart Food
            </h1>

            <p className="text-xs text-sidebar-foreground/60">
              Rider
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-all group">
          <LogOut size={20} className="group-hover:float-a" />
          <span className="font-medium">Logout</span>
        </button>
      </div>

    </aside>
  );
}