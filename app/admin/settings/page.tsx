"use client"

import { User, Bell, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card className="border-border rounded-2xl bg-card">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-primary">{icon}</span>
          <h2 className="text-sm font-black text-foreground">{title}</h2>
        </div>
        <Separator className="mb-4" />
        {children}
      </CardContent>
    </Card>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-xl font-black text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Admin account and platform configuration</p>
      </div>

      <Section icon={<User size={15} />} title="Profile">
        <Row label="Name"  value="Admin User" />
        <Row label="Role"  value="Super Admin" />
        <Row label="Email" value="admin@smartfood.com" />
      </Section>

      <Section icon={<Bell size={15} />} title="Notifications">
        <Row label="New restaurant registrations" value="Enabled" />
        <Row label="Order alerts"                 value="Enabled" />
        <Row label="System errors"                value="Enabled" />
      </Section>

      <Section icon={<Shield size={15} />} title="Platform">
        <Row label="Version"     value="1.0.0" />
        <Row label="Environment" value="Production" />
        <Row label="Region"      value="Global" />
      </Section>
    </div>
  )
}
