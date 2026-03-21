import Link from 'next/link'
import { SectionReveal } from '@/components/ui/section-reveal'
import { TemplateDownloadCard } from '@/components/ui/template-download-card'

interface TemplateData {
  name: string
  slug: string
  description: string
  whatsIncluded: string[]
  howToUse: string[]
  seoContent: string
}

export interface TemplatePageLabels {
  downloadCard: {
    format: string
    pdf: string
    downloadFree: string
    downloadAgain: string
    unlocked: string
    whatsIncluded: string
    howToUse: string
  }
  emailGate: {
    heading: string
    subtext: string
    nameLabel: string
    namePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    submit: string
    successMessage: string
  }
  relatedTitle: string
}

interface TemplatePageLayoutProps {
  template: TemplateData
  allTemplates: TemplateData[]
  labels: TemplatePageLabels
  icon: React.ReactNode
}

export function TemplatePageLayout({
  template,
  allTemplates,
  labels,
  icon,
}: TemplatePageLayoutProps) {
  const relatedTemplates = allTemplates
    .filter((t) => t.slug !== template.slug)
    .slice(0, 3)

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy-deep py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
              {icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold font-heading text-white sm:text-4xl">
                {template.name}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                  PDF Document
                </span>
                <span className="inline-flex items-center rounded-full bg-success/20 px-3 py-1 text-xs font-medium text-green-300">
                  Free Download
                </span>
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-gray-300">
            {template.description}
          </p>
        </div>
      </section>

      {/* Content Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column — content */}
            <div className="lg:col-span-2 space-y-10">
              {/* What's included */}
              <SectionReveal>
                <div>
                  <h2 className="text-2xl font-bold font-heading text-navy">
                    {labels.downloadCard.whatsIncluded}
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {template.whatsIncluded.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </SectionReveal>

              {/* How to use */}
              <SectionReveal delay={0.1}>
                <div>
                  <h2 className="text-2xl font-bold font-heading text-navy">
                    {labels.downloadCard.howToUse}
                  </h2>
                  <ol className="mt-4 space-y-4">
                    {template.howToUse.map((step, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary">
                          {i + 1}
                        </span>
                        <span className="text-gray-700 pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </SectionReveal>

              {/* SEO Content */}
              <SectionReveal delay={0.2}>
                <div className="rounded-2xl bg-surface-light p-6">
                  <h2 className="text-lg font-bold font-heading text-navy mb-3">
                    Bulgarian Labour Law Context
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {template.seoContent}
                  </p>
                </div>
              </SectionReveal>
            </div>

            {/* Right column — download card */}
            <div className="lg:col-span-1">
              <TemplateDownloadCard
                slug={template.slug}
                templateName={template.name}
                labels={{
                  format: labels.downloadCard.format,
                  pdf: labels.downloadCard.pdf,
                  downloadFree: labels.downloadCard.downloadFree,
                  downloadAgain: labels.downloadCard.downloadAgain,
                  unlocked: labels.downloadCard.unlocked,
                }}
                emailGateLabels={labels.emailGate}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Related Templates */}
      <section className="py-16 bg-surface-light">
        <div className="mx-auto max-w-5xl px-4">
          <SectionReveal>
            <h2 className="text-2xl font-bold font-heading text-navy mb-8">
              {labels.relatedTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedTemplates.map((related) => (
                <Link
                  key={related.slug}
                  href={`/hr-tools/templates/${related.slug}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <h3 className="font-bold font-heading text-navy group-hover:text-primary transition-colors">
                    {related.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {related.description}
                  </p>
                  <span className="mt-auto text-sm font-medium text-primary flex items-center gap-1">
                    View template
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  )
}
