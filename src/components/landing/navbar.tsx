"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useState } from "react"
import { Menu, X } from "lucide-react"

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "Customers", href: "#customers" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { scrollY } = useScroll()
  const backgroundOpacity = useTransform(scrollY, [0, 100], [0, 0.8])
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 1])

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        style={{
          backgroundColor: useTransform(backgroundOpacity, (v) => `rgba(255, 255, 255, ${v})`),
          borderBottomColor: useTransform(borderOpacity, (v) => `rgba(226, 232, 240, ${v})`),
        }}
        className="backdrop-blur-xl border-b"
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-[#7BC53A] flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path d="M2 7L12 12L22 7" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M12 22V12" stroke="white" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Morphis</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100/50"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign in
            </a>
            <a
              href="/auth/register"
              className="group px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 hover:gap-3"
            >
              Start free
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile nav */}
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-slate-200 bg-white"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t border-slate-100 mt-2 pt-3 flex flex-col gap-2">
                <a
                  href="/auth/login"
                  className="px-3 py-2 text-sm font-medium text-slate-700"
                >
                  Sign in
                </a>
                <a
                  href="/auth/register"
                  className="px-3 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold text-center"
                >
                  Start free
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.header>
  )
}
