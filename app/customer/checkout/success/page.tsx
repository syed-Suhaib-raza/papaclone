"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supaBaseClient"
import { Cart } from "@/lib/cartContext"

type PendingOrder = {
  cart: Cart
  addressId: string
  userId: string
}

type Status = "loading" | "success" | "error"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<Status>("loading")
  const [orderId, setOrderId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const paymentIntentStatus = searchParams.get("redirect_status")
    if (paymentIntentStatus !== "succeeded") {
      setErrorMsg("Payment was not completed. Please try again.")
      setStatus("error")
      return
    }

    const raw = localStorage.getItem("smartfood_pending_order")
    if (!raw) {
      setErrorMsg("Order data not found.")
      setStatus("error")
      return
    }

    const pending: PendingOrder = JSON.parse(raw)
    createOrder(pending)
  }, [])

  async function createOrder(pending: PendingOrder) {
    try {
      const { cart, addressId, userId } = pending

      // 1. Create order using existing address from profile
      const total = cart.items.reduce((s, i) => s + i.price * i.quantity, 0)

      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          customer_id: userId,
          restaurant_id: cart.restaurantId,
          delivery_address_id: addressId,
          total_amount: total,
          status: "pending",
        })
        .select("id")
        .single()

      if (orderErr || !order) throw new Error("Failed to create order")

      // 2. Create order items
      const orderItems = cart.items.map((item) => ({
        order_id: order.id,
        item_id: item.id,
        quantity: item.quantity,
        price_at_order: item.price,
      }))

      const { error: itemsErr } = await supabase.from("order_items").insert(orderItems)
      if (itemsErr) throw new Error("Failed to save order items")

      // 3. Clean up
      localStorage.removeItem("smartfood_pending_order")

      setOrderId(order.id)
      setStatus("success")
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong")
      setStatus("error")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-8 text-center space-y-5">
        {status === "loading" && (
          <>
            <Loader2 size={40} className="animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground text-sm">Confirming your order…</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle size={48} className="mx-auto text-green-500" />
            <h1 className="text-2xl font-bold">Order Placed!</h1>
            <p className="text-muted-foreground text-sm">
              Your order has been confirmed and is being prepared.
            </p>
            {orderId && (
              <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1.5 rounded-lg">
                Order ID: {orderId}
              </p>
            )}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => router.push("/customer/orders")}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition"
              >
                Track My Order
              </button>
              <button
                onClick={() => router.push("/customer")}
                className="w-full bg-muted text-foreground py-2.5 rounded-xl text-sm font-medium hover:bg-muted/80 transition"
              >
                Back to Restaurants
              </button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <span className="text-destructive text-2xl">✕</span>
            </div>
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
            <button
              onClick={() => router.push("/customer/checkout")}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  )
}
