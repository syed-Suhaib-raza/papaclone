import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, DollarSign } from "lucide-react"

type DailyStatsProps = {
  orders: number
  revenue: number
}

export default function DailyStats({ orders, revenue }: DailyStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-6">

      <Card className="card-hover">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-muted-foreground text-sm">
              Today's Orders
            </p>

            <h2 className="text-3xl font-bold">
              {orders}
            </h2>
          </div>

          <ShoppingBag className="text-primary" size={28}/>
        </CardContent>
      </Card>


      <Card className="card-hover">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-muted-foreground text-sm">
              Today's Revenue
            </p>

            <h2 className="text-3xl font-bold">
              PKR {revenue}
            </h2>
          </div>

          <DollarSign className="text-primary" size={28}/>
        </CardContent>
      </Card>

    </div>
  )
}