import { getTranslations } from 'next-intl/server'
import { Link } from '@/navigation'

export default async function Footer() {
  const t = await getTranslations('footer')

  const columns = [
    {
      key: 'product',
      label: t('columns.product.label'),
      links: [
        { label: t('columns.product.features'), href: '/features' },
        { label: t('columns.product.pricing'), href: '/pricing' },
        { label: t('columns.product.hrTools'), href: '/hr-tools' },
      ],
    },
    {
      key: 'company',
      label: t('columns.company.label'),
      links: [
        { label: t('columns.company.about'), href: '/about' },
        { label: t('columns.resources.blog'), href: 'https://blog.hr.svc.assistance.bg', isExternal: true },
        { label: t('columns.resources.docs'), href: 'https://docs.hr.svc.assistance.bg', isExternal: true },
        { label: t('columns.resources.admin'), href: 'https://admin.hr.assistance.bg', isExternal: true },
        { label: t('columns.resources.helpCenter'), href: '/help-center' },
        { label: t('columns.company.contact'), href: '/contact' },
        { label: t('columns.company.careers'), href: '/careers' },
      ],
    },
    {
      key: 'legal',
      label: t('columns.legal.label'),
      links: [
        { label: t('columns.legal.privacy'), href: '/privacy' },
        { label: t('columns.legal.terms'), href: '/terms' },
        { label: t('columns.legal.cookies'), href: '/cookies' },
      ],
    },
  ]

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-white">HR Service</span>
            </div>
            <p className="text-sm">
              {t('taglineShort')}
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.key}>
              <h3 className="text-white font-semibold mb-4">{column.label}</h3>
              <ul className="space-y-2 text-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {'isExternal' in link ? (
                      <a href={link.href} className="hover:text-white transition-colors cursor-pointer">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href as '/'} className="hover:text-white transition-colors cursor-pointer">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} HR Service. {t('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
