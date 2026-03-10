import type { Metadata } from "next";
import Sidebar from "@/components/Rider/Sidebar";
import ThemeToggle from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Rider Dashboard | Smart Food",
  description: "Manage deliveries, earnings, and profile",
};

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">

        {/* Top Navbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
          <h1 className="text-xl font-semibold">Rider Dashboard</h1>

          {/* Theme Toggle */}
          <ThemeToggle />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>

      </div>

    </div>
  );
}