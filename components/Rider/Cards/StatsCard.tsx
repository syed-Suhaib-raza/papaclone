"use client";

import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  color?: "orange" | "blue" | "green" | "purple";
  description?: string;
}

const colorMap = {
  orange: {
    bg: "bg-chart-1/10",
    text: "text-chart-1",
  },
  blue: {
    bg: "bg-chart-2/10",
    text: "text-chart-2",
  },
  green: {
    bg: "bg-green-500/10",
    text: "text-green-600",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-600",
  },
};

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  color = "orange",
  description,
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <div className="bg-card border border-border rounded-2xl p-6 card-hover group">
      <div className="flex items-start justify-between mb-4">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
          {icon}
        </div>

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="text-green-600 font-bold">↑</span>
            <span className="text-xs font-semibold text-green-600">
              {trend}%
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <p className="text-sm font-medium text-muted-foreground mb-1">
        {title}
      </p>
      <p className="text-3xl font-black text-foreground">
        {value}
      </p>
      {description && (
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
}