"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/Rider/DashboardLayout";
import StatsCard from "@/components/Rider/Cards/StatsCard";
import DeliveryCard from "@/components/Rider/Cards/DeliveryCard";
import { riderAPI } from "@/lib/rider/api";
import { DashboardStats, Delivery } from "@/lib/rider/types";
import { Package, TrendingUp, DollarSign, Star } from "lucide-react";

export default function RiderDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, deliveriesData] = await Promise.all([
          riderAPI.getDashboardStats(),
          riderAPI.getActiveDeliveries(),
        ]);
        setStats(statsData);
        setDeliveries(deliveriesData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (deliveryId: string) => {
    try {
      await riderAPI.acceptDelivery(deliveryId);
      const updated = await riderAPI.getActiveDeliveries();
      setDeliveries(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept");
    }
  };

  const handleComplete = async (deliveryId: string) => {
    try {
      await riderAPI.completeDelivery(deliveryId);
      const updated = await riderAPI.getActiveDeliveries();
      setDeliveries(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full border-4 border-border border-t-primary spin-cw"></div>
            <p className="mt-4 text-muted-foreground font-semibold">
              Loading dashboard...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 h1">
        <h1 className="text-4xl font-black text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your deliveries and track earnings
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="h1">
            <StatsCard
              title="Active Deliveries"
              value={stats.activeDeliveries}
              icon={<Package size={28} />}
              color="orange"
            />
          </div>
          <div className="h2">
            <StatsCard
              title="Completed Today"
              value={stats.completedToday}
              icon="✅"
              color="blue"
            />
          </div>
          <div className="h3">
            <StatsCard
              title="Today's Earnings"
              value={`$${stats.totalEarningsToday.toFixed(2)}`}
              icon={<DollarSign size={28} />}
              color="green"
              trend={12}
            />
          </div>
          <div className="h4">
            <StatsCard
              title="Rating"
              value={stats.averageRating.toFixed(1)}
              icon={<Star size={28} />}
              color="purple"
            />
          </div>
        </div>
      )}

      {/* Deliveries */}
      <div className="h5">
        <h2 className="text-2xl font-black text-foreground mb-6">
          Active Deliveries
        </h2>

        {deliveries.length === 0 ? (
          <div className="bg-card border-2 border-dashed border-border rounded-2xl p-12 text-center card-hover">
            <div className="text-6xl mb-4 float-a">🎉</div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              All caught up!
            </h3>
            <p className="text-muted-foreground">
              No active deliveries. Great work!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {deliveries.map((delivery, idx) => (
              <div key={delivery.id} style={{ animation: `fadeUp 0.6s ease both`, animationDelay: `${idx * 100}ms` }}>
                <DeliveryCard
                  delivery={delivery}
                  onAccept={handleAccept}
                  onComplete={handleComplete}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}