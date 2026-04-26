"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Rider/Navbar";
import Sidebar from "@/components/Rider/Sidebar";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function RiderAnalyticsPage() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("monthly");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/rider/analytics")
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      });
  }, []);

  const deliveries = data.deliveries || [];
  const now = new Date();

  // ---------- DATE ----------
  const getDate = (d: any) =>
    new Date(d.delivery_time || d.pickup_time || new Date());

  // ---------- FILTER ----------
  const filtered = deliveries.filter((d: any) => {
    const date = getDate(d);

    if (filter === "weekly") {
      return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 7) < 12;
    }

    if (filter === "monthly") {
      return (
        (now.getFullYear() - date.getFullYear()) * 12 +
        (now.getMonth() - date.getMonth()) <
        12
      );
    }

    if (filter === "yearly") {
      return now.getFullYear() - date.getFullYear() < 12;
    }

    return true;
  });

  // ---------- KEY ----------
  const getKey = (d: Date) => {
    if (filter === "monthly") {
      return d.toLocaleString("default", { month: "short", year: "2-digit" });
    }
    if (filter === "weekly") {
      const week = Math.ceil(d.getDate() / 7);
      return `${d.toLocaleString("default", { month: "short" })} W${week}`;
    }
    if (filter === "yearly") {
      return d.getFullYear().toString();
    }
    return "";
  };

  const selected = selectedKey
    ? filtered.filter((d: any) => getKey(getDate(d)) === selectedKey)
    : filtered;

  // ---------- STATS ----------
  const totalDeliveries = selected.length;

  const totalRevenue = selected.reduce(
    (sum: number, d: any) => sum + (d.orders?.total_amount || 0),
    0
  );

  // ---------- BEST DAY ----------
  const dayRevenue: any = {};

  selected.forEach((d: any) => {
    const day = getDate(d).toLocaleDateString();

    if (!dayRevenue[day]) dayRevenue[day] = 0;
    dayRevenue[day] += d.orders?.total_amount || 0;
  });

  const bestDay =
    Object.entries(dayRevenue).sort((a: any, b: any) => b[1] - a[1])[0];

  // ---------- PEAK HOUR ----------
  const hourData: any = {};

  selected.forEach((d: any) => {
    const h = getDate(d).getHours();
    hourData[h] = (hourData[h] || 0) + 1;
  });

  const peakHour =
    Object.entries(hourData).sort((a: any, b: any) => b[1] - a[1])[0];

  // ---------- GRAPH DATA (FIXED LIKE RESTAURANT) ----------
  let graphData: any[] = [];

  if (filter === "monthly") {
    const months: any[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = getKey(d);

      months.push({ date: key, revenue: 0, deliveries: 0 });
    }

    filtered.forEach((d: any) => {
      const key = getKey(getDate(d));
      const found = months.find((m) => m.date === key);

      if (found) {
        found.revenue += d.orders?.total_amount || 0;
        found.deliveries += 1;
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
      weeks.push({ date: key, revenue: 0, deliveries: 0 });
    }

    filtered.forEach((d: any) => {
      const key = getKey(getDate(d));
      const found = weeks.find((w) => w.date === key);

      if (found) {
        found.revenue += d.orders?.total_amount || 0;
        found.deliveries += 1;
      }
    });

    graphData = weeks;
  }

  if (filter === "yearly") {
    const years: any[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear() - i, 0, 1);
      const key = getKey(d);

      years.push({ date: key, revenue: 0, deliveries: 0 });
    }

    filtered.forEach((d: any) => {
      const key = getKey(getDate(d));
      const found = years.find((y) => y.date === key);

      if (found) {
        found.revenue += d.orders?.total_amount || 0;
        found.deliveries += 1;
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
  const reviews = data.reviews || [];

  const ratingMap: any = {};

  reviews.forEach((r: any) => {
    const date = new Date(r.created_at).toLocaleDateString();

    if (!ratingMap[date]) ratingMap[date] = { sum: 0, count: 0 };

    ratingMap[date].sum += r.rating;
    ratingMap[date].count += 1;
  });

  const ratingData = Object.entries(ratingMap)
    .map(([date, val]: any) => ({
      date,
      rating: val.sum / val.count,
    }))
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  const averageRating =
    reviews.length > 0
      ? (
        reviews.reduce((s: number, r: any) => s + r.rating, 0) /
        reviews.length
      ).toFixed(1)
      : "N/A";

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }


  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-4 space-y-6">
          {/* FILTER */}
          <div className="flex gap-2">
            {["weekly", "monthly", "yearly"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setFilter(t);
                  setSelectedKey(null);
                }}
                className={`px-3 py-1 rounded-md text-sm border ${filter === t
                  ? "bg-pink-600 text-white"
                  : "border-gray-400"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          <h2 className="font-semibold">{label}</h2>

          {selectedKey && (
            <p className="text-xs text-gray-500">
              Showing data for: {selectedKey}
            </p>
          )}

          {/* CARDS */}
          <div className="grid md:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-gray-900 p-3 rounded shadow">
              <p>Revenue</p>
              <h2 className="text-xl text-pink-500">Rs {totalRevenue}</h2>
            </div>

            <div className="bg-white dark:bg-gray-900 p-3 rounded shadow">
              <p>Deliveries</p>
              <h2 className="text-xl">{totalDeliveries}</h2>
            </div>

            <div className="bg-white dark:bg-gray-900 p-3 rounded shadow">
              <p>Best Day</p>
              <h2>{bestDay ? bestDay[0] : "N/A"}</h2>
            </div>

            <div className="bg-white dark:bg-gray-900 p-3 rounded shadow">
              <p>Peak Hour</p>
              <h2>{peakHour ? `${peakHour[0]}:00` : "N/A"}</h2>
            </div>
          </div>

          {/* GRAPHS */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Revenue */}
            <div className="bg-white dark:bg-gray-900 p-3 rounded shadow">
              <h3 className="text-sm font-medium mb-1">Revenue</h3>

              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={graphData}
                  onClick={(e: any) => {
                    const label =
                      e?.activeLabel || e?.activePayload?.[0]?.payload?.date;

                    if (label) {
                      setSelectedKey((prev) =>
                        prev === label ? null : label
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

            {/* Deliveries */}
            <div className="bg-white dark:bg-gray-900 p-3 rounded shadow">
              <h3 className="text-sm font-medium mb-1">Deliveries</h3>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={graphData}
                  onClick={(e: any) => {
  const label =
    e?.activeLabel || e?.activePayload?.[0]?.payload?.date;

  if (label) {
    setSelectedKey((prev) =>
      prev === label ? null : label
    );
  }
}}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="deliveries" fill="#4ade80" />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
          {/* RATINGS */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow space-y-3">
            <h2 className="text-md font-semibold">Ratings</h2>

            <p className="text-sm">
              Current Rating:{" "}
              <span className="font-semibold text-yellow-500">
                {averageRating} ⭐
              </span>
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
          {/* ALL-TIME STATS */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow space-y-3">
            <h2 className="text-md font-semibold">All-Time Stats</h2>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm">Total Deliveries</p>
                <h2 className="text-lg font-semibold text-green-500">
                  {deliveries.length}
                </h2>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm">Avg Revenue per Delivery</p>
                <h2 className="text-lg font-semibold text-pink-500">
                  Rs{" "}
                  {deliveries.length > 0
                    ? (
                      deliveries.reduce(
                        (sum: number, d: any) =>
                          sum + (d.orders?.total_amount || 0),
                        0
                      ) / deliveries.length
                    ).toFixed(2)
                    : "0.00"}
                </h2>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}