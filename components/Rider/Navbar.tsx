"use client";

import ThemeToggle from "../theme-toggle";
import { Bell } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-16 bg-card border-b border-border shadow-sm fixed right-0 left-64 top-0 flex items-center justify-between px-8 theme-transition z-40">
      
      {/* Greeting */}
      <div>
        <h2 className="text-lg font-bold text-foreground">
          Welcome back! 👋
        </h2>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">

        {/* Notifications */}
        <button className="relative text-foreground hover:text-primary group">
          <Bell size={22} className="group-hover:float-a" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Divider */}
        <div className="w-px h-8 bg-border" />

        {/* Rider Icon */}
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-chart-2 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
          R
        </div>

      </div>
    </header>
  );
}