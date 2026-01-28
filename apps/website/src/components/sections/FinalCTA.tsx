"use client";

import { Button, ScrollReveal, VideoBackground } from "@/components/shared";
import { SITE_CONFIG } from "@/lib/constants";
import { ArrowRight } from "lucide-react";

/**
 * Final call-to-action section with gradient background.
 */
export function FinalCTA() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Video background with CSS gradient fallback */}
      <VideoBackground />

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <h2 className="text-h2 md:text-h1 text-white mb-6">
            Ready to Manage Your Properties Like a Pro?
          </h2>
          <p className="text-body-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Join 10,000+ Filipino property owners who've simplified their rental
            management. Start free today.
          </p>

          <Button
            href={SITE_CONFIG.links.signup}
            size="lg"
            className="bg-white text-navy-900 hover:bg-gray-100 shadow-xl"
          >
            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <p className="text-sm text-white/60 mt-6">
            No credit card required • Free forever • Cancel anytime
          </p>

          {/* App Store Badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <a
              href={SITE_CONFIG.links.appStore}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-12 px-6 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
            >
              Download on App Store
            </a>
            <a
              href={SITE_CONFIG.links.playStore}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-12 px-6 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
            >
              Get it on Google Play
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
