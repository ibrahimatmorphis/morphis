"use client"

import { motion } from "framer-motion"

export function CTA() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-12 lg:p-16"
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#7BC53A]/20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#7BC53A]/10 blur-3xl rounded-full -translate-x-1/3 translate-y-1/3" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
              backgroundSize: "48px 48px",
            }}
          />

          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block text-sm font-semibold text-[#7BC53A] uppercase tracking-widest mb-4"
              >
                Start today
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl lg:text-5xl font-bold text-white tracking-tight text-balance leading-[1.1]"
              >
                Deploy with confidence.{" "}
                <span className="text-[#7BC53A]">Starting now.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-lg text-slate-300 leading-relaxed"
              >
                Join 500+ engineering teams shipping safer, faster. Free for your first month.
                No credit card required.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-3"
            >
              <a
                href="#get-started"
                className="group inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#7BC53A] hover:bg-[#65A330] text-white rounded-xl font-semibold text-lg shadow-lg shadow-[#7BC53A]/30 transition-all hover:-translate-y-0.5"
              >
                Start deploying free
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-1">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-xl font-semibold text-lg transition-all backdrop-blur-sm"
              >
                Talk to sales
              </a>

              <p className="text-xs text-slate-400 text-center mt-2">
                Free 30-day trial · SOC 2 Type II · 99.99% uptime SLA
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
