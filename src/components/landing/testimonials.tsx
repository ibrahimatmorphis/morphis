"use client"

import { motion } from "framer-motion"

const testimonials = [
  {
    quote:
      "Morphis cut our deployment time from 40 minutes to under a second. Our engineers are shipping 5x more without the 2am pages.",
    author: "Sarah Chen",
    role: "VP Engineering",
    company: "Ramp",
    initials: "SC",
  },
  {
    quote:
      "The AI risk analysis has caught three regressions that would have made it to production. It's like having a senior engineer review every PR.",
    author: "Marcus Rodriguez",
    role: "Staff SRE",
    company: "Scale AI",
    initials: "MR",
  },
  {
    quote:
      "We replaced our entire CI/CD stack with Morphis. One platform, zero downtime, and our mean time to recovery dropped 94%.",
    author: "Priya Patel",
    role: "Director of Platform",
    company: "Linear",
    initials: "PP",
  },
]

export function Testimonials() {
  return (
    <section id="customers" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-[#7BC53A] uppercase tracking-widest mb-4"
          >
            Customer stories
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight text-balance"
          >
            Loved by engineering teams
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:border-[#7BC53A]/40 transition-colors"
            >
              {/* Quote mark */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                className="text-[#7BC53A]/20 mb-4"
              >
                <path
                  d="M10 8C6 8 4 10 4 14V24H14V14H8C8 11 10 10 12 10V8H10ZM24 8C20 8 18 10 18 14V24H28V14H22C22 11 24 10 26 10V8H24Z"
                  fill="currentColor"
                />
              </svg>

              <p className="text-slate-800 leading-relaxed mb-6 text-[15px]">
                {t.quote}
              </p>

              <footer className="flex items-center gap-3 pt-6 border-t border-slate-200">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7BC53A] to-[#65A330] flex items-center justify-center text-white font-bold text-sm">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.author}</p>
                  <p className="text-xs text-slate-500">
                    {t.role} · {t.company}
                  </p>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
