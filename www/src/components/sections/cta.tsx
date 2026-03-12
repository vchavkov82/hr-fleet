import { getTranslations } from 'next-intl/server'
import { Link } from '@/navigation'

export default async function CTA() {
  const t = await getTranslations('cta')

  return (
    <section className="py-20 bg-cta-gradient">
      <div className="container-xl text-center">
        <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-4">
          {t('heading')}
        </h2>
        <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
          {t('subheading')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors text-lg font-medium cursor-pointer"
          >
            {t('ctaStart')}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white border-2 border-white/40 rounded-lg hover:bg-white hover:text-primary transition-colors text-lg font-medium cursor-pointer"
          >
            {t('ctaContact')}
          </Link>
        </div>
      </div>
    </section>
  )
}
