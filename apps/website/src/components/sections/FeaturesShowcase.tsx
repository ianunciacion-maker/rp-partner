"use client";

import { GlassCard, PhoneMockup, ScrollReveal } from "@/components/shared";
import { Home, Calendar, DollarSign, Users } from "lucide-react";
import {
  PropertiesScreenMockup,
  CalendarScreenMockup,
  CashflowScreenMockup,
  GuestScreenMockup,
} from "@/components/mockups";

const features = [
  {
    id: "properties",
    icon: Home,
    title: "All Your Properties, One Dashboard",
    description:
      "See every property at a glance. Add unlimited details, photos, and notes. Know exactly what's happening across your entire portfolio.",
    bullets: [
      "Add properties in under 2 minutes",
      "Upload photos and set your rates",
      "Track occupancy and performance",
      "Works for condos, apartments, and vacation homes",
    ],
  },
  {
    id: "calendar",
    icon: Calendar,
    title: "Never Double-Book Again",
    description:
      "A visual calendar that shows all your reservations across properties. Block dates for maintenance, personal use, or anything else.",
    bullets: [
      "See availability at a glance",
      "Block dates with one tap",
      "Guest check-in/check-out tracking",
      "Perfect for multi-property owners",
    ],
  },
  {
    id: "cashflow",
    icon: DollarSign,
    title: "Know Exactly Where Your Money Goes",
    description:
      "Track income and expenses for each property. Categorize transactions, upload receipts, and see your profitability in real-time.",
    bullets: [
      "Income and expense tracking",
      "Category-based organization",
      "Receipt photo uploads",
      "Per-property financial reports",
    ],
  },
  {
    id: "reservations",
    icon: Users,
    title: "Guest Management Made Simple",
    description:
      "Store guest details, track payments, and manage deposits. Everything you need to provide a professional experience.",
    bullets: [
      "Guest contact information",
      "Payment and deposit tracking",
      "Booking source tracking (Airbnb, direct, etc.)",
      "Notes and special requests",
    ],
  },
];

const screenMockups: Record<string, React.ReactNode> = {
  properties: <PropertiesScreenMockup />,
  calendar: <CalendarScreenMockup />,
  cashflow: <CashflowScreenMockup />,
  reservations: <GuestScreenMockup />,
};

/**
 * Features showcase section with alternating layout.
 */
export function FeaturesShowcase() {
  return (
    <section className="py-20 md:py-32 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-h2 text-gray-900 mb-4">
            Everything You Need to Manage Your Properties
          </h2>
          <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed specifically for Filipino property owners
            and managers.
          </p>
        </div>

        <div className="space-y-24 md:space-y-32">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isEven = index % 2 === 1;

            return (
              <ScrollReveal
                key={feature.id}
                direction={isEven ? "right" : "left"}
              >
                <div
                  className={`grid lg:grid-cols-2 gap-12 items-center ${
                    isEven ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content */}
                  <div className={isEven ? "lg:order-2" : ""}>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 mb-6">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-h3 text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-body-lg text-gray-600 mb-6">
                      {feature.description}
                    </p>
                    <ul className="space-y-3">
                      {feature.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-3 text-gray-600"
                        >
                          <span className="text-teal-500 mt-1">•</span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Phone Mockup */}
                  <div
                    className={`flex justify-center ${
                      isEven ? "lg:order-1 lg:justify-start" : "lg:justify-end"
                    }`}
                  >
                    <GlassCard padding="lg" className="p-4 md:p-8">
                      <PhoneMockup>
                        {screenMockups[feature.id]}
                      </PhoneMockup>
                    </GlassCard>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
