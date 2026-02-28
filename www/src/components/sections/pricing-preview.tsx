import { getTranslations } from 'next-intl/server'
import { Link } from '@/navigation'

const MODULE_PREVIEW_KEYS = ['coreHr', 'ats', 'leave'] as const

export default async function PricingPreview() {
  const t = await getTranslations('pricingPreview')

  return (
    <section className="py-24 bg-white">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {MODULE_PREVIEW_KEYS.map((key) => {
            const features = t.raw(`modules.${key}.features`) as string[]

            return (
              <div
                key={key}
                className="rounded-2xl p-6 flex flex-col bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold font-heading text-navy">
                    {t(`modules.${key}.name`)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {t(`modules.${key}.description`)}
                  </p>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <svg
                        className="w-4 h-4 flex-shrink-0 text-primary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing#quote"
                  className="block text-center rounded-xl py-2.5 text-sm font-semibold transition-colors bg-primary text-white hover:bg-primary-dark"
                >
                  {t('getQuote')}
                </Link>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <Link href="/pricing" className="btn-ghost text-sm">
            {t('seeAllModules')}
          </Link>
        </div>
      </div>
    </section>
  )
}
