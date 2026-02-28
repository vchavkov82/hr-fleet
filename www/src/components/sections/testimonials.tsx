import { getTranslations } from 'next-intl/server'

export default async function Testimonials() {
  const t = await getTranslations('testimonials')
  const items = t.raw('items') as Array<{
    quote: string
    author: string
    role: string
    company: string
    avatar: string
  }>

  return (
    <section className="py-24 bg-gray-50">
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
              key={item.author}
              className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 flex flex-col relative overflow-hidden"
            >
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-70" aria-hidden="true" />
              <span className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-primary/5 blur-xl" aria-hidden="true" />

              {/* Quote icon */}
              <svg
                className="w-8 h-8 text-primary/20 mb-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 32 32"
              >
                <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
              </svg>

              {/* Quote text */}
              <blockquote className="text-gray-700 leading-relaxed flex-1 mb-6">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              {/* Star rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                  {item.avatar}
                </div>
                <div>
                  <p className="font-semibold text-navy">{item.author}</p>
                  <p className="text-sm text-gray-500">{item.role}</p>
                  <p className="text-sm text-gray-400">{item.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
