'use client'

import { Menu, X, Shield } from 'lucide-react'

interface AdminHeaderProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export function AdminHeader({ isSidebarOpen, onToggleSidebar }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-slate-200">
      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Title */}
      <div className="hidden md:block">
        <h1 className="text-lg font-semibold text-slate-900">Admin Dashboard</h1>
      </div>

      {/* Admin badge */}
      <div className="ml-auto flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#7BC53A]/10 text-[#65A330] border border-[#7BC53A]/20">
          <Shield className="h-3.5 w-3.5" />
          Superadmin
        </span>
      </div>
    </header>
  )
}
