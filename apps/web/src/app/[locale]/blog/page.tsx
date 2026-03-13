import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { routing } from '@/i18n/routing'
import { getAllPosts } from '@/lib/blog'
import { BlogImage } from '@/components/blog/BlogImage'

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

const TAG_COLORS: Record<string, string> = {
  ai: 'bg-blue-100 text-blue-700',
  'hybrid-work': 'bg-purple-100 text-purple-700',
  wellbeing: 'bg-green-100 text-green-700',
  'remote-work': 'bg-teal-100 text-teal-700',
  engagement: 'bg-orange-100 text-orange-700',
  announcement: 'bg-gray-100 text-gray-700',
  'hr-trends': 'bg-indigo-100 text-indigo-700',
  'employer-branding': 'bg-pink-100 text-pink-700',
  diversity: 'bg-violet-100 text-violet-700',
  onboarding: 'bg-emerald-100 text-emerald-700',
  analytics: 'bg-cyan-100 text-cyan-700',
  compliance: 'bg-red-100 text-red-700',
  retention: 'bg-amber-100 text-amber-700',
  'performance-management': 'bg-lime-100 text-lime-700',
  'workforce-planning': 'bg-sky-100 text-sky-700',
  freelancer: 'bg-orange-100 text-orange-700',
  'employee-management': 'bg-blue-100 text-blue-700',
  'salary-calculator': 'bg-emerald-100 text-emerald-700',
  eood: 'bg-amber-100 text-amber-700',
  'social-security': 'bg-red-100 text-red-700',
  'bulgarian-labor-law': 'bg-rose-100 text-rose-700',
}

function formatDate(value: string, locale: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const formatLocale = locale === 'bg' ? 'bg-BG' : 'en-US'
  return new Intl.DateTimeFormat(formatLocale, { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
}

function BlogCard({
  post,
  locale,
  readMore,
  readTime,
}: {
  post: { slug: string; locale: string; readTimeMinutes: number; data: { title: string; description: string; author: string; pubDatetime: string; tags?: string[]; featuredImage?: string } }
  locale: string
  readMore: string
  readTime: string
}) {
  const firstTag = post.data.tags?.[0]

  return (
    <article className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all">
      <Link href={`/${locale}/blog/${post.slug}`} className="block h-full">
        {post.data.featuredImage ? (
          <BlogImage
            src={post.data.featuredImage}
            alt={post.data.title}
            loading="lazy"
            className="aspect-video w-full object-cover"
          />
        ) : (
          <div className="aspect-video bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        )}
        <div className="p-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {firstTag && (
              <span className={`px-2 py-1 rounded text-xs font-medium ${TAG_COLORS[firstTag] ?? 'bg-gray-100 text-gray-700'}`}>
                {firstTag}
              </span>
            )}
            <span className="text-xs text-gray-500">
              {post.readTimeMinutes} {readTime}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.data.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {post.data.description}
          </p>
          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {post.data.author?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'HR'}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">{post.data.author}</p>
                <p className="text-xs text-gray-500">{formatDate(post.data.pubDatetime, locale)}</p>
              </div>
            </div>
            <span className="text-sm font-medium text-blue-600">
              {readMore}
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{ tag?: string }>
}) {
  const { locale } = await params
  const { tag } = (await (searchParams ?? Promise.resolve({}))) as { tag?: string }
  setRequestLocale(locale)
  const t = await getTranslations('blog')
  const posts = await getAllPosts(locale)
  const filteredPosts = tag
    ? posts.filter((post) => post.data.tags?.includes(tag))
    : posts
  const featured = filteredPosts.filter((post) => post.data.featured)
  const recent = filteredPosts.filter((post) => !post.data.featured)

  return (
    <div>
      {/* Blog Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-sm font-medium text-blue-600 mb-2">{t('sectionLabel')}</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {t('heading')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('subheading')}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured Articles */}
        {featured.length > 0 && (
          <section className="py-16">
            <div className="flex items-center justify-between gap-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {t('featuredHeading')}
              </h2>
              {tag && (
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  <span>{t('tagFilterLabel', { tag })}</span>
                </span>
              )}
              <Link href={`/${locale}/blog`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                {t('viewAll')}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((post) => (
                <BlogCard
                  key={`${post.locale}-${post.slug}`}
                  post={post}
                  locale={locale}
                  readMore={t('readMore')}
                  readTime={t('readTime')}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recent Articles */}
        {recent.length > 0 && (
          <section className="py-12 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {t('recentHeading')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recent.map((post) => (
                <BlogCard
                  key={`${post.locale}-${post.slug}`}
                  post={post}
                  locale={locale}
                  readMore={t('readMore')}
                  readTime={t('readTime')}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Newsletter CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get the latest HR insights and tips delivered to your inbox every week
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
