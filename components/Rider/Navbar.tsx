"use client";

import { Bell, Settings, Moon, Sun } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    const html = document.documentElement;
    if (dark) {
      html.classList.remove("dark");
    } else {
      html.classList.add("dark");
    }
    setDark(!dark);
  };

  return (
    <header className="h-16 bg-card border-b border-border shadow-sm fixed right-0 left-64 top-0 flex items-center justify-between px-8 theme-transition z-40">
      {/* Greeting */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Welcome back! 👋</h2>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative text-foreground hover:text-primary group">
          <Bell size={24} className="group-hover:float-a" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full badge-ping"></span>
        </button>

        {/* Settings */}
        <button className="text-foreground hover:text-primary group">
          <Settings size={24} className="group-hover:float-a" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleDark}
          className="mode-btn bg-card border-sidebar-border"
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-border" />

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-2 rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
            R
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foreground">Rider Name</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </div>
    </header>
  );
}