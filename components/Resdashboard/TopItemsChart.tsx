"use client"

import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts"

const data = [
  { name: "Burger", value: 120 },
  { name: "Pizza", value: 95 },
  { name: "Fries", value: 75 },
  { name: "Pasta", value: 40 }
]

const COLORS = [
  "#f97316",
  "#ef4444",
  "#22c55e",
  "#3b82f6"
]

export default function TopItemsChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-4">

      <h2 className="text-lg font-semibold mb-4">
        Top Selling Items
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />

        </PieChart>
      </ResponsiveContainer>

    </div>
  )
}