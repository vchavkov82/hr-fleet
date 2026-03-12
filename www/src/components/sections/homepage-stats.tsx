import { getTranslations } from 'next-intl/server'

const STAT_KEYS = ['companies', 'hired', 'satisfaction', 'faster'] as const

export default async function HomepageStats() {
  const t = await getTranslations('stats')
  const items = STAT_KEYS.map((key) => ({
    value: t.raw(`items.${key}.value`) as number,
    suffix: t(`items.${key}.suffix`),
    label: t(`items.${key}.label`),
  }))

  return (
    <section className="py-16 bg-white border-y border-gray-200">
      <div className="container-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-4xl font-bold font-heading text-navy">
                {item.value.toLocaleString()}{item.suffix}
              </p>
              <p className="mt-2 text-gray-600">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
