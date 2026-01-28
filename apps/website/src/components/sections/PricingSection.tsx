"use client";

import { Badge, Button, GlassCard, ScrollReveal } from "@/components/shared";
import { PRICING, SITE_CONFIG } from "@/lib/constants";
import { Check } from "lucide-react";

/**
 * Pricing section with Free and Premium plans.
 */
export function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-h2 text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-body-lg text-gray-600">
              Start free, upgrade when you're ready.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <ScrollReveal delay={0.1}>
            <GlassCard
              hoverable
              padding="lg"
              className="relative border-2 border-teal-500"
            >
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>

              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {PRICING.free.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {PRICING.free.currency}
                    {PRICING.free.price}
                  </span>
                  <span className="text-gray-500">/{PRICING.free.period}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">forever</p>
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

              <Button href={SITE_CONFIG.links.signup} className="w-full">
                {PRICING.free.cta}
              </Button>
            </GlassCard>
          </ScrollReveal>

          {/* Premium Plan */}
          <ScrollReveal delay={0.2}>
            <GlassCard hoverable padding="lg" variant="dark">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {PRICING.premium.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">
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

              <Button href={`${SITE_CONFIG.links.signup}?plan=premium`} variant="secondary" className="w-full">
                {PRICING.premium.cta}
              </Button>
            </GlassCard>
          </ScrollReveal>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Pay via GCash, Maya, or Bank Transfer. No credit card needed.
        </p>
      </div>
    </section>
  );
}
