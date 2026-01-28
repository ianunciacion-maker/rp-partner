import { Metadata } from "next";
import { Badge, Button, GlassCard, ScrollReveal } from "@/components/shared";
import { PRICING, SITE_CONFIG } from "@/lib/constants";
import { Check, X } from "lucide-react";
import { FAQ } from "@/components/sections";

export const metadata: Metadata = {
  title: "Pricing | Tuknang - Free Property Management App",
  description:
    "Simple, transparent pricing. Start free forever with 1 property, or upgrade to Premium for up to 3 properties. No credit card required.",
};

const featureComparison = [
  { feature: "Properties", free: "1", premium: "Up to 3" },
  { feature: "Reservations", free: "Unlimited", premium: "Unlimited" },
  { feature: "Calendar History", free: "2 months", premium: "Unlimited" },
  { feature: "Financial Reports", free: "2 months", premium: "Unlimited" },
  { feature: "Cashflow Tracking", free: true, premium: true },
  { feature: "Receipt Uploads", free: true, premium: true },
  { feature: "iOS, Android & Web", free: true, premium: true },
  { feature: "Guest Management", free: true, premium: true },
  { feature: "Priority Support", free: false, premium: true },
  { feature: "Advanced Analytics", free: false, premium: "Coming Soon" },
  { feature: "Data Export (PDF)", free: false, premium: true },
];

export default function PricingPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4">Simple Pricing</Badge>
              <h1 className="text-h1 text-gray-900 mb-6">
                Start Free, Upgrade When Ready
              </h1>
              <p className="text-body-lg text-gray-600">
                No hidden fees. No credit card required. Just simple, transparent
                pricing designed for Filipino property owners.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <ScrollReveal delay={0.1}>
              <GlassCard
                hoverable
                padding="lg"
                className="relative border-2 border-teal-500 h-full"
              >
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>

                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {PRICING.free.name}
                  </h2>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-gray-900">
                      {PRICING.free.currency}
                      {PRICING.free.price}
                    </span>
                    <span className="text-gray-500">/{PRICING.free.period}</span>
                  </div>
                  <p className="text-teal-600 font-medium mt-2">forever</p>
                  <p className="text-gray-600 mt-4">{PRICING.free.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {PRICING.free.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button href={SITE_CONFIG.links.signup} className="w-full" size="lg">
                  {PRICING.free.cta}
                </Button>
              </GlassCard>
            </ScrollReveal>

            {/* Premium Plan */}
            <ScrollReveal delay={0.2}>
              <GlassCard hoverable padding="lg" variant="dark" className="h-full">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {PRICING.premium.name}
                  </h2>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-gray-900">
                      {PRICING.premium.currency}
                      {PRICING.premium.price}
                    </span>
                    <span className="text-gray-500">
                      /{PRICING.premium.period}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-4">
                    {PRICING.premium.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {PRICING.premium.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  href={`${SITE_CONFIG.links.signup}?plan=premium`}
                  variant="secondary"
                  className="w-full"
                  size="lg"
                >
                  {PRICING.premium.cta}
                </Button>
              </GlassCard>
            </ScrollReveal>
          </div>

          <p className="text-center text-gray-500 mt-8">
            Pay via GCash, Maya, or Bank Transfer. No credit card needed.
          </p>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-h2 text-gray-900 text-center mb-12">
              Compare Plans
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">
                      Feature
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">
                      Free
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900 bg-teal-50">
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {featureComparison.map((row, index) => (
                    <tr
                      key={row.feature}
                      className={index < featureComparison.length - 1 ? "border-b border-gray-100" : ""}
                    >
                      <td className="py-4 px-6 text-gray-600">{row.feature}</td>
                      <td className="py-4 px-6 text-center">
                        {typeof row.free === "boolean" ? (
                          row.free ? (
                            <Check className="w-5 h-5 text-teal-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-900">{row.free}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center bg-teal-50/50">
                        {typeof row.premium === "boolean" ? (
                          row.premium ? (
                            <Check className="w-5 h-5 text-teal-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-900 font-medium">
                            {row.premium}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-h2 text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-body-lg text-gray-600 mb-8">
              Join thousands of Filipino property owners who've simplified their
              rental management.
            </p>
            <Button href={SITE_CONFIG.links.signup} size="lg">
              Start Free Today
            </Button>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
