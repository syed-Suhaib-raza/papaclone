"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Cusdashboard/Navbar";
import Sidebar from "@/components/Cusdashboard/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supaBaseClient";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let subscription: any;

    const fetchOrders = async (token: string) => {
      try {
        const res = await fetch("/api/customer/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!isMounted) return;

        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error("API Error:", data);
          setOrders([]);
        }
      } catch (err) {
        console.error(err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        fetchOrders(session.access_token);
      } else {
        const res = supabase.auth.onAuthStateChange((_, session) => {
          if (session?.access_token) {
            fetchOrders(session.access_token);
          }
        });

        subscription = res.data.subscription;
      }
    };

    init();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // CURRENT ORDERS
  const currentOrders = orders.filter((o) =>
    ["pending", "confirmed", "preparing", "ready", "picked_up"].includes(o.status)
  );

  // PAST ORDERS
  const pastOrders = orders.filter((o) =>
    ["delivered", "cancelled"].includes(o.status)
  );

  // STATUS COLORS (UNCHANGED LOGIC)
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      case "confirmed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "preparing":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/30";
      case "ready":
        return "bg-purple-500/10 text-purple-500 border-purple-500/30";
      case "picked_up":
        return "bg-orange-500/10 text-orange-500 border-orange-500/30";
      case "delivered":
        return "bg-green-500/10 text-green-500 border-green-500/30";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/30";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/30";
    }
  };

  const renderOrders = (ordersList: any[], emptyMessage: string) => {
    if (loading) {
      return <p className="text-gray-500 dark:text-gray-400">Loading orders...</p>;
    }

    if (ordersList.length === 0) {
      return (
        <div className="bg-card border border-border p-6 rounded-xl text-muted-foreground">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="grid gap-5">
        {ordersList.map((order) => (
          <Card
            key={order.id}
            className="bg-card border border-border hover:border-primary/40 transition"
          >
            <CardContent className="p-5 space-y-4">

              {/* HEADER */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    {order.restaurants?.name || "Restaurant"}
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    Order ID: {order.id.slice(0, 8)}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 text-xs rounded-full border ${getStatusStyle(order.status)}`}
                >
                  {order.status.replaceAll("_", " ")}
                </span>
              </div>

              {/* ITEMS */}
              <div className="bg-muted rounded-lg p-3 border border-border">
                <p className="text-sm text-muted-foreground mb-2">Items</p>

                {(order.order_items || []).map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm"
                  >
                    <span>{item.menu_items?.name} × {item.quantity}</span>
                    <span>PKR {item.price_at_order?.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* TOTAL */}
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground text-sm">Total Amount</span>
                <span className="text-green-500 font-semibold">
                  PKR {order.total_amount?.toLocaleString()}
                </span>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />

      <div className="flex-1 ml-64">
        <Navbar />

        <div className="p-6 space-y-10">

          {/* TITLE */}
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground text-sm">
              View your orders
            </p>
          </div>

          {/* CURRENT */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-yellow-500">
              Current Orders
            </h2>
            {renderOrders(currentOrders, "No current orders found")}
          </div>

          {/* PAST */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-green-500">
              Past Orders
            </h2>
            {renderOrders(pastOrders, "No past orders found")}
          </div>

        </div>
      </div>
    </div>
  );
}