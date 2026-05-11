'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, Users, LifeBuoy, LogOut } from 'lucide-react'
import { logout } from '@/actions/auth'

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navLinks = [
  { href: '/admin', label: 'Tenants', icon: Building2 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/support', label: 'Support', icon: LifeBuoy },
]

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 flex flex-col
          bg-white border-r border-slate-200
          transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo + Admin branding */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <img src="/mainlogo.png" alt="Morphis" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold text-slate-900 tracking-tight">Morphis</span>
          </div>
          <p className="text-xs font-medium text-slate-500">Admin Panel</p>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                  transition-colors duration-200
                  ${
                    active
                      ? 'bg-[#7BC53A]/10 text-[#65A330]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }
                `}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{link.label}</span>
                {active && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-[#7BC53A]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-slate-200">
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
