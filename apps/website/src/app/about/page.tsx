import { Metadata } from "next";
import { Badge, Button, GlassCard, ScrollReveal } from "@/components/shared";
import { Heart, Target, Users, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | RP-Partner - Built for Filipino Property Owners",
  description:
    "Learn about RP-Partner's mission to empower Filipino property owners with simple, professional property management tools.",
};

const values = [
  {
    icon: Heart,
    title: "Filipino First",
    description:
      "We built RP-Partner specifically for the Philippine market. Peso pricing, local payment methods, and features that make sense for how Filipinos manage properties.",
  },
  {
    icon: Target,
    title: "Simplicity",
    description:
      "Property management shouldn't require a manual. We obsess over making every feature intuitive and easy to use—even if you're not tech-savvy.",
  },
  {
    icon: Users,
    title: "Accessible to All",
    description:
      "Professional property management tools shouldn't be expensive. That's why our free plan is genuinely useful, not a limited trial.",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4">Our Story</Badge>
              <h1 className="text-h1 text-gray-900 mb-6">
                Empowering Filipino Property Owners
              </h1>
              <p className="text-body-lg text-gray-600">
                We believe every property owner deserves access to professional
                management tools—without the enterprise price tag.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-3xl p-8 md:p-12 text-center">
              <h2 className="text-h3 text-white mb-4">Our Mission</h2>
              <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed">
                "Empower every Filipino property owner to manage their rentals
                professionally, effortlessly, and profitably—starting for free."
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="prose prose-lg max-w-none">
              <h2 className="text-h2 text-gray-900 mb-6">Why We Built RP-Partner</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  RP-Partner was born from a simple frustration: existing property
                  management software was either too expensive, too complicated, or
                  built for markets that don't understand how Filipinos manage
                  rentals.
                </p>
                <p>
                  We saw property owners tracking bookings in notebooks, chasing
                  payments via Viber, and losing track of which property earned what.
                  We knew there had to be a better way.
                </p>
                <p>
                  So we built RP-Partner—a property management app that's simple
                  enough for anyone to use, powerful enough for professionals, and
                  priced fairly for the Philippine market. We support GCash and Maya
                  because that's how Filipinos pay. We price in Pesos because that's
                  how Filipinos budget.
                </p>
                <p>
                  Today, thousands of property owners across the Philippines use
                  RP-Partner to manage their condos, apartments, and vacation rentals.
                  And we're just getting started.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-h2 text-gray-900 text-center mb-12">
              What We Believe
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <ScrollReveal key={value.title} delay={index * 0.1}>
                  <GlassCard padding="lg" className="text-center h-full">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-100 text-teal-600 mb-6">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-h4 text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </GlassCard>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy-100 text-navy-600 mb-6">
                <MapPin className="w-7 h-7" />
              </div>
              <h2 className="text-h2 text-gray-900 mb-4">Made in the Philippines</h2>
              <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
                RP-Partner is proudly built by a Filipino team who understands the
                unique challenges and opportunities of the Philippine rental market.
                We're committed to supporting local property owners and growing the
                Philippine tech ecosystem.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-h2 text-gray-900 mb-4">
              Join Our Growing Community
            </h2>
            <p className="text-body-lg text-gray-600 mb-8">
              Be part of the thousands of Filipino property owners who've simplified
              their rental management with RP-Partner.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/signup" size="lg">
                Get Started Free
              </Button>
              <Button href="/contact" variant="outline" size="lg">
                Get in Touch
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
