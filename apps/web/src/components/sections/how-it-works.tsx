import { getTranslations } from 'next-intl/server'

const STEP_KEYS = ['signup', 'import', 'manage'] as const

export default async function HowItWorks() {
  const t = await getTranslations('howItWorks')

  const steps = STEP_KEYS.map((key, i) => ({
    step: String(i + 1),
    title: t(`steps.${key}.title`),
    description: t(`steps.${key}.description`),
  }))

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50">
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

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line (desktop) */}
          <div
            className="hidden md:block absolute top-12 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20"
            aria-hidden="true"
          />

          {/* Connecting line (mobile) */}
          <div className="md:hidden absolute left-6 top-10 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-primary/20 to-primary/0" aria-hidden="true" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((item) => (
              <div key={item.step} className="relative flex md:flex-col items-start md:items-center text-left md:text-center">
                <div className="relative z-10 w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-primary/20 mb-4 md:mb-6">
                  <span className="text-xl md:text-2xl font-bold font-heading text-white">{item.step}</span>
                </div>
                <div className="md:-mt-1">
                  <h3 className="text-lg font-bold font-heading text-navy mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
