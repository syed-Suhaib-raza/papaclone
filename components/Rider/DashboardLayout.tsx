"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background theme-transition">
      <Sidebar />
      <Navbar />
      <main className="ml-64 mt-16 p-8 min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
}