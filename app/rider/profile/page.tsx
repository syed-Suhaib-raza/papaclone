"use client";

import DashboardLayout from "@/components/Rider/DashboardLayout";
import { User, Mail, Phone, Award, FileCheck, Star } from "lucide-react";

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="mb-8 h1">
        <h1 className="text-4xl font-black text-foreground mb-2">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 h2">
          <div className="bg-card border border-border rounded-2xl p-6 text-center card-hover group">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-chart-2 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform float-a">
              🚴
            </div>
            <h2 className="text-2xl font-black text-foreground mb-1">
              Rider Name
            </h2>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="w-3 h-3 bg-green-500 rounded-full badge-ping" />
              <p className="text-sm font-semibold text-green-600">Online</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Star size={18} className="text-yellow-500" />
                <span className="text-foreground font-semibold">4.8 Rating</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Award size={18} className="text-primary" />
                <span className="text-foreground font-semibold">247 Deliveries</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 card-hover h3">
            <h3 className="text-lg font-black text-foreground mb-6">
              Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="Rider Name"
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue="rider@example.com"
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                    Phone
                  </label>
                  <input
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 card-hover h4">
            <h3 className="text-lg font-black text-foreground mb-6">
              Documents
            </h3>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <FileCheck size={20} className="text-green-600" />
                <div>
                  <p className="font-semibold text-foreground">
                    License Verification
                  </p>
                  <p className="text-xs text-muted-foreground">Verified</p>
                </div>
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-500/10 px-3 py-1 rounded-full">
                ✓ Verified
              </span>
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-primary to-chart-2 hover:shadow-lg text-white font-black py-4 rounded-xl transition-all glow-btn h5">
            Save Changes
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}