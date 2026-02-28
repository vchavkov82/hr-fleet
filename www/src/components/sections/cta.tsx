import { getTranslations } from 'next-intl/server'
import { Link } from '@/navigation'

export default async function CTA() {
  const t = await getTranslations('cta')

  return (
    <section className="py-24">
      <div className="container-xl">
        <div className="rounded-3xl bg-primary p-12 md:p-16 text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" aria-hidden="true" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5" aria-hidden="true" />

          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold font-heading text-white leading-tight text-balance">
              {t('heading')}
            </h2>
            <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto">
              {t('subheading')}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-primary px-8 py-4 text-base font-semibold shadow-lg hover:bg-blue-50 transition-colors"
              >
                {t('ctaStart')}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 text-white px-8 py-4 text-base font-semibold hover:bg-white/10 transition-colors"
              >
                {t('ctaContact')}
              </Link>
            </div>
            <p className="mt-6 text-sm text-blue-200">{t('trustText')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
