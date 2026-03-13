import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { SearchBar } from '@/components/help/search-bar'
import { HelpCenterBreadcrumbs } from '@/components/help/breadcrumbs'
import { ContactForm } from '@/components/help/contact-form'
import { SectionReveal } from '@/components/ui/section-reveal'
import Link from 'next/link'

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'helpCenter' })

    return {
        title: `Contact Support | HR Help Center`,
        description: 'Get in touch with our support team for help with HR.'
    }
}

export default async function ContactPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params

    setRequestLocale(locale)
    const t = await getTranslations('helpCenter')

    return (
        <div className="min-h-screen bg-white">
            {/* Contact Header */}
            <section className="bg-navy-deep text-white py-16">
                <div className="container-xl">
                    <div className="max-w-4xl mx-auto">
                        <HelpCenterBreadcrumbs currentPage="contact" className="mb-8" />

                        <h1 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                            Contact Support
                        </h1>
                        <p className="text-xl text-blue-200 leading-relaxed mb-8">
                            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
                        </p>

                        <SearchBar placeholder="Search for answers before contacting..." />
                    </div>
                </div>
            </section>

            {/* Contact Options */}
            <SectionReveal>
                <section className="py-20">
                    <div className="container-xl">
                        <div className="max-w-4xl mx-auto">
                            <div className="grid md:grid-cols-3 gap-8 mb-16">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Chat with our support team in real-time
                                    </p>
                                    <div className="text-xs text-gray-500">
                                        <p>Mon-Fri: 9 AM - 6 PM EET</p>
                                        <p>Average response: &lt; 2 minutes</p>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Email Support</h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Send us a detailed message
                                    </p>
                                    <div className="text-xs text-gray-500">
                                        <p>Response within 24 hours</p>
                                        <a href="mailto:support@hr.bg" className="text-primary hover:text-primary/80">
                                            support@hr.bg
                                        </a>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Call us for urgent issues
                                    </p>
                                    <div className="text-xs text-gray-500">
                                        <p>Mon-Fri: 9 AM - 6 PM EET</p>
                                        <a href="tel:+35921234567" className="text-primary hover:text-primary/80">
                                            +359 2 123 4567
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="bg-surface-lighter rounded-2xl p-8">
                                <h2 className="text-2xl font-bold font-heading mb-6 text-navy text-center">
                                    Send Us a Message
                                </h2>
                                <p className="text-gray-600 text-center mb-8">
                                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                                </p>
                                <ContactForm />
                            </div>
                        </div>
                    </div>
                </section>
            </SectionReveal>

            {/* Common Issues & Troubleshooting */}
            <SectionReveal>
                <section className="py-20 bg-surface-lighter">
                    <div className="container-xl">
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-3xl font-bold font-heading mb-4 text-navy text-center">
                                Common Issues & Quick Fixes
                            </h2>
                            <p className="text-gray-600 text-center mb-12">
                                Try these solutions before contacting support - they solve 80% of issues instantly
                            </p>

                            <div className="grid md:grid-cols-2 gap-6 mb-12">
                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">Can&apos;t log in?</h3>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Reset your password using &ldquo;Forgot Password&rdquo;</li>
                                                <li>• Clear browser cache and cookies</li>
                                                <li>• Try incognito/private browsing mode</li>
                                                <li>• Check if Caps Lock is on</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">Job posting not appearing?</h3>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Check if the job is set to &ldquo;Published&rdquo;</li>
                                                <li>• Verify posting date is not in the future</li>
                                                <li>• Ensure all required fields are filled</li>
                                                <li>• Wait 5-10 minutes for indexing</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">Not receiving emails?</h3>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Check spam/junk folder</li>
                                                <li>• Add support@hr.bg to contacts</li>
                                                <li>• Verify email in account settings</li>
                                                <li>• Check notification preferences</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">Payment issues?</h3>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Verify card details and expiry date</li>
                                                <li>• Check if international payments are enabled</li>
                                                <li>• Try a different payment method</li>
                                                <li>• Contact your bank if declined</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">Slow performance?</h3>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Clear browser cache and cookies</li>
                                                <li>• Disable browser extensions</li>
                                                <li>• Check your internet connection</li>
                                                <li>• Try a different browser</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 border border-gray-200">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-2">Team member access issues?</h3>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Check user role and permissions</li>
                                                <li>• Resend invitation email</li>
                                                <li>• Verify email address is correct</li>
                                                <li>• Check if user limit is reached</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* System Status Banner */}
                            <div className="bg-white rounded-xl p-6 border-2 border-green-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <div>
                                            <h3 className="font-semibold text-navy">All Systems Operational</h3>
                                            <p className="text-sm text-gray-600">Last checked: 2 minutes ago</p>
                                        </div>
                                    </div>
                                    <Link href="/en/system-status" className="text-sm text-primary hover:text-primary/80 font-medium">
                                        View Status Page →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </SectionReveal>

            {/* Quick Links Section */}
            <SectionReveal>
                <section className="py-20 bg-white">
                    <div className="container-xl">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-2xl font-bold font-heading mb-8 text-navy text-center">
                                Before You Contact Us
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <Link
                                    href="/en/help-center/categories/getting-started"
                                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-primary/30 transition-all group"
                                >
                                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                                        📚 Browse our Help Center
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Find answers to common questions in our comprehensive knowledge base.
                                    </p>
                                </Link>

                                <Link
                                    href="/en/help-center/search"
                                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-primary/30 transition-all group"
                                >
                                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                                        🔍 Search for answers
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Search our entire help center to find relevant articles and guides.
                                    </p>
                                </Link>

                                <Link
                                    href="/en/help-center/categories/security"
                                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-primary/30 transition-all group"
                                >
                                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                                        🔐 Check account issues
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Common account and billing issues are covered in our security section.
                                    </p>
                                </Link>

                                <Link
                                    href="/en/help-center/categories/integrations"
                                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-primary/30 transition-all group"
                                >
                                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                                        🔗 Integration help
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Learn how to integrate HR with your favorite tools and services.
                                    </p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </SectionReveal>
        </div>
    )
}
