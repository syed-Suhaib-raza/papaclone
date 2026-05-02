"use client"

import { useRouter } from "next/navigation"
import { X, Plus, Minus, Trash2, ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cartContext"

export default function CartSidebar() {
  const router = useRouter()
  const { cart, cartOpen, setCartOpen, updateQuantity, removeFromCart } = useCart()

  const subtotal = cart?.items.reduce((sum, i) => sum + i.price * i.quantity, 0) ?? 0

  function handleCheckout() {
    setCartOpen(false)
    router.push("/customer/checkout")
  }

  return (
    <>
      {/* Backdrop */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-background border-l border-border z-50 flex flex-col shadow-xl transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-lg">Your Cart</h2>
          <button
            onClick={() => setCartOpen(false)}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {!cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <ShoppingCart size={40} className="opacity-30" />
              <p className="text-sm">Your cart is empty</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">From <span className="font-medium text-foreground">{cart.restaurantName}</span></p>

              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3 items-start">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-muted shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      PKR {item.price.toLocaleString()}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-md bg-muted hover:bg-muted/80 flex items-center justify-center transition"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-md bg-muted hover:bg-muted/80 flex items-center justify-center transition"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-sm font-semibold">
                      PKR {(item.price * item.quantity).toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-destructive transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="px-5 py-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">PKR {subtotal.toLocaleString()}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}
