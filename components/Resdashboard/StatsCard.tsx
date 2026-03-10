import { Card, CardContent } from "@/components/ui/card"

export default function StatsCard({ title, value, icon }: any) {
  return (
    <Card className="card-hover">
      <CardContent className="flex items-center justify-between p-6">

        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <h2 className="text-2xl font-bold">{value}</h2>
        </div>

        <div className="text-primary">
          {icon}
        </div>

      </CardContent>
    </Card>
  )
}