import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { routing } from '@/i18n/routing'
import { getAllPosts } from '@/lib/blog'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  return { title: t('metaTitle'), description: t('metaDescription') }
}

const CATEGORY_COLORS: Record<string, string> = {
  'Технологии': 'bg-blue-50 text-blue-700',
  Technology: 'bg-blue-50 text-blue-700',
  'Employer Branding': 'bg-purple-50 text-purple-700',
  'Онбординг': 'bg-green-50 text-green-700',
  Onboarding: 'bg-green-50 text-green-700',
  'Заплащане': 'bg-yellow-50 text-yellow-700',
  Compensation: 'bg-yellow-50 text-yellow-700',
  'Правни въпроси': 'bg-red-50 text-red-700',
  Legal: 'bg-red-50 text-red-700',
  'Remote работа': 'bg-teal-50 text-teal-700',
  'Remote Work': 'bg-teal-50 text-teal-700',
}

function formatDate(value: string, locale: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const formatLocale = locale === 'bg' ? 'bg-BG' : 'en-US'
  return new Intl.DateTimeFormat(formatLocale, { dateStyle: 'medium' }).format(date)
}
export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('blog')
  const posts = await getAllPosts(locale)
  const featured = posts.filter((post) => post.data.featured)
  const recent = posts.filter((post) => !post.data.featured)

  return (
    <div className="py-20">
      <div className="container-xl">
        <div className="text-center mb-16">
          <span className="section-label">{t('sectionLabel')}</span>
          <h1 className="mt-4 text-4xl font-bold font-heading text-navy sm:text-5xl">
            {t('heading')}
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subheading')}
          </p>
        </div>

        {featured.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-navy">
                {t('featuredHeading')}
              </h2>
              <Link href={`/${locale}/blog`} className="text-sm font-semibold text-primary hover:underline">
                {t('viewAll')}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((post) => (
                <article key={`${post.locale}-${post.slug}`} className="card overflow-hidden group">
                  <div className="h-2 bg-brand-gradient" />
                  <div className="p-6 flex flex-col gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {(post.data.tags || []).slice(0, 1).map((tag) => (
                        <span
                          key={tag}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[tag] ?? 'bg-gray-100 text-gray-700'}`}
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="text-xs text-gray-400">
                        {post.readTimeMinutes} {t('readTime')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-heading text-navy leading-snug group-hover:text-primary transition-colors">
                      <Link href={`/${locale}/blog/${post.slug}`}>{post.data.title}</Link>
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{post.data.description}</p>
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-navy">{post.data.author}</p>
                        <p className="text-xs text-gray-400">{formatDate(post.data.pubDatetime, locale)}</p>
                      </div>
                      <Link href={`/${locale}/blog/${post.slug}`} className="text-sm font-medium text-primary hover:underline">
                        {t('readMore')}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-navy mb-6">
            {t('recentHeading')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recent.map((post) => (
              <article key={`${post.locale}-${post.slug}`} className="card overflow-hidden group">
                <div className="h-2 bg-brand-gradient" />
                <div className="p-6 flex flex-col gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(post.data.tags || []).slice(0, 1).map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[tag] ?? 'bg-gray-100 text-gray-700'}`}
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="text-xs text-gray-400">
                      {post.readTimeMinutes} {t('readTime')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-heading text-navy leading-snug group-hover:text-primary transition-colors">
                    <Link href={`/${locale}/blog/${post.slug}`}>{post.data.title}</Link>
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{post.data.description}</p>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-navy">{post.data.author}</p>
                      <p className="text-xs text-gray-400">{formatDate(post.data.pubDatetime, locale)}</p>
                    </div>
                    <Link href={`/${locale}/blog/${post.slug}`} className="text-sm font-medium text-primary hover:underline">
                      {t('readMore')}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
