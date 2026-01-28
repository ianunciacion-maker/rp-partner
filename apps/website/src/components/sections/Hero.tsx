"use client";

import { Badge, Button, PhoneMockup, VideoBackground } from "@/components/shared";
import { SITE_CONFIG, STATS } from "@/lib/constants";
import { motion } from "framer-motion";
import { ArrowRight, Star, Download, Home } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" as const },
  }),
};

/**
 * Hero section - the primary conversion component.
 * Split layout with copy on left, phone mockup on right.
 */
export function Hero() {
  return (
    <section
      data-testid="hero-section"
      aria-label="Hero"
      role="region"
      className="relative min-h-screen overflow-hidden"
    >
      {/* Video background with villa footage */}
      <VideoBackground
        src="/videos/hero-villa.mp4"
        overlay
        overlayOpacity={40}
      />

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-navy-400/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Copy */}
          <div className="text-center lg:text-left">
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <Badge className="mb-6">
                <span className="mr-1">🇵🇭</span> Built for Filipino Property Owners
              </Badge>
            </motion.div>

            <motion.h1
              custom={0.1}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-hero text-white mb-6"
            >
              Manage Your Rental Properties Like a Pro
            </motion.h1>

            <motion.p
              custom={0.2}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-body-lg text-white/80 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              The all-in-one app to track bookings, manage finances, and grow
              your rental business. Free to start, no credit card required.
            </motion.p>

            {/* CTAs */}
            <motion.div
              custom={0.3}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
            >
              <Button href={SITE_CONFIG.links.signup} size="lg">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button href="#how-it-works" variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                See How It Works
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              custom={0.4}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="flex flex-wrap gap-6 justify-center lg:justify-start text-white/80"
            >
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-white">{STATS.rating}</span>
                <span>Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-teal-300" />
                <span className="font-semibold text-white">{STATS.users}</span>
                <span>Downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-teal-300" />
                <span className="font-semibold text-white">{STATS.properties}</span>
                <span>Properties</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Glass card behind phone */}
              <div className="absolute -inset-4 md:-inset-8 bg-white/10 backdrop-blur-xl rounded-[60px] border border-white/20" />

              <PhoneMockup animate data-testid="phone-mockup">
                {/* Placeholder app screenshot */}
                <div className="w-full h-full bg-gradient-to-b from-gray-50 to-gray-100 p-4">
                  {/* App header mock */}
                  <div className="flex items-center justify-between mb-4 pt-6">
                    <div>
                      <div className="text-xs text-gray-500">Welcome back</div>
                      <div className="text-sm font-semibold text-gray-900">Maria Santos</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-teal-100" />
                  </div>

                  {/* Stats cards */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white rounded-xl p-3 shadow-sm">
                      <div className="text-xs text-gray-500">Properties</div>
                      <div className="text-lg font-bold text-gray-900">3</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-sm">
                      <div className="text-xs text-gray-500">This Month</div>
                      <div className="text-lg font-bold text-teal-600">₱45,000</div>
                    </div>
                  </div>

                  {/* Property cards */}
                  <div className="space-y-2">
                    {["Makati Condo", "Cebu Beach House", "BGC Studio"].map((name, i) => (
                      <div key={name} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${i === 0 ? 'bg-teal-100' : i === 1 ? 'bg-blue-100' : 'bg-purple-100'}`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{name}</div>
                          <div className="text-xs text-gray-500">{i === 0 ? 'Occupied' : i === 1 ? 'Vacant' : 'Booked'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </PhoneMockup>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
