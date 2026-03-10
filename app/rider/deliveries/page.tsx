"use client";

import DashboardLayout from "@/components/Rider/DashboardLayout";
import { useState } from "react";

export default function DeliveriesPage() {
  const [filter, setFilter] = useState("all");

  const filterTabs = [
    { id: "all", label: "All Deliveries", icon: "📦" },
    { id: "pending", label: "Pending", icon: "⏳" },
    { id: "active", label: "Active", icon: "🚴" },
    { id: "completed", label: "Completed", icon: "✅" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8 h1">
        <h1 className="text-4xl font-black text-foreground mb-2">
          All Deliveries
        </h1>
        <p className="text-muted-foreground">
          View and manage all your deliveries
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-8 flex gap-3 overflow-x-auto pb-2 h2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              filter === tab.id
                ? "bg-gradient-to-r from-primary to-chart-2 text-white shadow-lg glow-btn"
                : "bg-card border border-border text-foreground hover:border-primary"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Coming Soon */}
      <div className="bg-card border-2 border-dashed border-border rounded-2xl p-12 text-center card-hover h3">
        <div className="text-6xl mb-4 float-a">🚀</div>
        <h3 className="text-2xl font-black text-foreground mb-2">
          Coming Soon
        </h3>
        <p className="text-muted-foreground">
          Advanced filtering features are on the way!
        </p>
      </div>
    </DashboardLayout>
  );
}