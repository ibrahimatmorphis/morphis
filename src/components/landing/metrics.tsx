"use client"

import { motion } from "framer-motion"

const metrics = [
  { value: "50ms", label: "Average deploy time", detail: "vs 12 min industry average" },
  { value: "99.99%", label: "Uptime SLA", detail: "Enterprise-grade reliability" },
  { value: "1.2M+", label: "Deploys per month", detail: "Across our customer base" },
  { value: "$4.2B", label: "Revenue protected", detail: "Through zero-downtime ships" },
]

export function Metrics() {
  return (
    <section className="py-24 lg:py-32 bg-slate-900 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 30%, rgba(123, 197, 58, 0.15) 0%, transparent 40%), radial-gradient(circle at 75% 70%, rgba(123, 197, 58, 0.1) 0%, transparent 40%)`,
          }}
        />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-[#7BC53A] uppercase tracking-widest mb-4"
          >
            By the numbers
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold text-white tracking-tight text-balance"
          >
            Engineering teams{" "}
            <span className="text-[#7BC53A]">ship more, break less</span>.
          </motion.h2>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-800 rounded-3xl overflow-hidden border border-slate-800">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900 p-8 lg:p-10 hover:bg-slate-800/50 transition-colors group"
            >
              <div className="text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight group-hover:text-[#7BC53A] transition-colors">
                {metric.value}
              </div>
              <p className="text-sm font-semibold text-slate-300 mb-1">{metric.label}</p>
              <p className="text-xs text-slate-500">{metric.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
