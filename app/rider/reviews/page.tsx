"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Rider/Navbar";
import Sidebar from "@/components/Rider/Sidebar";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function RiderReviewsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // ✅ always verify real user first
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.log("User not logged in");
          setLoading(false);
          return;
        }

        // ✅ get session safely
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const token = session?.access_token;

        if (!token) {
          console.log("No session token found");
          setLoading(false);
          return;
        }

        // ✅ API call
        const res = await fetch("/api/rider/reviews", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();

        setData(json);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Loading state
  if (loading) {
    return <div className="p-6">Loading data...</div>;
  }

  // ✅ error state
  if (data?.error) {
    return (
      <div className="p-6 text-red-500">
        {data.error}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <div className="p-6 max-w-3xl">
          <h1 className="text-2xl font-bold mb-4">
            Customer Reviews
          </h1>

          {/* ⭐ Average Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="text-yellow-500 text-xl">
              {"★".repeat(Math.round(data?.avg ?? 0))}
            </div>
            <span className="text-lg font-semibold">
              {(data?.avg ?? 0).toFixed(1)} out of 5
            </span>
          </div>

          <p className="text-muted-foreground mb-6">
            {data?.total ?? 0} reviews
          </p>

          {/* ⭐ Breakdown */}
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-3 mb-2">
              <span className="w-16">{star} star</span>

              <div className="flex-1 bg-muted rounded h-3">
                <div
                  className="bg-yellow-500 h-3 rounded"
                  style={{
                    width: `${data?.percentages?.[star] ?? 0}%`,
                  }}
                />
              </div>

              <span className="w-10 text-right">
                {data?.percentages?.[star] ?? 0}%
              </span>
            </div>
          ))}
          {/* 🧾 Reviews List */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">
              Customer Reviews
            </h2>

            {data?.reviews?.length === 0 && (
              <p className="text-muted-foreground">
                No reviews yet
              </p>
            )}

            {data?.reviews?.map((review: any) => (
              <div
                key={review.id}
                className="border-b py-4"
              >
                {/* ⭐ Rating */}
                <div className="text-yellow-500">
                  {"★".repeat(review.rating)}
                </div>

                {/* 👤 Name */}
                <p className="font-medium">
                  {review.users?.name || "Anonymous"}
                </p>

                {/* 💬 Comment */}
                <p className="text-muted-foreground">
                  {review.comment || "No comment"}
                </p>

                {/* 📅 Date */}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}