'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@/navigation'
import { clsx } from 'clsx'

function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(locale: string) {
    router.replace(pathname, { locale })
  }

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 p-0.5">
      {(['en', 'bg'] as const).map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchLocale(locale)}
          className={clsx(
            'px-2.5 py-1 rounded-md text-xs font-semibold uppercase transition-colors cursor-pointer',
            currentLocale === locale
              ? 'bg-primary text-white'
              : 'text-gray-500 hover:text-gray-900'
          )}
        >
          {locale}
        </button>
      ))}
    </div>
  )
}

const NAV_LINKS = [
  { key: 'home', href: '/' as const },
  { key: 'features', href: '/features' as const },
  { key: 'pricing', href: '/pricing' as const },
  { key: 'blog', href: '/blog' as const },
  { key: 'about', href: '/about' as const },
  { key: 'helpCenter', href: '/help-center' as const },
  { key: 'contact', href: '/contact' as const },
]

export default function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const isHelpCenterRoute =
    pathname.startsWith('/en/help-center') || pathname.startsWith('/bg/help-center')

  if (isHelpCenterRoute) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container-xl">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-navy">HR Service</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  className={clsx(
                    'text-sm transition-colors',
                    isActive ? 'text-primary font-medium' : 'text-gray-600 hover:text-navy'
                  )}
                >
                  {t(link.key)}
                </Link>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher currentLocale={locale} />
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-navy transition-colors">
              {t('login')}
            </Link>
            <Link
              href="/auth/sign-up"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium cursor-pointer"
            >
              {t('startFree')}
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-gray-600 hover:text-navy cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  className={clsx(
                    'block px-4 py-2 rounded-lg',
                    isActive ? 'bg-primary-50 text-primary' : 'text-gray-600 hover:bg-gray-50'
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {t(link.key)}
                </Link>
              )
            })}
            <div className="pt-3 border-t border-gray-200 space-y-2">
              <div className="px-4 py-2">
                <LanguageSwitcher currentLocale={locale} />
              </div>
              <Link
                href="/auth/login"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                {t('login')}
              </Link>
              <Link
                href="/auth/sign-up"
                className="block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-center"
                onClick={() => setMobileOpen(false)}
              >
                {t('startFree')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
