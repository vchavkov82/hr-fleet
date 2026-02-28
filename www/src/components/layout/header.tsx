'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@/navigation'
import { clsx } from 'clsx'

function Dropdown({
  id,
  items,
  open,
  labelledBy,
}: {
  id: string
  items: { label: string; href: string; desc: string }[]
  open: boolean
  labelledBy: string
}) {
  return (
    <div
      id={id}
      role="menu"
      aria-labelledby={labelledBy}
      className={clsx(
        'absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 rounded-2xl bg-white border border-gray-100 shadow-xl p-2 transition-all duration-200',
        open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
      )}
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          role="menuitem"
          className="block rounded-xl px-4 py-3 hover:bg-primary-50 transition-colors group"
        >
          <div className="text-sm font-semibold text-navy group-hover:text-primary">{item.label}</div>
          <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
        </Link>
      ))}
    </div>
  )
}

function NavDropdown({
  id,
  label,
  items,
  pathname,
}: {
  id: string
  label: string
  items: { label: string; href: string; desc: string }[]
  pathname: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isActive = items.some((item) => pathname.startsWith(item.href.split('#')[0]) && item.href.split('#')[0] !== '#')
  const buttonId = `${id}-button`
  const menuId = `${id}-menu`

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={buttonId}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false)
          if (e.key === 'ArrowDown') setOpen(true)
        }}
        className={clsx(
          'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive ? 'text-primary' : 'text-gray-600 hover:text-navy'
        )}
      >
        {label}
        <svg className={clsx('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <Dropdown id={menuId} labelledBy={buttonId} items={items} open={open} />
    </div>
  )
}

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
            'px-2.5 py-1 rounded-md text-xs font-semibold uppercase transition-colors',
            currentLocale === locale
              ? 'bg-primary text-white'
              : 'text-gray-500 hover:text-navy'
          )}
        >
          {locale}
        </button>
      ))}
    </div>
  )
}

export default function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [featuresOpen, setFeaturesOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const pathname = usePathname()

  const FEATURES_ITEMS = [
    { label: t('featuresItems.ats'), href: '/features#ats', desc: t('featuresItems.atsDesc') },
    { label: t('featuresItems.employees'), href: '/features#employees', desc: t('featuresItems.employeesDesc') },
    { label: t('featuresItems.leave'), href: '/features#leave', desc: t('featuresItems.leaveDesc') },
    { label: t('featuresItems.payroll'), href: '/features#payroll', desc: t('featuresItems.payrollDesc') },
    { label: t('featuresItems.performance'), href: '/features#performance', desc: t('featuresItems.performanceDesc') },
    { label: t('featuresItems.onboarding'), href: '/features#onboarding', desc: t('featuresItems.onboardingDesc') },
  ]

  const RESOURCES_ITEMS = [
    { label: t('resources.blog'), href: '/blog', desc: t('resourcesItems.blogDesc') },
    { label: t('resources.hrTools'), href: '/hr-tools', desc: t('resourcesItems.hrToolsDesc') },
    { label: t('resources.helpCenter'), href: '/help-center', desc: t('resourcesItems.helpCenterDesc') },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="container-xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <span className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white text-sm font-bold" aria-hidden="true">
              HR
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            <NavDropdown id="features" label={t('features')} items={FEATURES_ITEMS} pathname={pathname} />
            <NavDropdown id="resources" label={t('resources.label')} items={RESOURCES_ITEMS} pathname={pathname} />
            <Link
              href="/pricing"
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === '/pricing' ? 'text-primary' : 'text-gray-600 hover:text-navy'
              )}
            >
              {t('pricing')}
            </Link>
          </nav>

          {/* Desktop CTAs + Language Switcher */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher currentLocale={locale} />
            <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-navy transition-colors px-4 py-2">
              {t('login')}
            </Link>
            <Link href="/auth/sign-up" className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
              {t('startFree')}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="container-xl py-4 flex flex-col gap-1">
            {/* Language switcher mobile */}
            <div className="px-4 py-2">
              <LanguageSwitcher currentLocale={locale} />
            </div>

            {/* Features section */}
            <button
              type="button"
              onClick={() => setFeaturesOpen(!featuresOpen)}
              className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('features')}
              <svg className={clsx('w-4 h-4 transition-transform', featuresOpen && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {featuresOpen && (
              <div className="pl-4 flex flex-col gap-1">
                {FEATURES_ITEMS.map((item) => (
                  <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-primary rounded-lg hover:bg-primary-50">
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Resources section */}
            <button
              type="button"
              onClick={() => setResourcesOpen(!resourcesOpen)}
              className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('resources.label')}
              <svg className={clsx('w-4 h-4 transition-transform', resourcesOpen && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {resourcesOpen && (
              <div className="pl-4 flex flex-col gap-1">
                {RESOURCES_ITEMS.map((item) => (
                  <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-primary rounded-lg hover:bg-primary-50">
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            <Link href="/pricing" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              {t('pricing')}
            </Link>

            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2 mt-2">
              <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="btn-secondary py-2.5 text-sm w-full">
                {t('login')}
              </Link>
              <Link href="/auth/sign-up" onClick={() => setMobileOpen(false)} className="bg-primary text-white py-2.5 rounded-lg text-sm font-semibold text-center w-full hover:opacity-90 transition-opacity">
                {t('startFree')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
