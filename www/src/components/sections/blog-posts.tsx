import { getTranslations } from 'next-intl/server'
import { Link } from '@/navigation'

export default async function BlogPosts() {
  const t = await getTranslations('blogPosts')
  const items = t.raw('items') as Array<{
    title: string
    excerpt: string
    category: string
    image?: string
    href: string
  }>

  return (
    <section className="py-24 bg-gradient-to-b from-white via-white to-gray-50">
      <div className="container-xl">
        <div className="text-center mb-16">
          <span className="section-label">{t('sectionLabel')}</span>
          <h2 className="mt-4 text-4xl font-bold font-heading text-navy sm:text-5xl">
            {t('heading')}
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subheading')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white"
            >
              {item.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/9] w-full object-cover"
                />
              ) : (
                <div className="aspect-[16/9] bg-gradient-to-br from-primary-50 via-primary-100 to-accent/20" />
              )}

              <div className="p-6">
                <span className="inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary mb-3">
                  {item.category}
                </span>
                <h3 className="text-lg font-bold font-heading text-navy mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {item.excerpt}
                </p>
                <Link
                  href={item.href as '/blog'}
                  className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  {t('readMore')}
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/blog" className="btn-secondary">
            {t('viewAll')}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
