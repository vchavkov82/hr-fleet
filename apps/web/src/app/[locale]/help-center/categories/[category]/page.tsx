import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { SearchBar } from '@/components/help/search-bar'
import { HelpCenterBreadcrumbs } from '@/components/help/breadcrumbs'
import { SectionReveal } from '@/components/ui/section-reveal'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const CATEGORY_SLUGS = ['getting-started', 'employees', 'hr-tools', 'compliance', 'account', 'user-guide'] as const

export function generateStaticParams() {
    return routing.locales.flatMap((locale) =>
        CATEGORY_SLUGS.map((category) => ({ locale, category }))
    )
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; category: string }>
}): Promise<Metadata> {
    const { locale, category } = await params
    const canonicalCategory = category === 'user-guide' ? 'getting-started' : category
    const t = await getTranslations({ locale, namespace: 'helpCenter' })

    const categoryTitles: Record<string, string> = {
        'getting-started': t('categories.gettingStarted.title'),
        'employees': t('categories.employees.title'),
        'hr-tools': t('categories.hrTools.title'),
        'compliance': t('categories.compliance.title'),
        'account': t('categories.account.title')
    }

    const title = categoryTitles[canonicalCategory] || 'Category'

    return {
        title: `${title} | HR Help Center`,
        description: `Browse all articles in the ${title} category.`
    }
}

// Article data for real features only
const MOCK_ARTICLES = [
    {
        id: 'getting-started',
        title: 'Getting Started with HR Platform',
        description: 'A complete guide to signing up, navigating the dashboard, and taking your first steps.',
        category: 'getting-started',
        categoryName: 'Getting Started',
        readTime: '5 min',
        lastUpdated: '2026-03-01',
        content: 'Learn how to sign up for HR, navigate the dashboard, and take your first steps with the platform.',
        tags: ['setup', 'account', 'onboarding', 'getting-started']
    },
    {
        id: 'dashboard-overview',
        title: 'Dashboard Overview',
        description: 'Navigating the admin dashboard, understanding widgets, metrics, and key performance indicators.',
        category: 'getting-started',
        categoryName: 'Getting Started',
        readTime: '5 min',
        lastUpdated: '2026-03-01',
        content: 'Get familiar with your dashboard, understand key HR metrics like total employees, and customize your view.',
        tags: ['dashboard', 'metrics', 'navigation', 'overview']
    },
    {
        id: 'company-setup',
        title: 'Company Profile Configuration',
        description: 'Configure your company settings, departments, and organizational structure.',
        category: 'getting-started',
        categoryName: 'Getting Started',
        readTime: '8 min',
        lastUpdated: '2026-03-01',
        content: 'Set up your company profile, add departments, define roles, and configure basic settings.',
        tags: ['company', 'profile', 'settings', 'departments']
    },
    {
        id: 'notification-settings',
        title: 'Configuring Notifications',
        description: 'Set up email and in-app notifications for important HR events.',
        category: 'getting-started',
        categoryName: 'Getting Started',
        readTime: '4 min',
        lastUpdated: '2026-03-01',
        content: 'Configure notification preferences, set up alerts for important HR activities and updates.',
        tags: ['notifications', 'alerts', 'settings', 'email']
    },
    {
        id: 'employee-directory',
        title: 'Managing Your Employee Directory',
        description: 'How to add, edit, search, and filter employees in your organization directory.',
        category: 'employees',
        categoryName: 'Employee Management',
        readTime: '8 min',
        lastUpdated: '2026-03-01',
        content: 'Navigate the employee directory, use search and filters, add new employees, edit profiles, and manage your team.',
        tags: ['directory', 'search', 'employees', 'management']
    },
    {
        id: 'employee-data',
        title: 'Managing Employee Information',
        description: 'How to add, update, and manage employee profiles and data.',
        category: 'employees',
        categoryName: 'Employee Management',
        readTime: '10 min',
        lastUpdated: '2026-03-01',
        content: 'Complete guide to managing employee data. Learn how to add new employees, update profiles, and maintain records.',
        tags: ['employees', 'profiles', 'data', 'management']
    },
    {
        id: 'employee-documents',
        title: 'Document Management for Employees',
        description: 'Upload, organize, and manage employee documents.',
        category: 'employees',
        categoryName: 'Employee Management',
        readTime: '9 min',
        lastUpdated: '2026-03-01',
        content: 'Manage employee documents efficiently. Upload contracts, certificates, and other important files.',
        tags: ['documents', 'files', 'storage']
    },
    {
        id: 'salary-calculator',
        title: 'Using the Salary Calculator',
        description: 'How to calculate net and gross salary with Bulgarian 2026 tax rates and social security contributions.',
        category: 'hr-tools',
        categoryName: 'HR Tools & Calculators',
        readTime: '6 min',
        lastUpdated: '2026-03-01',
        content: 'Use the salary calculator to compute net and gross salaries with current Bulgarian tax rates.',
        tags: ['salary', 'calculator', 'taxes', 'net-gross']
    },
    {
        id: 'freelancer-comparison',
        title: 'Freelancer vs Employment Comparison',
        description: 'How to use the EOOD vs payroll comparison tool to evaluate employment models side by side.',
        category: 'hr-tools',
        categoryName: 'HR Tools & Calculators',
        readTime: '7 min',
        lastUpdated: '2026-03-01',
        content: 'Compare EOOD self-employment versus standard employment contracts with side-by-side breakdowns.',
        tags: ['freelancer', 'eood', 'comparison', 'employment']
    },
    {
        id: 'hr-document-templates',
        title: 'HR Document Templates',
        description: 'Access and customize Bulgarian employment contract templates, policies, and HR forms.',
        category: 'hr-tools',
        categoryName: 'HR Tools & Calculators',
        readTime: '5 min',
        lastUpdated: '2026-03-01',
        content: 'Browse our library of Bulgarian HR document templates including employment contracts and company policies.',
        tags: ['templates', 'documents', 'contracts', 'forms']
    },
    {
        id: 'tax-social-security',
        title: 'Bulgarian Tax & Social Security Guide',
        description: 'Understanding the 2026 tax rates, social security calculations, and compliance requirements.',
        category: 'compliance',
        categoryName: 'Bulgarian Compliance',
        readTime: '10 min',
        lastUpdated: '2026-03-01',
        content: 'Comprehensive guide to Bulgarian tax rates for 2026, social security contributions, and platform compliance.',
        tags: ['taxes', 'social-security', 'compliance', 'bulgaria']
    },
    {
        id: 'labor-code-basics',
        title: 'Bulgarian Labor Code Essentials',
        description: 'Key provisions of the Bulgarian Labor Code relevant to HR management.',
        category: 'compliance',
        categoryName: 'Bulgarian Compliance',
        readTime: '12 min',
        lastUpdated: '2026-03-01',
        content: 'Overview of Bulgarian Labor Code provisions affecting day-to-day HR operations.',
        tags: ['labor-code', 'compliance', 'bulgaria', 'regulations']
    },
    {
        id: 'data-protection',
        title: 'Data Protection and GDPR',
        description: 'How the platform handles employee data protection and GDPR compliance.',
        category: 'compliance',
        categoryName: 'Bulgarian Compliance',
        readTime: '8 min',
        lastUpdated: '2026-03-01',
        content: 'Understand how HR handles personal data protection in compliance with GDPR and Bulgarian law.',
        tags: ['gdpr', 'data-protection', 'privacy', 'compliance']
    },
    {
        id: 'user-permissions',
        title: 'Managing User Access and Permissions',
        description: 'Configure user accounts and access settings.',
        category: 'account',
        categoryName: 'Account & Settings',
        readTime: '8 min',
        lastUpdated: '2026-03-01',
        content: 'Set up user accounts, manage access permissions, and ensure appropriate access to HR features.',
        tags: ['permissions', 'access', 'security', 'roles']
    },
    {
        id: 'account-settings',
        title: 'Account Settings and Preferences',
        description: 'Configure your account, language, and notification preferences.',
        category: 'account',
        categoryName: 'Account & Settings',
        readTime: '5 min',
        lastUpdated: '2026-03-01',
        content: 'Manage account settings including language preferences (Bulgarian/English) and notifications.',
        tags: ['account', 'settings', 'preferences', 'language']
    },
    {
        id: 'two-factor-auth',
        title: 'Two-Factor Authentication',
        description: 'Enable 2FA for enhanced account security.',
        category: 'account',
        categoryName: 'Account & Settings',
        readTime: '5 min',
        lastUpdated: '2026-03-01',
        content: 'Set up two-factor authentication using authenticator apps for enhanced security.',
        tags: ['2fa', 'security', 'authentication']
    },
    {
        id: 'data-export',
        title: 'Exporting Your Data',
        description: 'Export employee data and reports for backup or analysis.',
        category: 'account',
        categoryName: 'Account & Settings',
        readTime: '6 min',
        lastUpdated: '2026-03-01',
        content: 'Learn how to export your HR data in various formats for backup, reporting, or analysis.',
        tags: ['export', 'data', 'backup', 'reports']
    }
]

function getCategoryArticles(category: string, articles: typeof MOCK_ARTICLES) {
    return articles.filter(article => article.category === category)
}

function getCategoryInfo(category: string, t: (key: string) => string) {
    const canonicalCategory = category === 'user-guide' ? 'getting-started' : category
    const categoryMap: Record<string, { title: string; description: string; icon: string }> = {
        'getting-started': {
            title: t('categories.gettingStarted.title'),
            description: 'Everything you need to get started with HR, from account setup to navigating the dashboard.',
            icon: 'M13 10V3L4 14h7v7l9-11h-7z'
        },
        'employees': {
            title: t('categories.employees.title'),
            description: 'Manage your employee directory, profiles, documents, and team information.',
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
        },
        'hr-tools': {
            title: t('categories.hrTools.title'),
            description: 'Salary calculator, freelancer comparison tool, and HR document templates.',
            icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
        },
        'compliance': {
            title: t('categories.compliance.title'),
            description: 'Bulgarian tax rates, social security calculations, labor code essentials, and data protection.',
            icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
        },
        'account': {
            title: t('categories.account.title'),
            description: 'Account security, user permissions, settings, and data export.',
            icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
        }
    }

    return categoryMap[canonicalCategory]
}

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ locale: string; category: string }>
}) {
    const { locale, category } = await params
    const canonicalCategory = category === 'user-guide' ? 'getting-started' : category

    setRequestLocale(locale)
    const t = await getTranslations('helpCenter')

    const categoryInfo = getCategoryInfo(canonicalCategory, t)
    if (!categoryInfo || !CATEGORY_SLUGS.includes(category as (typeof CATEGORY_SLUGS)[number])) {
        notFound()
    }

    const articles = getCategoryArticles(canonicalCategory, MOCK_ARTICLES)

    const breadcrumbCategory = canonicalCategory

    return (
        <div className="min-h-screen bg-white">
            {/* Category Header */}
            <section className="bg-navy-deep text-white py-16">
                <div className="container-xl">
                    <div className="max-w-4xl mx-auto">
                        <HelpCenterBreadcrumbs
                            currentPage="category"
                            category={breadcrumbCategory}
                            categoryTitle={categoryInfo.title}
                            className="mb-8"
                        />
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={categoryInfo.icon} />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold font-heading">
                                    {categoryInfo.title}
                                </h1>
                                <p className="text-blue-200 mt-2">
                                    {articles.length} article{articles.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <p className="text-xl text-blue-200 leading-relaxed mb-8">
                            {categoryInfo.description}
                        </p>
                        <SearchBar placeholder={`Search ${categoryInfo.title}...`} />
                    </div>
                </div>
            </section>

            {/* Articles List */}
            <SectionReveal>
                <section className="py-20">
                    <div className="container-xl">
                        <div className="max-w-4xl mx-auto">
                            <div className="space-y-4">
                                {articles.map((article) => (
                                    <Link
                                        key={article.id}
                                        href={`/${locale}/help-center/articles/${article.id}`}
                                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-primary/30 transition-all group block"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                                                    {article.title}
                                                </h3>
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                    {article.description}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span>{article.readTime}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                                                    <span>Updated {article.lastUpdated}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </SectionReveal>
        </div>
    )
}
