'use client'

import { Menu, X } from 'lucide-react'

interface HeaderProps {
  userEmail: string
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export function Header({ userEmail, isSidebarOpen, onToggleSidebar }: HeaderProps) {
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

      {/* Page title */}
      <div className="hidden md:block">
        <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
      </div>

      {/* User email */}
      <div className="ml-auto flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#7BC53A]/10 flex items-center justify-center">
          <span className="text-xs font-bold text-[#7BC53A]">
            {userEmail.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm text-slate-600 truncate max-w-[200px] hidden sm:inline-block">
          {userEmail}
        </span>
      </div>
    </header>
  )
}
