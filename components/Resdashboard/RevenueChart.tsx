"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { useChartTheme } from "@/lib/useChartTheme"

type ChartPoint = {
  time: string
  orders: number
  revenue: number
}

function CustomTooltip({ active, payload, label, cardBg, foreground, border }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: cardBg, border: `1px solid ${border}`, color: foreground }}
      className="rounded-lg px-3 py-2 text-sm shadow-md">
      <p className="font-medium mb-1">{label}</p>
      <p>Revenue: <span className="font-semibold">PKR {payload[0]?.value?.toLocaleString()}</span></p>
    </div>
  )
}

export default function RevenueChart({ data }: { data: ChartPoint[] }) {
  const { border, mutedForeground, cardBg, foreground, primary } = useChartTheme()

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4">Revenue Today</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barCategoryGap="40%">
          <CartesianGrid strokeDasharray="3 3" stroke={border} vertical={false} />

          <XAxis
            dataKey="time"
            tick={{ fill: mutedForeground, fontSize: 12 }}
            axisLine={{ stroke: border }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: mutedForeground, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            content={<CustomTooltip cardBg={cardBg} foreground={foreground} border={border} />}
            cursor={{ fill: border, opacity: 0.4 }}
          />

          <Bar
            dataKey="revenue"
            fill={primary}
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
