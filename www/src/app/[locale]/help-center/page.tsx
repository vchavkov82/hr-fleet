import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { routing } from '@/i18n/routing'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'helpCenter' })
  return { title: t('metaTitle'), description: t('metaDescription') }
}

const CATEGORIES = [
  { key: 'gettingStarted', iconPath: 'M13 10V3L4 14h7v7l9-11h-7z', articles: 8 },
  { key: 'employees', iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', articles: 12 },
  { key: 'hrTools', iconPath: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', articles: 6 },
  { key: 'compliance', iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', articles: 4 },
  { key: 'account', iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', articles: 5 },
] as const

const POPULAR_ARTICLES = [
  { id: 'getting-started', key: 'article1' },
  { id: 'employee-directory', key: 'article2' },
  { id: 'salary-calculator', key: 'article3' },
  { id: 'freelancer-comparison', key: 'article4' },
  { id: 'dashboard-overview', key: 'article5' },
  { id: 'tax-social-security', key: 'article6' },
] as const

const QUICK_LINKS = [
  { key: 'gettingStarted', href: '/help-center/categories/getting-started', emoji: '🚀' },
  { key: 'userGuide', href: '/help-center/categories/getting-started', emoji: '📖' },
  { key: 'troubleshooting', href: '/help-center/categories/account', emoji: '🔧' },
  { key: 'contact', href: '/help-center/contact', emoji: '💬' },
] as const

export default async function HelpCenterPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('helpCenter')

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-navy-deep text-white py-16 sm:py-20">
        <div className="container-xl text-center">
          <h1 className="text-4xl font-bold font-heading sm:text-5xl mb-4">
            {t('hero.heading')}
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto mb-8">
            {t('hero.subheading')}
          </p>
          {/* Search bar */}
          <div className="max-w-2xl mx-auto">
            <form action={`/${locale}/help-center/search`} method="get" className="relative" aria-label={t('hero.searchAriaLabel')}>
              <input
                type="search"
                name="q"
                placeholder={t('hero.searchPlaceholder')}
                className="w-full px-6 py-4 pr-14 rounded-xl text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-base"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-primary/80 transition-colors"
                aria-label={t('hero.searchButtonLabel')}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-surface-light border-b border-gray-100" aria-labelledby="help-quick-links-heading">
        <div className="container-xl">
          <h2 id="help-quick-links-heading" className="sr-only">
            {t('quickLinks.sectionLabel')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {QUICK_LINKS.map(({ key, href, emoji }) => (
              <Link
                key={key}
                href={href}
                className="bg-white rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-all hover:border-primary/20 border border-gray-100 group"
              >
                <div className="text-3xl mb-3">{emoji}</div>
                <div className="font-semibold text-navy text-sm group-hover:text-primary transition-colors">
                  {t(`quickLinks.${key}.title`)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {t(`quickLinks.${key}.description`)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-16 sm:py-20" aria-labelledby="help-categories-heading">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 id="help-categories-heading" className="text-2xl font-bold font-heading text-navy sm:text-3xl">
              {t('categories.title')}
            </h2>
            <p className="mt-3 text-gray-600">{t('categories.subheading')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map(({ key, iconPath, articles }) => (
              <Link
                key={key}
                href={`/help-center/categories/${key}`}
                className="group flex items-start gap-4 p-6 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all bg-white"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-navy group-hover:text-primary transition-colors">
                    {t(`categories.${key}.title`)}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {articles} {t('categories.articlesCount')}
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 sm:py-20 bg-surface-light">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold font-heading text-navy sm:text-3xl">
              {t('popular.title')}
            </h2>
            <p className="mt-3 text-gray-600">{t('popular.subheading')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {POPULAR_ARTICLES.map(({ id, key }) => {
              const article = t.raw(`popular.articles.${key}`) as {
                title: string
                description: string
                category: string
                readTime: string
              }
              return (
                <Link
                  key={id}
                  href={`/help-center/articles/${id}`}
                  className="group flex gap-4 p-5 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-sm transition-all bg-white"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-navy group-hover:text-primary transition-colors text-sm leading-snug">
                      {article.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{article.description}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-primary font-medium bg-primary-50 px-2 py-0.5 rounded-full">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-400">{article.readTime}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 sm:py-20">
        <div className="container-xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold font-heading text-navy sm:text-3xl">
              {t('stillNeedHelp.title')}
            </h2>
            <p className="mt-3 text-gray-600 max-w-lg mx-auto">{t('stillNeedHelp.description')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {/* Live Chat */}
            <div className="text-center p-6 rounded-xl border border-gray-200 bg-white">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="font-semibold text-navy mb-1">{t('stillNeedHelp.options.liveChat.title')}</div>
              <div className="text-sm text-gray-600 mb-4">{t('stillNeedHelp.options.liveChat.description')}</div>
              <button className="text-sm font-medium text-primary hover:underline">
                {t('stillNeedHelp.options.liveChat.button')}
              </button>
            </div>

            {/* Email Support */}
            <div className="text-center p-6 rounded-xl border border-gray-200 bg-white">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="font-semibold text-navy mb-1">{t('stillNeedHelp.options.email.title')}</div>
              <div className="text-sm text-gray-600 mb-4">{t('stillNeedHelp.options.email.description')}</div>
              <a href="mailto:support@hr.bg" className="text-sm font-medium text-primary hover:underline">
                support@hr.bg
              </a>
            </div>

            {/* Book a Demo */}
            <div className="text-center p-6 rounded-xl border border-gray-200 bg-white">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="font-semibold text-navy mb-1">{t('stillNeedHelp.options.demo.title')}</div>
              <div className="text-sm text-gray-600 mb-4">{t('stillNeedHelp.options.demo.description')}</div>
              <Link href="/auth/sign-up" className="text-sm font-medium text-primary hover:underline">
                {t('stillNeedHelp.options.demo.button')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
