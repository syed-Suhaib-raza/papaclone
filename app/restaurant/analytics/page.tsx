"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Resdashboard/Navbar";
import Sidebar from "@/components/Resdashboard/Sidebar";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>({});
  const [filter, setFilter] = useState("monthly");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/restaurant/analytics")
      .then((res) => res.json())
      .then(setData);
  }, []);

  const orders = data.orders || [];
  const reviews = data.reviews || [];
  const now = new Date();

  // ---------------- FILTER ORDERS ----------------
  const filteredOrders = orders.filter((o: any) => {
    const d = new Date(o.created_at);

    if (filter === "weekly") {
      const diffWeeks =
        (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 7);
      return diffWeeks < 12;
    }

    if (filter === "monthly") {
      const diffMonths =
        (now.getFullYear() - d.getFullYear()) * 12 +
        (now.getMonth() - d.getMonth());
      return diffMonths < 12;
    }

    if (filter === "yearly") {
      return now.getFullYear() - d.getFullYear() < 12;
    }

    return true;
  });

  // ---------------- KEY GENERATION ----------------
  const getKey = (d: Date) => {
    if (filter === "monthly") {
      return d.toLocaleString("default", { month: "short", year: "2-digit" });
    }
    if (filter === "weekly") {
      const weekNumber = Math.ceil(d.getDate() / 7);
      return `${d.toLocaleString("default", { month: "short" })} W${weekNumber}-${d.getFullYear()}`;
    }
    if (filter === "yearly") {
      return d.getFullYear().toString();
    }
    return "";
  };

  const selectedOrders = selectedKey
    ? filteredOrders.filter((o: any) => {
      const d = new Date(o.created_at);
      return getKey(d) === selectedKey;
    })
    : filteredOrders;

  // ---------------- STATS ----------------
  const totalRevenue = selectedOrders.reduce(
    (sum: number, o: any) => sum + o.total_amount,
    0
  );
  const totalOrders = selectedOrders.length;

  // ---------------- BEST DAY ----------------
  const dayRevenue: any = {};
  selectedOrders.forEach((o: any) => {
    const d = new Date(o.created_at).toLocaleDateString();
    if (!dayRevenue[d]) dayRevenue[d] = 0;
    dayRevenue[d] += o.total_amount;
  });
  const bestDay =
    Object.entries(dayRevenue).sort((a: any, b: any) => b[1] - a[1])[0];

  // ---------------- PEAK HOUR ----------------
  const hourData: any = {};
  selectedOrders.forEach((o: any) => {
    const h = new Date(o.created_at).getHours();
    if (!hourData[h]) hourData[h] = 0;
    hourData[h]++;
  });
  const peakHour =
    Object.entries(hourData).sort((a: any, b: any) => b[1] - a[1])[0];

  // ---------------- GRAPH DATA ----------------
  let graphData: any[] = [];
  if (filter === "monthly") {
    const months: any[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = getKey(d);
      months.push({ date: key, revenue: 0, orders: 0 });
    }
    filteredOrders.forEach((o: any) => {
      const d = new Date(o.created_at);
      const key = getKey(d);
      const found = months.find((m) => m.date === key);
      if (found) {
        found.revenue += o.total_amount;
        found.orders += 1;
      }
    });
    graphData = months;
  }
  if (filter === "weekly") {
    const weeks: any[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      const key = getKey(d);
      weeks.push({ date: key, revenue: 0, orders: 0 });
    }
    filteredOrders.forEach((o: any) => {
      const d = new Date(o.created_at);
      const key = getKey(d);
      const found = weeks.find((w) => w.date === key);
      if (found) {
        found.revenue += o.total_amount;
        found.orders += 1;
      }
    });
    graphData = weeks;
  }
  if (filter === "yearly") {
    const years: any[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear() - i, 0, 1);
      const key = getKey(d);
      years.push({ date: key, revenue: 0, orders: 0 });
    }
    filteredOrders.forEach((o: any) => {
      const d = new Date(o.created_at);
      const key = getKey(d);
      const found = years.find((y) => y.date === key);
      if (found) {
        found.revenue += o.total_amount;
        found.orders += 1;
      }
    });
    graphData = years;
  }

  const label =
    filter === "weekly"
      ? "Last 12 Weeks"
      : filter === "monthly"
        ? "Last 12 Months"
        : "Last 12 Years";

  // ---------------- RATINGS AGGREGATION ----------------
  const ratingMap: Record<string, { sum: number; count: number }> = {};
  reviews.forEach((r: any) => {
    const date = new Date(r.created_at).toLocaleDateString();
    if (!ratingMap[date]) ratingMap[date] = { sum: 0, count: 0 };
    ratingMap[date].sum += r.rating;
    ratingMap[date].count += 1;
  });

  const ratingData = Object.entries(ratingMap).map(([date, { sum, count }]) => ({
    date,
    rating: parseFloat((sum / count).toFixed(2)),
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        reviews.length).toFixed(1)
      : "N/A";
  // ---------------- ALL TIME STATS ----------------
  const allOrders = data.orders || [];
  const allItems = data.items || [];

  // Average Order Amount
  const avgOrderAmount =
    allOrders.length > 0
      ? (
        allOrders.reduce((sum: number, o: any) => sum + o.total_amount, 0) /
        allOrders.length
      ).toFixed(2)
      : "N/A";

  // Average Products Per Order
  const orderItemCount: Record<string, number> = {};

  allItems.forEach((item: any) => {
    if (!orderItemCount[item.order_id]) {
      orderItemCount[item.order_id] = 0;
    }
    orderItemCount[item.order_id] += item.quantity;
  });

  const avgProductsPerOrder =
    Object.keys(orderItemCount).length > 0
      ? (
        Object.values(orderItemCount).reduce((a: number, b: number) => a + b, 0) /
        Object.keys(orderItemCount).length
      ).toFixed(2)
      : "N/A";
  // ---------------- TOP PICKS ----------------
  const itemsData = data.items || [];

  const itemCount: Record<string, number> = {};

  itemsData.forEach((item: any) => {
    const name = item.menu_items?.name || "Unknown";

    if (!itemCount[name]) {
      itemCount[name] = 0;
    }

    itemCount[name] += item.quantity;
  });

  const topItems = Object.entries(itemCount)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a: any, b: any) => b.quantity - a.quantity)
    .slice(0, 3);
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-4 space-y-6">
          {/* TOGGLE */}
          <div className="flex gap-2">
            {["weekly", "monthly", "yearly"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setFilter(t);
                  setSelectedKey(null);
                }}
                className={`px-3 py-1 rounded-md text-sm border ${filter === t
                  ? "bg-pink-600 text-white border-pink-600"
                  : "border-gray-400 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          <h2 className="text-md font-semibold">{label}</h2>

          {selectedKey && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing data for: <span className="font-semibold">{selectedKey}</span>
            </p>
          )}

          {/* FIRST SECTION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow">
              <p className="text-sm">Revenue</p>
              <h2 className="text-xl text-pink-500">Rs {totalRevenue}</h2>
            </div>

            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow">
              <p className="text-sm">Orders</p>
              <h2 className="text-xl">{totalOrders}</h2>
            </div>
          

            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow">
              <p className="text-sm">Best Day</p>
              <h2 className="text-base">{bestDay ? bestDay[0] : "N/A"}</h2>
            </div>

            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow">
              <p className="text-sm">Peak Hour</p>
              <h2 className="text-base">{peakHour ? `${peakHour[0]}:00` : "N/A"}</h2>
            </div>
          </div>

          {/* GRAPHS */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow">
              <h3 className="text-sm font-medium mb-1">Revenue</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={graphData}
                  onClick={(e: any) => {
                    if (e?.activeLabel) {
                      setSelectedKey((prev) =>
                        prev === e.activeLabel ? null : e.activeLabel
                      );
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Line dataKey="revenue" stroke="#ff4d6d" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow">
              <h3 className="text-sm font-medium mb-1">Orders</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={graphData}
                  onClick={(e: any) => {
                    if (e?.activeLabel) {
                      setSelectedKey((prev) =>
                        prev === e.activeLabel ? null : e.activeLabel
                      );
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#4ade80" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RATINGS SECTION */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow space-y-3">
            <h2 className="text-md font-semibold">Ratings</h2>
            <p className="text-sm">
              Current Rating:{" "}
              <span className="font-semibold text-yellow-500">{averageRating} ⭐</span>
            </p>

            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={10} />
                <YAxis domain={[0, 5]} fontSize={10} />
                <Tooltip />
                <Line dataKey="rating" stroke="#facc15" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* ALL TIME STATS */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow space-y-3">
            <h2 className="text-md font-semibold">All-Time Stats</h2>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm">Average Order Amount</p>
                <h2 className="text-lg font-semibold text-pink-500">
                  Rs {avgOrderAmount}
                </h2>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm">Avg Products per Order</p>
                <h2 className="text-lg font-semibold text-green-500">
                  {avgProductsPerOrder}
                </h2>
              </div>
            </div>
          </div>

          {/* TOP PICKS */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
            <h2 className="text-md font-semibold mb-3">Top Picks</h2>

            <div className="grid grid-cols-3 gap-3">
              {topItems.map((item: any, index: number) => (
                <div
                  key={index}
                  className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-center"
                >
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-lg font-semibold text-green-500">
                    {item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}