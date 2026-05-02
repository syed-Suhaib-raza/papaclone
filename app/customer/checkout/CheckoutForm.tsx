"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { useCart } from "@/lib/cartContext"
import { ArrowLeft, MapPin } from "lucide-react"
import Sidebar from "@/components/Cusdashboard/Sidebar"
import Navbar from "@/components/Cusdashboard/Navbar"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ── Inner payment form (must be inside <Elements>) ──────────────
function PaymentForm({
  accessToken,
  userId,
  street,
  city,
  onSuccess,
}: {
  accessToken: string
  userId: string
  street: string
  city: string
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const { cart, clearCart } = useCart()
  const [processing, setProcessing] = useState(false)
  const [elementReady, setElementReady] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements || !cart) return

    setProcessing(true)
    setErrorMsg(null)

    // Store pending order data so the success page can create the DB record
    localStorage.setItem(
      "smartfood_pending_order",
      JSON.stringify({ cart, street, city, userId })
    )

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/customer/checkout/success`,
      },
    })

    // Only reached if confirmPayment fails (redirect didn't happen)
    if (error) {
      setErrorMsg(error.message ?? "Payment failed. Please try again.")
      localStorage.removeItem("smartfood_pending_order")
    }

    setProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Payment Details</h3>
        <PaymentElement onReady={() => setElementReady(true)} />
      </div>

      {errorMsg && (
        <p className="text-sm text-destructive">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || !elementReady || processing}
        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-60"
      >
        {!elementReady ? "Loading…" : processing ? "Processing…" : `Pay PKR ${cart?.items.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}`}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Sandbox mode — use card <span className="font-mono">4242 4242 4242 4242</span>, any future date, any CVC.
      </p>
    </form>
  )
}

// ── Outer checkout form (fetches clientSecret, renders Elements) ─
export default function CheckoutForm({ accessToken, userId }: { accessToken: string; userId: string }) {
  const router = useRouter()
  const { cart } = useCart()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [addressReady, setAddressReady] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const subtotal = cart?.items.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      router.replace("/customer")
      return
    }

    fetch("/api/customer/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ amount: subtotal }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setClientSecret(d.clientSecret)
      })
      .catch((e) => setFetchError(e.message))
  }, [])

  if (!cart || cart.items.length === 0) return null

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />

        <div className="max-w-3xl mx-auto p-6 space-y-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <h1 className="text-2xl font-bold">Checkout</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left — order summary + address */}
            <div className="space-y-5">
              {/* Order summary */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-semibold">Order Summary</h3>
                <p className="text-xs text-muted-foreground">From <span className="font-medium text-foreground">{cart.restaurantName}</span></p>

                <div className="space-y-2">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">PKR {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-3 flex justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span>PKR {subtotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery address */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin size={15} className="text-primary" />
                  Delivery Address
                </div>

                <div className="space-y-2">
                  <input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Street address"
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {!addressReady && (
                  <button
                    onClick={() => {
                      if (street.trim() && city.trim()) setAddressReady(true)
                    }}
                    disabled={!street.trim() || !city.trim()}
                    className="w-full bg-muted text-foreground py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition disabled:opacity-50"
                  >
                    Confirm Address
                  </button>
                )}
                {addressReady && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Address confirmed</p>
                    <button onClick={() => setAddressReady(false)} className="text-xs text-muted-foreground hover:underline">Edit</button>
                  </div>
                )}
              </div>
            </div>

            {/* Right — Stripe payment */}
            <div>
              {fetchError && (
                <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-xl p-4 text-sm">
                  {fetchError}
                </div>
              )}

              {!addressReady && !fetchError && (
                <div className="bg-card border border-border rounded-xl p-5 text-sm text-muted-foreground">
                  Please confirm your delivery address to proceed with payment.
                </div>
              )}

              {addressReady && clientSecret && (
                <Elements
                  key={isDark ? "dark" : "light"}
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: isDark ? "night" : "stripe",
                      variables: isDark ? {
                        colorBackground: "#1c1c1e",
                        colorSurface: "#2c2c2e",
                        borderRadius: "8px",
                      } : {
                        borderRadius: "8px",
                      },
                    },
                  }}
                >
                  <PaymentForm
                    accessToken={accessToken}
                    userId={userId}
                    street={street}
                    city={city}
                    onSuccess={() => {}}
                  />
                </Elements>
              )}

              {addressReady && !clientSecret && !fetchError && (
                <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                  <div className="h-10 bg-muted rounded animate-pulse" />
                  <div className="h-10 bg-muted rounded animate-pulse" />
                  <div className="h-10 bg-muted rounded animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
