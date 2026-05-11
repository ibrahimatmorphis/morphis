"use client"

import { motion } from "framer-motion"
import { Check, ArrowUpRight } from "lucide-react"

const pipelineSteps = [
  { label: "Build & Compile", time: "12s", status: "complete" },
  { label: "AI Risk Analysis", time: "3s", status: "complete" },
  { label: "Hot Deploy", time: "47ms", status: "active" },
  { label: "Health Checks", time: "2s", status: "pending" },
  { label: "Traffic Shift", time: "—", status: "pending" },
]

export function Showcase() {
  return (
    <section id="product" className="py-24 lg:py-32 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#7BC53A]/5 blur-3xl rounded-full -translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold text-[#7BC53A] uppercase tracking-widest mb-4"
            >
              How it works
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight text-balance mb-6"
            >
              A deployment pipeline that{" "}
              <span className="text-[#7BC53A]">thinks for itself</span>.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 leading-relaxed mb-8"
            >
              Morphis replaces brittle CI/CD scripts with an intelligent orchestration layer.
              Every deploy is analyzed, validated, and rolled out with surgical precision.
            </motion.p>

            {/* Checklist */}
            <motion.ul
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-3 mb-8"
            >
              {[
                "Connect your Git repository in under 60 seconds",
                "AI learns your app's patterns and failure modes",
                "Deploy with confidence — every time",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#7BC53A] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </motion.ul>

            <motion.a
              href="#"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="group inline-flex items-center gap-2 text-[#7BC53A] font-semibold hover:gap-3 transition-all"
            >
              Explore the platform
              <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
            </motion.a>
          </div>

          {/* Right: Deployment Pipeline Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/5 overflow-hidden">
              {/* Terminal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-[#7BC53A]" />
                </div>
                <span className="text-xs font-mono text-slate-500">deploy.morphis.io</span>
                <div className="w-12" />
              </div>

              {/* Content */}
              <div className="p-6 lg:p-8">
                {/* Status bar */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Production deploy</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      main → v2.4.1 · commit 4f9a2d8
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7BC53A]/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7BC53A] animate-pulse" />
                    <span className="text-xs font-semibold text-[#65A330]">Deploying</span>
                  </div>
                </div>

                {/* Pipeline steps */}
                <div className="space-y-2">
                  {pipelineSteps.map((step, i) => (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                        step.status === "active"
                          ? "bg-[#7BC53A]/10 border border-[#7BC53A]/30"
                          : step.status === "complete"
                            ? "bg-slate-50"
                            : "bg-slate-50/50 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {step.status === "complete" ? (
                          <div className="w-5 h-5 rounded-full bg-[#7BC53A] flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                        ) : step.status === "active" ? (
                          <div className="w-5 h-5 rounded-full border-2 border-[#7BC53A] border-t-transparent animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            step.status === "pending" ? "text-slate-500" : "text-slate-900"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-mono ${
                          step.status === "active"
                            ? "text-[#65A330] font-semibold"
                            : "text-slate-500"
                        }`}
                      >
                        {step.time}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Metrics footer */}
                <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500">Latency</p>
                    <p className="text-sm font-bold text-slate-900 font-mono">12ms</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Regions</p>
                    <p className="text-sm font-bold text-slate-900 font-mono">24</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Error rate</p>
                    <p className="text-sm font-bold text-[#7BC53A] font-mono">0.00%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative floating element */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#7BC53A] to-[#65A330] rounded-2xl opacity-20 blur-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
