import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/navigation'

export default async function Hero() {
  const t = await getTranslations('hero')

  return (
    <section className="relative bg-hero-gradient py-20 sm:py-32">
      <div className="container-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-navy leading-tight">
              {t('headline1')}{' '}
              {t('headline2')}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600">
              {t('subheadline')}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-lg font-medium cursor-pointer"
              >
                {t('ctaStart')}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-navy border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-lg font-medium cursor-pointer"
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
              <Image
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1080&auto=format&fit=crop&q=80"
                alt="HR team collaborating in a modern office"
                width={1080}
                height={720}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary rounded-full opacity-20 blur-3xl" />
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent rounded-full opacity-20 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
