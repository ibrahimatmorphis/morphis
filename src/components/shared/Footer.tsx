import Link from 'next/link'

const footerLinks = [
  { href: '/', label: 'Home' },
  { href: '/who-we-are', label: 'Who We Are' },
  { href: '/contact', label: 'Contact' },
  { href: '/pricing', label: 'Pricing' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="text-lg font-bold text-morphis-primary">
              Morphis
            </span>
            <p className="text-xs text-muted-foreground">
              AI-First Hot-Deploy UI Infrastructure
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-6 border-t border-border pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Morphis. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
