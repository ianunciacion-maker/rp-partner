"use client";

import { STATS } from "@/lib/constants";
import { motion } from "framer-motion";

/**
 * Social proof bar showing stats and featured logos.
 */
export function SocialProofBar() {
  const stats = [
    { value: STATS.users, label: "Active Users" },
    { value: STATS.properties, label: "Properties Managed" },
    { value: STATS.revenue, label: "Tracked Revenue" },
    { value: STATS.rating, label: "App Rating", suffix: "★" },
  ];

  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500 mb-8">
          Trusted by property owners across the Philippines
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-navy-900">
                {stat.value}
                {stat.suffix}
              </div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Featured In */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <p className="text-center text-xs text-gray-400 mb-4">FEATURED IN</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            {["Inquirer.net", "Rappler", "Manila Bulletin", "Tech in Asia"].map(
              (name) => (
                <span
                  key={name}
                  className="text-sm font-medium text-gray-400"
                >
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
