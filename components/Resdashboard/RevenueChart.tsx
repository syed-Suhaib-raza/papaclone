"use client"

import {
  BarChart,
  Bar,
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

type RevenueChartProps = {
  data: ChartPoint[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">

      <h2 className="text-lg font-semibold mb-4">
        Revenue Today
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="time" />
          <YAxis />

          <Tooltip />

          <Bar
            dataKey="revenue"
            fill="hsl(var(--primary))"
            radius={[6,6,0,0]}
          />

        </BarChart>
      </ResponsiveContainer>

    </div>
  )
}