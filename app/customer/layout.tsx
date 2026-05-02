import { CartProvider } from "@/lib/cartContext"
import CartSidebar from "@/components/Cusdashboard/CartSidebar"

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartSidebar />
    </CartProvider>
  )
}
