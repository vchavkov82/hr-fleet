import { getTranslations } from 'next-intl/server'
import { Link } from '@/navigation'

function ProductMockup() {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-2xl overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary/5 via-white to-accent/5 border-b border-gray-200">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-white/80 rounded-md px-3 py-1.5 text-xs text-gray-500 border border-gray-200 shadow-[0_4px_14px_-8px_rgba(0,0,0,0.2)]">
            app.hr.bg/dashboard
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="flex min-h-[320px] bg-gradient-to-br from-white via-white to-primary/5">
        {/* Sidebar */}
        <div className="w-48 bg-gray-50 border-r border-gray-100 p-4 hidden sm:block">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">HR</span>
            </div>
            <span className="text-xs font-semibold text-navy">HR</span>
          </div>
          <div className="space-y-1">
            {['Dashboard', 'Employees', 'Recruitment', 'Leave', 'Payroll', 'Reviews'].map((item, i) => (
              <div
                key={item}
                className={`px-3 py-2 rounded-lg text-xs font-medium ${
                  i === 0 ? 'bg-primary-50 text-primary' : 'text-gray-500'
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 sm:p-6">
          {/* Header bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-4 w-32 bg-navy/10 rounded mb-1" />
              <div className="h-3 w-48 bg-gray-100 rounded" />
            </div>
            <div className="h-8 w-24 rounded-lg bg-primary/10" />
          </div>

          {/* Stat cards row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Employees', value: '127', color: 'bg-primary/10 text-primary' },
              { label: 'Open roles', value: '12', color: 'bg-accent/10 text-accent-dark' },
              { label: 'On leave', value: '8', color: 'bg-warning/10 text-warning' },
              { label: 'Reviews due', value: '23', color: 'bg-success/10 text-success' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-gray-100 p-3">
                <div className={`text-lg font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Content grid placeholder */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-primary-50/60 border border-primary-100 p-4 h-24 shadow-inner">
              <div className="h-2.5 w-20 bg-primary/20 rounded mb-2" />
              <div className="h-12 w-full bg-primary/10 rounded-lg" />
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 h-24 shadow-inner">
              <div className="h-2.5 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-12 w-full bg-gray-100 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function Hero() {
  const t = await getTranslations('hero')
  const tf = await getTranslations('featuresOverview')

  const companies = [
    'TechCorp', 'BG Solutions', 'Sofiyska Voda', 'DataPro',
    'NovaSoft', 'EuroTech', 'BalkNet', 'DigiServ',
  ]

  const featureHighlights = ['ats', 'employees', 'leave'].map((key) => tf(`items.${key}.title`))

  return (
    <section className="bg-hero-gradient pt-20 pb-16 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-24 top-12 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-0 -top-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-10 bottom-0 h-72 w-72 rounded-full bg-navy/40 blur-3xl" />
      </div>
      <div className="container-xl">
        {/* Two-column hero grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16 relative z-10">
          {/* Left column: text */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-primary/20 shadow-sm px-4 py-1.5 text-sm font-medium text-primary mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {t('badge')}
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-navy leading-[1.1] tracking-tight">
              {t('headline1')}
              <br />
              <span className="bg-brand-gradient bg-clip-text text-transparent">
                {t('headline2')}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-lg">
              {t('subheadline')}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
              <Link href="/auth/sign-up" className="btn-primary px-8 py-4 text-base shadow-lg shadow-primary/25">
                {t('ctaStart')}
              </Link>
              <Link href="/features" className="btn-secondary px-8 py-4 text-base">
                {t('ctaFeatures')}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Trust text */}
            <p className="mt-6 text-sm text-gray-500">{t('trustText')}</p>

            {/* Quick highlights */}
            <div className="mt-6 flex flex-wrap gap-2">
              {featureHighlights.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full bg-white shadow-sm border border-primary/10 px-3 py-1 text-xs font-semibold text-navy"
                >
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right column: product screenshot mockup */}
          <div className="relative">
            <div className="absolute -inset-6 bg-white/20 rounded-3xl blur-3xl" />
            <div className="relative">
              <ProductMockup />
            </div>
          </div>
        </div>

        {/* Trusted companies strip */}
        <div className="mt-20 text-center">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-8">
            {t('trustedBy')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {companies.map((company) => (
              <span
                key={company}
                className="text-lg font-semibold text-gray-300 hover:text-gray-400 transition-colors select-none"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
