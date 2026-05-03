"use client"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, BellRing, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AlertsPage() {
  const alerts = [
    { id: 1, type: "critical", msg: "Server load above 90%", time: "2 mins ago" },
    { id: 2, type: "warning", msg: "High volume of failed payments", time: "15 mins ago" },
    { id: 3, type: "info", msg: "Daily backup completed", time: "1 hour ago" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black">System Alerts</h1>
        <p className="text-sm text-muted-foreground">Monitor system health and critical errors</p>
      </div>

      <div className="grid gap-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className="border-l-4 border-l-primary">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${alert.type === 'critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  {alert.type === 'critical' ? <AlertTriangle size={20}/> : <BellRing size={20}/>}
                </div>
                <div>
                  <p className="font-bold text-sm">{alert.msg}</p>
                  <p className="text-[10px] text-muted-foreground">{alert.time}</p>
                </div>
              </div>
              <Badge variant="outline" className="capitalize">{alert.type}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}