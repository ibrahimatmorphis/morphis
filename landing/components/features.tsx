"use client"

import { motion } from "framer-motion"
import { Zap, Shield, GitBranch, Gauge, Globe2, Sparkles } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Hot-deploy in 50ms",
    description:
      "Push updates to production without restarts. Our hot-swap engine keeps connections alive while new code takes over.",
  },
  {
    icon: Sparkles,
    title: "AI risk analysis",
    description:
      "Every deploy is analyzed for regression risk. Morphis catches issues before they hit users — and auto-rollbacks if they do.",
  },
  {
    icon: GitBranch,
    title: "Smart traffic routing",
    description:
      "Canary, blue-green, or progressive rollouts. Morphis routes traffic intelligently based on user segments and health metrics.",
  },
  {
    icon: Shield,
    title: "Enterprise security",
    description:
      "SOC 2 Type II, HIPAA, and ISO 27001. End-to-end encryption with hardware-isolated tenant environments.",
  },
  {
    icon: Gauge,
    title: "Real-time observability",
    description:
      "Sub-second metrics, distributed tracing, and log aggregation built in. Debug production in the same pane as your code.",
  },
  {
    icon: Globe2,
    title: "Global edge network",
    description:
      "Deploy to 24 regions across 6 continents. Automatic geo-routing puts your app milliseconds from every user.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-[#7BC53A] uppercase tracking-widest mb-4"
          >
            Platform
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight text-balance"
          >
            Everything you need to deploy with confidence
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-slate-600 leading-relaxed"
          >
            Built for engineering teams that ship fast without breaking things.
          </motion.p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className="group relative p-8 rounded-2xl border border-slate-200 bg-white hover:border-[#7BC53A]/40 hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-300"
            >
              {/* Icon */}
              <div className="relative mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7BC53A]/10 to-[#7BC53A]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-[#7BC53A]" strokeWidth={2} />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>

              {/* Hover arrow */}
              <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-[#7BC53A] opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Learn more</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
