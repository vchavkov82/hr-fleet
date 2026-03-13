'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@/navigation'
import { clsx } from 'clsx'
import { useModal } from '@/components/modals/modal-provider'

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
  { key: 'docs', href: 'https://docs.jobshr.com/' as const, isExternal: true },
  { key: 'about', href: '/about' as const },
  { key: 'helpCenter', href: '/help-center' as const },
  { key: 'contact', href: '/contact' as const },
]

export default function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { openLogin, openSignUp, openContact } = useModal()

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
            <span className="text-xl font-semibold text-gray-900">HR Service</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : !('isExternal' in link) && pathname.startsWith(link.href)
              if (link.key === 'contact') {
                return (
                  <button
                    key={link.key}
                    type="button"
                    onClick={openContact}
                    className={clsx(
                      'text-sm transition-colors cursor-pointer',
                      isActive ? 'text-primary font-medium' : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    {t(link.key)}
                  </button>
                )
              }
              if ('isExternal' in link) {
                return (
                  <a
                    key={link.key}
                    href={link.href}
                    className="text-sm transition-colors text-gray-600 hover:text-gray-900"
                  >
                    {t(link.key)}
                  </a>
                )
              }
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  className={clsx(
                    'text-sm transition-colors',
                    isActive ? 'text-primary font-medium' : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {t(link.key)}
                </Link>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher currentLocale={locale} />
            <button
              type="button"
              onClick={openLogin}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              {t('signIn')}
            </button>
            <button
              type="button"
              onClick={() => openSignUp()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium cursor-pointer"
            >
              {t('getStarted')}
            </button>
          </div>

          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
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
        <div className="md:hidden border-t border-gray-200 bg-white" id="mobile-menu" aria-hidden={!mobileOpen}>
          <div className="px-4 py-4 space-y-3">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : !('isExternal' in link) && pathname.startsWith(link.href)
              if (link.key === 'contact') {
                return (
                  <button
                    key={link.key}
                    type="button"
                    onClick={() => { setMobileOpen(false); openContact() }}
                    className={clsx(
                      'block w-full text-left px-4 py-2 rounded-lg cursor-pointer',
                      isActive ? 'bg-primary-50 text-primary' : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    {t(link.key)}
                  </button>
                )
              }
              if ('isExternal' in link) {
                return (
                  <a
                    key={link.key}
                    href={link.href}
                    className="block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t(link.key)}
                  </a>
                )
              }
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
              <button
                type="button"
                onClick={() => { setMobileOpen(false); openLogin() }}
                className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                {t('signIn')}
              </button>
              <button
                type="button"
                onClick={() => { setMobileOpen(false); openSignUp() }}
                className="block w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-center cursor-pointer"
              >
                {t('getStarted')}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
