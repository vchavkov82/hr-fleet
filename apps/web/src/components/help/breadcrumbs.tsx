import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface BreadcrumbItem {
    label: string
    href?: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
    className?: string
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
    return (
        <nav className={`flex items-center gap-2 text-sm ${className}`}>
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    {index > 0 && (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    )}
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="text-blue-200 hover:text-white transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-white font-medium">{item.label}</span>
                    )}
                </div>
            ))}
        </nav>
    )
}

interface HelpCenterBreadcrumbsProps {
    currentPage: string
    category?: string
    categoryTitle?: string
    article?: string
    articleTitle?: string
    searchQuery?: string
    className?: string
}

export function HelpCenterBreadcrumbs({
    currentPage,
    category,
    categoryTitle,
    article,
    articleTitle,
    searchQuery,
    className = ''
}: HelpCenterBreadcrumbsProps) {
    const items: BreadcrumbItem[] = [
        { label: 'Help Center', href: '/en/help-center' }
    ]

    if (currentPage === 'contact') {
        items.push({ label: 'Contact Support' })
    } else if (currentPage === 'search' && searchQuery) {
        items.push({ label: `Search results for "${searchQuery}"` })
    } else if (currentPage === 'category' && category && categoryTitle) {
        items.push({ label: categoryTitle })
    } else if (currentPage === 'article' && category && categoryTitle && article && articleTitle) {
        items.push({ label: categoryTitle, href: `/en/help-center/categories/${category}` })
        items.push({ label: articleTitle })
    }

    return <Breadcrumbs items={items} className={className} />
}
