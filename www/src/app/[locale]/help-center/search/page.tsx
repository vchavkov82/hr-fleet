import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { SearchBar } from '@/components/help/search-bar'
import { HelpCenterBreadcrumbs } from '@/components/help/breadcrumbs'
import { SectionReveal } from '@/components/ui/section-reveal'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ q?: string }>
}): Promise<Metadata> {
    const { locale } = await params
    const { q } = await searchParams
    const t = await getTranslations({ locale, namespace: 'helpCenter' })

    const query = q || ''
    const title = query
        ? `Search results for "${query}" | HR Help Center`
        : 'Search | HR Help Center'

    return {
        title,
        description: query
            ? `Find answers related to "${query}" in our help center.`
            : t('metaDescription')
    }
}

// Mock article data - in a real app, this would come from a CMS or database
const MOCK_ARTICLES = [
    {
        id: 'getting-started',
        title: 'Getting Started with HR',
        description: 'A complete guide to setting up your account and posting your first job.',
        category: 'Getting Started',
        readTime: '5 min',
        content: 'Learn how to set up your HR account, configure your company profile, and post your first job opening. This guide covers all the essential steps to get you started with our HR platform.',
        tags: ['setup', 'account', 'first-job', 'onboarding']
    },
    {
        id: 'ats-pipeline',
        title: 'How to Use the ATS Pipeline',
        description: 'Move candidates through stages, add notes, and collaborate with your team.',
        category: 'Recruiting',
        readTime: '8 min',
        content: 'Master the Applicant Tracking System pipeline. Learn how to customize stages, move candidates between stages, add interview notes, and collaborate with your hiring team effectively.',
        tags: ['ats', 'pipeline', 'candidates', 'recruiting', 'collaboration']
    },
    {
        id: 'ai-screening',
        title: 'Setting Up AI CV Screening',
        description: 'Configure AI scoring criteria to automatically rank candidates.',
        category: 'Recruiting',
        readTime: '6 min',
        content: 'Configure AI-powered CV screening to automatically evaluate and rank candidates based on your specific criteria. Save time and find the best candidates faster.',
        tags: ['ai', 'screening', 'cv', 'candidates', 'automation']
    },
    {
        id: 'gdpr-compliance',
        title: 'GDPR Compliance in HR',
        description: 'How HR handles candidate data and how to configure consent settings.',
        category: 'Security',
        readTime: '10 min',
        content: 'Understand how HR ensures GDPR compliance, handles candidate data, and how you can configure consent settings to meet data protection requirements.',
        tags: ['gdpr', 'compliance', 'data-protection', 'security', 'consent']
    },
    {
        id: 'leave-management',
        title: 'Managing Leave Requests',
        description: 'How to configure leave types, approval workflows, and team calendars.',
        category: 'Leave & Absence',
        readTime: '7 min',
        content: 'Set up and manage leave requests, configure different leave types, create approval workflows, and use team calendars to track absences effectively.',
        tags: ['leave', 'absence', 'approval', 'calendar', 'workflows']
    },
    {
        id: 'payroll-guide',
        title: 'Running Your First Payroll',
        description: 'Step-by-step guide to processing payroll with Bulgarian tax compliance.',
        category: 'Payroll',
        readTime: '12 min',
        content: 'Complete guide to processing your first payroll in HR, including Bulgarian tax compliance, social security contributions, and generating payslips.',
        tags: ['payroll', 'taxes', 'bulgaria', 'compliance', 'payslips']
    },
    {
        id: 'employee-management',
        title: 'Employee Data Management',
        description: 'How to manage employee profiles, documents, and organizational structure.',
        category: 'Employee Management',
        readTime: '9 min',
        content: 'Learn how to manage employee information, upload documents, create organizational charts, and maintain accurate employee records in HR.',
        tags: ['employees', 'data', 'documents', 'org-chart', 'profiles']
    },
    {
        id: 'integrations-setup',
        title: 'Setting Up Integrations',
        description: 'Connect HR with your favorite tools and services.',
        category: 'Integrations',
        readTime: '6 min',
        content: 'Connect HR with popular tools like Slack, Google Workspace, LinkedIn, and accounting software to streamline your HR workflows.',
        tags: ['integrations', 'api', 'slack', 'google', 'automation']
    }
]

function searchArticles(query: string, articles: typeof MOCK_ARTICLES) {
    if (!query.trim()) return []

    const lowercaseQuery = query.toLowerCase()
    return articles.filter(article =>
        article.title.toLowerCase().includes(lowercaseQuery) ||
        article.description.toLowerCase().includes(lowercaseQuery) ||
        article.content.toLowerCase().includes(lowercaseQuery) ||
        article.category.toLowerCase().includes(lowercaseQuery) ||
        article.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
}

export default async function SearchPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ q?: string }>
}) {
    const { locale } = await params
    const { q } = await searchParams

    setRequestLocale(locale)
    const t = await getTranslations('helpCenter')

    const query = q || ''
    const results = searchArticles(query, MOCK_ARTICLES)

    if (!query) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Search Header */}
            <section className="bg-navy-deep text-white py-16">
                <div className="container-xl">
                    <div className="max-w-4xl mx-auto">
                        <HelpCenterBreadcrumbs currentPage="search" searchQuery={query} className="mb-8" />
                        <h1 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                            Search Results
                        </h1>
                        <p className="text-xl text-blue-200 mb-8">
                            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                        </p>
                        <SearchBar placeholder={t('hero.searchPlaceholder')} />
                    </div>
                </div>
            </section>

            {/* Results */}
            <SectionReveal>
                <section className="py-20">
                    <div className="container-xl">
                        <div className="max-w-4xl mx-auto">
                            {results.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-semibold text-navy mb-4">No results found</h2>
                                    <p className="text-gray-600 mb-8">
                                        {t('search.noResultsHint')}
                                    </p>
                                    <Link
                                        href={`/${locale}/help-center`}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        {t('search.browseCategoriesCta')}
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {results.map((article) => (
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
                                                        <span className="px-2 py-1 bg-gray-100 rounded">{article.category}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-400" />
                                                        <span>{article.readTime}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </SectionReveal>
        </div>
    )
}
