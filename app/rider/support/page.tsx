"use client";

import { MessageSquare, Phone, Mail, FileText, ChevronRight } from "lucide-react";

export default function SupportPage() {
  const supportOptions = [
    {
      icon: <MessageSquare size={28} />,
      title: "Live Chat",
      description: "Chat with our support team",
      action: "Start Chat",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <Phone size={28} />,
      title: "Call Us",
      description: "Speak with a representative",
      action: "+1 (555) 123-4567",
      color: "from-green-500 to-green-600",
    },
    {
      icon: <Mail size={28} />,
      title: "Email",
      description: "Send us your concerns",
      action: "support@smartfood.com",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: <FileText size={28} />,
      title: "FAQ",
      description: "Find quick answers",
      action: "View FAQs",
      color: "from-pink-500 to-red-500",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">

      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Support Center</h1>
        <p className="text-muted-foreground">
          We're here to help. Choose a support option below.
        </p>
      </div>

      {/* Support Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {supportOptions.map((option, idx) => (
          <div
            key={idx}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div
              className={`w-14 h-14 bg-gradient-to-br ${option.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-105 transition`}
            >
              {option.icon}
            </div>

            <h3 className="text-lg font-semibold text-foreground">
              {option.title}
            </h3>

            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {option.description}
            </p>

            <div className="flex items-center text-primary font-medium text-sm gap-1 group-hover:gap-2 transition-all">
              {option.action}
              <ChevronRight
                size={16}
                className="group-hover:translate-x-1 transition"
              />
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-card border border-border rounded-xl p-8">
        <h2 className="text-xl font-semibold mb-6">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {[
            {
              q: "How do I accept a delivery?",
              a: "Go to the deliveries section and click 'Accept Delivery' on any available order.",
            },
            {
              q: "How are my earnings calculated?",
              a: "Earnings depend on delivery distance, time, and customer ratings.",
            },
            {
              q: "What if I need to cancel a delivery?",
              a: "Contact support immediately. Cancellation policies may apply.",
            },
          ].map((faq, idx) => (
            <details
              key={idx}
              className="border border-border rounded-lg p-4 group cursor-pointer"
            >
              <summary className="flex justify-between items-center font-medium text-foreground">
                {faq.q}
                <ChevronRight
                  size={18}
                  className="group-open:rotate-90 transition"
                />
              </summary>

              <p className="text-sm text-muted-foreground mt-3">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>

    </div>
  );
}