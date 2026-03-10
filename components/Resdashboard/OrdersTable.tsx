import { Button } from "@/components/ui/button"

export default function OrdersTable() {

  const orders = [
    { id: "#1021", customer: "Ali", items: "2 Burgers", total: "1200", status: "New" },
    { id: "#1022", customer: "Sara", items: "Pizza", total: "850", status: "Preparing" },
    { id: "#1023", customer: "Ahmed", items: "Pasta", total: "950", status: "Ready" },
  ]

  return (
    <div className="bg-card border border-border rounded-xl p-4">

      <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>

      <table className="w-full text-sm">

        <thead className="text-muted-foreground">
          <tr>
            <th className="text-left py-2">Order</th>
            <th className="text-left">Customer</th>
            <th className="text-left">Items</th>
            <th>Total</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-border">

              <td className="py-3">{o.id}</td>
              <td>{o.customer}</td>
              <td>{o.items}</td>
              <td>PKR {o.total}</td>
              <td>{o.status}</td>

              <td>
                <Button size="sm">View</Button>
              </td>

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  )
}