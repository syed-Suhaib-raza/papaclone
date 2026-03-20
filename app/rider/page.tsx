"use client";

import StatsCard from "@/components/Rider/Cards/StatsCard";
import { Bike, Package, DollarSign } from "lucide-react";

export default function RiderDashboard() {
  return (
    <div className="space-y-8">

      {/* Overview Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Overview of today's activity
        </h2>
        <p className="text-muted-foreground">
          Track your deliveries and earnings for today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <StatsCard
          title="Active Deliveries"
          value=""
          icon={<Bike size={28} />}
          color="orange"
        />

        <StatsCard
          title="Completed Today"
          value=""
          icon={<Package size={28} />}
          color="blue"
        />

        <StatsCard
          title="Today's Earnings"
          value=""
          icon={<DollarSign size={28} />}
          color="green"
        />

      </div>

    </div>
  );
}