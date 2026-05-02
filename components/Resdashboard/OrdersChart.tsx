"use client"

import {
  LineChart,
  Line,
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
      <p>Orders: <span className="font-semibold">{payload[0]?.value}</span></p>
    </div>
  )
}

export default function OrdersChart({ data }: { data: ChartPoint[] }) {
  const { border, mutedForeground, cardBg, foreground, primary } = useChartTheme()

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4">Orders Today</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={border} />

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
            cursor={{ stroke: border }}
          />

          <Line
            type="monotone"
            dataKey="orders"
            stroke={primary}
            strokeWidth={2.5}
            dot={{ fill: primary, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: primary, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
