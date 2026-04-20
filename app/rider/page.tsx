"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/Rider/Cards/StatsCard";
import { Bike, Package, DollarSign } from "lucide-react";

export default function RiderDashboard() {
  const [active, setActive] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [earnings, setEarnings] = useState(0);

  const loadData = async () => {
    try {
      const res = await fetch("/api/rider");
      const data = await res.json();

      console.log("API RESPONSE:", data);

      // ✅ MUST be array
      if (!Array.isArray(data)) {
        console.error("Invalid API response:", data);
        return;
      }

      const activeCount = data.filter((d: any) => d.status !== "completed").length;
      const completedCount = data.filter((d: any) => d.status === "completed").length;

      const totalEarnings = data.reduce(
        (sum: number, d: any) => sum + (d.total_amount || 0),
        0
      );

      setActive(activeCount);
      setCompleted(completedCount);
      setEarnings(totalEarnings);

    } catch (err) {
      console.error("Frontend error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8">

      <div>
        <h2 className="text-2xl font-bold">Rider Dashboard</h2>
        <p className="text-gray-500">Live overview of your orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <StatsCard
          title="Active Deliveries"
          value={active}
          icon={<Bike size={28} />}
          color="orange"
        />

        <StatsCard
          title="Completed Today"
          value={completed}
          icon={<Package size={28} />}
          color="blue"
        />

        <StatsCard
          title="Today's Earnings"
          value={`$${earnings}`}
          icon={<DollarSign size={28} />}
          color="green"
        />

      </div>
    </div>
  );
}