import { getTranslations } from 'next-intl/server'

export default async function TrustedCompanies() {
  const t = await getTranslations('trustedCompanies')
  const companies = t.raw('companies') as string[]

  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="container-xl">
        <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-widest mb-8">
          {t('label')}
        </p>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {companies.map((name) => (
            <div
              key={name}
              className="rounded-lg bg-gray-50 px-6 py-3 text-gray-400 font-medium text-sm select-none"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
