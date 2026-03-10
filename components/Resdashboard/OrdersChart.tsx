"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"

type ChartPoint = {
  time: string
  orders: number
  revenue: number
}

type OrdersChartProps = {
  data: ChartPoint[]
}

export default function OrdersChart({ data }: OrdersChartProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">

      <h2 className="text-lg font-semibold mb-4">
        Orders Today
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="time" />
          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="orders"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
          />

        </LineChart>
      </ResponsiveContainer>

    </div>
  )
}