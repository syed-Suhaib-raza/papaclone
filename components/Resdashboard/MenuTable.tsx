import { Button } from "@/components/ui/button"

export default function MenuTable() {

  const items = [
    { name: "Zinger Burger", price: 550, category: "Fast Food" },
    { name: "Chicken Pizza", price: 850, category: "Italian" },
    { name: "Fries", price: 250, category: "Snacks" },
  ]

  return (
    <div className="bg-card border border-border rounded-xl p-4">

      <h2 className="text-lg font-semibold mb-4">Menu Items</h2>

      <table className="w-full text-sm">

        <thead className="text-muted-foreground">
          <tr>
            <th className="text-left py-2">Item</th>
            <th>Category</th>
            <th>Price</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-t border-border">

              <td className="py-3">{item.name}</td>
              <td>{item.category}</td>
              <td>PKR {item.price}</td>

              <td className="flex gap-2">
                <Button size="sm" variant="outline">Edit</Button>
                <Button size="sm" variant="destructive">Delete</Button>
              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  )
}