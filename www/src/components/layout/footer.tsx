import { getTranslations } from 'next-intl/server'
import { Link } from '@/navigation'

const TRUST_BADGES = [
  { label: 'SOC 2', icon: '🛡️' },
  { label: 'GDPR', icon: '🔒' },
  { label: 'ISO 27001', icon: '✅' },
]

export default async function Footer() {
  const t = await getTranslations('footer')

  const columns = [
    {
      key: 'product',
      label: t('columns.product.label'),
      links: [
        { label: t('columns.product.ats'), href: '/features#ats' },
        { label: t('columns.product.employees'), href: '/features#employees' },
        { label: t('columns.product.leave'), href: '/features#leave' },
        { label: t('columns.product.payroll'), href: '/features#payroll' },
        { label: t('columns.product.performance'), href: '/features#performance' },
      ],
    },
    {
      key: 'resources',
      label: t('columns.resources.label'),
      links: [
        { label: t('columns.resources.blog'), href: '/blog' },
        { label: t('columns.resources.hrTools'), href: '/hr-tools' },
        { label: t('columns.resources.helpCenter'), href: '/help-center' },
      ],
    },
    {
      key: 'company',
      label: t('columns.company.label'),
      links: [
        { label: t('columns.company.about'), href: '/about' },
        { label: t('columns.company.careers'), href: '/careers' },
        { label: t('columns.company.partners'), href: '/partners' },
        { label: t('columns.company.contact'), href: '/contact' },
      ],
    },
    {
      key: 'legal',
      label: t('columns.legal.label'),
      links: [
        { label: t('columns.legal.terms'), href: '/terms' },
        { label: t('columns.legal.privacy'), href: '/privacy' },
        { label: t('columns.legal.cookies'), href: '/cookies' },
        { label: t('columns.legal.gdpr'), href: '/gdpr' },
      ],
    },
  ]

  return (
    <footer className="bg-navy text-white">
      <div className="container-xl py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-xl font-heading">
              <span className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-sm font-bold">
                HR
              </span>
              HR
            </Link>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">{t('tagline')}</p>
            <div className="mt-6 flex gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-navy-light flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-colors" aria-label="LinkedIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-navy-light flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-colors" aria-label="Twitter/X">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-navy-light flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((column) => (
            <div key={column.key}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                {column.label}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-gray-300 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-12 pt-8 border-t border-navy-light">
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            {TRUST_BADGES.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-navy-light text-sm text-gray-300">
                <span>{badge.icon}</span>
                <span className="font-medium">{badge.label} {t('compliant')}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} HR. {t('copyright')}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <Link href="/terms" className="hover:text-gray-300 transition-colors">{t('bottomLinks.terms')}</Link>
              <Link href="/privacy" className="hover:text-gray-300 transition-colors">{t('bottomLinks.privacy')}</Link>
              <Link href="/cookies" className="hover:text-gray-300 transition-colors">{t('bottomLinks.cookies')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
