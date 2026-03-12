import { getTranslations } from 'next-intl/server'
import { Link } from '@/navigation'

export default async function Hero() {
  const t = await getTranslations('hero')

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              {t('headline1')}{' '}
              {t('headline2')}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600">
              {t('subheadline')}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                {t('ctaStart')}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-lg font-medium"
              >
                {t('ctaFeatures')}
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              {t('trustText')}
            </p>
          </div>
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1758518732175-5d608ba3abdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHRlYW0lMjBtZWV0aW5nfGVufDF8fHx8MTc3MzMwNTE2Mnww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="HR Team Collaboration"
                className="w-full h-auto"
                loading="eager"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-600 rounded-full opacity-20 blur-3xl" />
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-600 rounded-full opacity-20 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
