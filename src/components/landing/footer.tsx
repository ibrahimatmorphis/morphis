"use client"

import { motion } from "framer-motion"

const footerLinks = {
  Product: [
    { label: "Platform", href: "#" },
    { label: "Features", href: "#features" },
    { label: "Integrations", href: "#" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "#" },
    { label: "Roadmap", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Customers", href: "#customers" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Press", href: "#" },
    { label: "Contact", href: "/contact" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Guides", href: "#" },
    { label: "Status", href: "#" },
    { label: "Security", href: "#" },
    { label: "Community", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "DPA", href: "#" },
    { label: "Compliance", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <a href="/" className="inline-flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-[#7BC53A] flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M2 7L12 12L22 7" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M12 22V12" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">Morphis</span>
            </a>

            <p className="mt-4 text-slate-600 leading-relaxed max-w-sm">
              AI-powered hot-deploy infrastructure for enterprise SaaS.
              Ship code at the speed of thought.
            </p>

            {/* Status indicator */}
            <a
              href="#status"
              className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#7BC53A]/40 transition-colors"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 rounded-full bg-[#7BC53A]"
              />
              <span className="text-xs font-medium text-slate-700">All systems operational</span>
            </a>

            {/* Social */}
            <div className="mt-8 flex items-center gap-2">
              {[
                { label: "Twitter", icon: "M22 5.9c-.7.3-1.5.6-2.4.7.9-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1C18.1 4.5 17 4 15.8 4c-2.4 0-4.3 1.9-4.3 4.3 0 .3 0 .7.1 1C8 9.1 5 7.5 3 5.1c-.4.6-.6 1.4-.6 2.2 0 1.5.8 2.8 1.9 3.6-.7 0-1.4-.2-2-.5v.1c0 2.1 1.5 3.8 3.4 4.2-.4.1-.7.1-1.1.1-.3 0-.5 0-.8-.1.5 1.7 2.1 2.9 3.9 3-1.4 1.1-3.3 1.8-5.2 1.8-.3 0-.7 0-1-.1 1.9 1.2 4.1 1.9 6.5 1.9 7.8 0 12.1-6.5 12.1-12.1V8c.8-.6 1.5-1.3 2.1-2.1z" },
                { label: "GitHub", icon: "M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.3-3.4-1.3-.4-1.1-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7-.1-.3-.5-1.3.1-2.7 0 0 .8-.3 2.7 1 .8-.2 1.7-.3 2.5-.3.9 0 1.7.1 2.5.3 1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.3 4.7-4.6 4.9.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 3.9-1.3 6.8-5.1 6.8-9.5C22 6.5 17.5 2 12 2z" },
                { label: "LinkedIn", icon: "M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14zM8.5 18v-7H6v7h2.5zM7.3 9.8c.8 0 1.4-.7 1.4-1.5 0-.8-.6-1.5-1.4-1.5-.8 0-1.4.7-1.4 1.5 0 .8.6 1.5 1.4 1.5zM18 18v-4c0-2.1-.5-3.3-2.6-3.3-1 0-1.7.5-2 1h-.1v-.9H11v7h2.4v-3.5c0-.9.2-1.8 1.3-1.8s1.1 1 1.1 1.9V18H18z" },
                { label: "YouTube", icon: "M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5 3-5 3z" },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-white border border-slate-200 hover:border-[#7BC53A] hover:bg-[#7BC53A]/5 text-slate-600 hover:text-[#7BC53A] flex items-center justify-center transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-sm font-bold text-slate-900 mb-4">{category}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-slate-600 hover:text-[#7BC53A] transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span>© 2026 Morphis, Inc.</span>
            <span className="hidden md:inline text-slate-300">·</span>
            <span>Made with precision in San Francisco.</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#7BC53A]" />
              SOC 2 Type II
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#7BC53A]" />
              HIPAA
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#7BC53A]" />
              ISO 27001
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#7BC53A]" />
              GDPR
            </span>
          </div>
        </div>
      </div>

      {/* Giant wordmark */}
      <div className="relative overflow-hidden border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-[18vw] lg:text-[15vw] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-200 to-transparent select-none text-center">
            MORPHIS
          </div>
        </div>
      </div>
    </footer>
  )
}
