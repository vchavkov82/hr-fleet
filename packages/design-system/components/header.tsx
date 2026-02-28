import React from 'react'
import { clsx } from 'clsx'
import Link from 'next/link'

interface NavLink {
  label: string
  href: string
}

interface NavSection {
  label: string
  items: { label: string; href: string; desc?: string }[]
}

interface HeaderProps {
  logo?: React.ReactNode
  title?: string
  nav?: NavLink[]
  navSections?: NavSection[]
  cta?: { label: string; href: string }
  sticky?: boolean
  theme?: 'light' | 'dark'
}

export const Header: React.FC<HeaderProps> = ({
  logo,
  title = 'HR',
  nav = [],
  sticky = true,
  theme = 'light',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const headerClasses = clsx(
    'border-b',
    sticky && 'sticky top-0 z-50',
    theme === 'light'
      ? 'bg-white border-gray-200'
      : 'bg-navy-deep border-navy-light'
  )

  const textClasses = theme === 'light' ? 'text-navy' : 'text-white'

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            {logo || (
              <>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white bg-brand-gradient">
                  HR
                </div>
                <span className={clsx('font-bold text-xl', textClasses)}>
                  {title}
                </span>
              </>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'text-sm font-medium transition-colors',
                  theme === 'light'
                    ? 'text-gray-600 hover:text-primary'
                    : 'text-gray-300 hover:text-white'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'text-sm font-medium transition-colors px-4 py-2 rounded-lg',
                  theme === 'light'
                    ? 'text-gray-600 hover:bg-primary-50'
                    : 'text-gray-300 hover:bg-navy-light'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
