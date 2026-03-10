"use client";

import DashboardLayout from "@/components/Rider/DashboardLayout";
import StatsCard from "@/components/Rider/Cards/StatsCard";
import { TrendingUp, DollarSign, Calendar } from "lucide-react";

export default function EarningsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8 h1">
        <h1 className="text-4xl font-black text-foreground mb-2">Earnings</h1>
        <p className="text-muted-foreground">
          Track your income and financial performance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="h2">
          <StatsCard
            title="Total Earnings"
            value="$4,250.50"
            icon={<DollarSign size={28} />}
            color="green"
            trend={25}
          />
        </div>
        <div className="h3">
          <StatsCard
            title="Weekly Average"
            value="$892.60"
            icon={<TrendingUp size={28} />}
            color="blue"
          />
        </div>
        <div className="h4">
          <StatsCard
            title="Total Deliveries"
            value="247"
            icon={<Calendar size={28} />}
            color="orange"
          />
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-card border-2 border-dashed border-border rounded-2xl p-12 text-center card-hover h5">
        <div className="text-6xl mb-4 float-a">📊</div>
        <h3 className="text-2xl font-black text-foreground mb-2">
          Earnings Chart Coming Soon
        </h3>
        <p className="text-muted-foreground">
          Detailed analytics will be available soon!
        </p>
      </div>
    </DashboardLayout>
  );
}