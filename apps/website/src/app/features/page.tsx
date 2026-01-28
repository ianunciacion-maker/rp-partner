import { Metadata } from "next";
import { Badge, Button, GlassCard, ScrollReveal } from "@/components/shared";
import {
  Home,
  Calendar,
  DollarSign,
  Users,
  BarChart3,
  Upload,
  Bell,
  Shield,
  Smartphone,
  Cloud,
  Zap,
  Globe,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Features | RP-Partner - Property Management Made Simple",
  description:
    "Discover all the powerful features of RP-Partner: property tracking, calendar management, cashflow tracking, guest management, and more.",
};

const mainFeatures = [
  {
    icon: Home,
    title: "Property Management",
    description:
      "Add unlimited property details, photos, and notes. Track occupancy and performance across your entire portfolio.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Calendar,
    title: "Smart Calendar",
    description:
      "Visual calendar showing all reservations. Block dates, track check-ins/check-outs, and never double-book again.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: DollarSign,
    title: "Cashflow Tracking",
    description:
      "Track income and expenses per property. Categorize transactions, upload receipts, see real-time profitability.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Users,
    title: "Guest Management",
    description:
      "Store guest details, track payments and deposits, manage booking sources, and add notes for special requests.",
    color: "bg-orange-100 text-orange-600",
  },
];

const additionalFeatures = [
  {
    icon: BarChart3,
    title: "Financial Reports",
    description: "Generate professional reports for your records or accountant.",
  },
  {
    icon: Upload,
    title: "Receipt Uploads",
    description: "Snap photos of receipts and attach them to transactions.",
  },
  {
    icon: Bell,
    title: "Reminders",
    description: "Get notified about upcoming check-ins, check-outs, and payments.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Enterprise-grade security. Your data is encrypted and backed up.",
  },
  {
    icon: Smartphone,
    title: "Works Everywhere",
    description: "Access from iOS, Android, or any web browser. Data syncs instantly.",
  },
  {
    icon: Cloud,
    title: "Automatic Backup",
    description: "Your data is automatically backed up daily. Never lose your records.",
  },
  {
    icon: Zap,
    title: "Fast & Simple",
    description: "Add properties in under 2 minutes. No learning curve required.",
  },
  {
    icon: Globe,
    title: "Built for Philippines",
    description: "Peso-first. Supports GCash, Maya, and local payment methods.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4">Powerful Features</Badge>
              <h1 className="text-h1 text-gray-900 mb-6">
                Everything You Need to Manage Properties
              </h1>
              <p className="text-body-lg text-gray-600">
                RP-Partner gives you all the tools to track bookings, manage
                finances, and grow your rental business—without the complexity.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <ScrollReveal key={feature.title} delay={index * 0.1}>
                  <GlassCard hoverable padding="lg" className="h-full">
                    <div
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.color} mb-6`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <h2 className="text-h3 text-gray-900 mb-3">{feature.title}</h2>
                    <p className="text-body-lg text-gray-600">
                      {feature.description}
                    </p>
                  </GlassCard>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-h2 text-gray-900 mb-4">And So Much More</h2>
              <p className="text-body-lg text-gray-600">
                Features designed to make property management effortless.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <ScrollReveal key={feature.title} delay={index * 0.05}>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-teal-50 text-teal-600 mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-3xl p-8 md:p-12 text-center">
              <Badge variant="warning" className="mb-4">
                Coming Soon
              </Badge>
              <h2 className="text-h2 text-white mb-4">Advanced Analytics</h2>
              <p className="text-body-lg text-white/80 mb-6 max-w-2xl mx-auto">
                We're building powerful analytics features including occupancy
                trends, revenue forecasting, and property performance comparisons.
                Premium users will get early access.
              </p>
              <Button
                href="/signup?plan=premium"
                className="bg-white text-navy-900 hover:bg-gray-100"
              >
                Get Premium for Early Access
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-h2 text-gray-900 mb-4">
              Ready to Try These Features?
            </h2>
            <p className="text-body-lg text-gray-600 mb-8">
              Start for free and explore all the features that make property
              management simple.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/signup" size="lg">
                Start Free Today
              </Button>
              <Button href="/pricing" variant="outline" size="lg">
                View Pricing
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
