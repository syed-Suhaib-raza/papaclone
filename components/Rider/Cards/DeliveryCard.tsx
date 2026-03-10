"use client";

import { Delivery } from "@/lib/rider/types";
import { MapPin, Clock, DollarSign, ChevronRight } from "lucide-react";
import { useState } from "react";

interface DeliveryCardProps {
  delivery: Delivery;
  onAccept?: (id: string) => Promise<void>;
  onComplete?: (id: string) => Promise<void>;
}

const statusConfig: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: "bg-yellow-500/10", text: "text-yellow-600", label: "Pending" },
  accepted: { bg: "bg-blue-500/10", text: "text-blue-600", label: "Accepted" },
  picked_up: {
    bg: "bg-purple-500/10",
    text: "text-purple-600",
    label: "Picked Up",
  },
  in_transit: { bg: "bg-chart-1/10", text: "text-chart-1", label: "In Transit" },
  completed: { bg: "bg-green-500/10", text: "text-green-600", label: "Completed" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-600", label: "Cancelled" },
};

export default function DeliveryCard({
  delivery,
  onAccept,
  onComplete,
}: DeliveryCardProps) {
  const [loading, setLoading] = useState(false);
  const status = statusConfig[delivery.status];

  const handleAccept = async () => {
    setLoading(true);
    try {
      await onAccept?.(delivery.id);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await onComplete?.(delivery.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden card-hover group">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-chart-2/10 border-b border-border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              {delivery.restaurantName}
            </h3>
            <p className="text-sm text-muted-foreground">
              Order #{delivery.orderId}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin size={18} className="text-chart-1" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">
                Distance
              </p>
              <p className="text-sm font-bold text-foreground">
                {delivery.distance} km
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock size={18} className="text-chart-2" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">
                Est. Time
              </p>
              <p className="text-sm font-bold text-foreground">
                {delivery.estimatedTime} min
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">
                Earning
              </p>
              <p className="text-sm font-bold text-foreground">
                ${delivery.payAmount}
              </p>
            </div>
          </div>
        </div>

        {/* Locations */}
        <div className="space-y-3 py-4 border-y border-border">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-green-500/20 border-2 border-green-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Pickup
              </p>
              <p className="text-sm text-foreground font-medium">
                {delivery.pickupLocation.address}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-red-500/20 border-2 border-red-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Dropoff
              </p>
              <p className="text-sm text-foreground font-medium">
                {delivery.dropoffLocation.address}
              </p>
            </div>
          </div>
        </div>

        {/* Customer */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Customer
            </p>
            <p className="text-sm font-semibold text-foreground">
              {delivery.customerName}
            </p>
          </div>
          <button className="text-primary text-sm font-semibold flex items-center gap-1 group/phone hover:gap-2">
            📞 Call
            <ChevronRight size={16} className="group-hover/phone:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-muted/30 border-t border-border p-6 flex gap-3">
        {delivery.status === "pending" && (
          <button
            onClick={handleAccept}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:shadow-lg text-white font-bold py-3 rounded-xl transition-all glow-btn disabled:opacity-50"
          >
            {loading ? "Processing..." : "Accept Delivery"}
          </button>
        )}

        {(delivery.status === "accepted" ||
          delivery.status === "picked_up" ||
          delivery.status === "in_transit") && (
          <>
            <button className="px-6 bg-card hover:bg-muted border border-border text-foreground font-bold py-3 rounded-xl transition-all group">
              <span className="group-hover:float-a">📍 Map</span>
            </button>
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-chart-2 hover:shadow-lg text-white font-bold py-3 rounded-xl transition-all glow-btn disabled:opacity-50"
            >
              {loading ? "Processing..." : "Complete"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}