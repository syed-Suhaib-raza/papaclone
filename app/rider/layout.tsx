"use client";

import Sidebar from "@/components/Rider/Sidebar";
import Navbar from "@/components/Rider/Navbar";

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">

      {/* Sidebar */}
      <Sidebar />

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="ml-64 mt-16 p-8">
        {children}
      </main>

    </div>
  );
}