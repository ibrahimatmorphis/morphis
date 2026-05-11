"use client"

import { motion } from "framer-motion"
import dynamic from "next/dynamic"

const ThreeScene = dynamic(() => import("./three-scene").then((mod) => mod.ThreeScene), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl" />,
})

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-24 lg:pt-32 pb-20">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(100 116 139 / 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(100 116 139 / 0.2) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
        }}
      />

      {/* Accent gradient */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-[#7BC53A]/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="relative z-10">
            {/* Announcement pill */}
            <motion.a
              href="#"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#7BC53A]/40 transition-all shadow-sm mb-8"
            >
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#7BC53A]/10 text-[#65A330] rounded-full">
                New
              </span>
              <span className="text-sm text-slate-700">
                Announcing Morphis v2.4 — AI traffic routing
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                className="text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all"
              >
                <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.a>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.05] text-balance"
            >
              Ship code at the{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-[#7BC53A]">speed of thought</span>
                <motion.svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 0.9, ease: "easeInOut" }}
                >
                  <motion.path
                    d="M2 8 Q 150 -2, 298 6"
                    stroke="#7BC53A"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, delay: 0.9, ease: "easeInOut" }}
                  />
                </motion.svg>
              </span>
              .
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl text-pretty"
            >
              Morphis is the AI-powered hot-deploy infrastructure for enterprise SaaS.
              Zero downtime. Instant rollbacks. Intelligent traffic routing at global scale.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <a
                href="#get-started"
                className="group inline-flex items-center gap-2 px-6 py-3.5 bg-[#7BC53A] hover:bg-[#65A330] text-white rounded-xl font-semibold shadow-lg shadow-[#7BC53A]/20 hover:shadow-xl hover:shadow-[#7BC53A]/30 transition-all hover:-translate-y-0.5"
              >
                Start deploying free
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="transition-transform group-hover:translate-x-1"
                >
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="#demo"
                className="group inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-xl font-semibold transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#7BC53A]">
                  <path
                    d="M8 5V19L19 12L8 5Z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                Watch 2-min demo
              </a>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-10 flex items-center gap-6 text-sm text-slate-500"
            >
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#7BC53A]">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                No credit card
              </div>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#7BC53A]">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                SOC 2 Type II
              </div>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#7BC53A]">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                99.99% uptime
              </div>
            </motion.div>
          </div>

          {/* Right: 3D Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative h-[500px] lg:h-[600px] w-full"
          >
            {/* Decorative frame */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#7BC53A]/5 via-transparent to-slate-100/50 rounded-3xl" />
            <div className="absolute inset-4 lg:inset-6">
              <ThreeScene />
            </div>

            {/* Floating info card - top right */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute top-8 right-4 lg:right-8 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-4 shadow-xl max-w-[200px]"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#7BC53A] animate-pulse" />
                <span className="text-xs font-semibold text-slate-900">Active deploy</span>
              </div>
              <p className="text-xs text-slate-600">
                main → production in{" "}
                <span className="font-mono font-semibold text-[#7BC53A]">47ms</span>
              </p>
            </motion.div>

            {/* Floating info card - bottom left */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="absolute bottom-8 left-4 lg:left-0 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-4 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7BC53A]/10 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#7BC53A]">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Deploys today</p>
                  <p className="text-lg font-bold text-slate-900">1,247</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
