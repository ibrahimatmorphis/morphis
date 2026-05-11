"use client"

import { motion } from "framer-motion"

const companies = [
  "Stripe",
  "Linear",
  "Notion",
  "Vercel",
  "Figma",
  "Ramp",
  "Scale",
]

export function Logos() {
  return (
    <section className="py-16 border-y border-slate-100 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-10"
        >
          Trusted by engineering teams at
        </motion.p>

        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 lg:gap-x-16">
          {companies.map((company, i) => (
            <motion.div
              key={company}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="text-2xl lg:text-3xl font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              {company}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
