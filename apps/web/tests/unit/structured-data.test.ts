import { describe, it, expect } from 'vitest'
import {
  organizationJsonLd,
  softwareApplicationJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  jsonLdScript,
} from '@/lib/structured-data'

describe('structured-data', () => {
  it('organizationJsonLd returns valid Organization schema', () => {
    const result = organizationJsonLd() as unknown as Record<string, unknown>
    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('Organization')
    expect(result.name).toBe('HR')
    expect(result.url).toBe('https://jobshr.com')
    expect(result.logo).toBe('https://jobshr.com/logo.png')
    expect(result.sameAs).toBeInstanceOf(Array)
  })

  it('softwareApplicationJsonLd returns valid SoftwareApplication schema', () => {
    const result = softwareApplicationJsonLd()
    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('SoftwareApplication')
    expect(result.name).toBe('HR Platform')
    expect(result.applicationCategory).toBe('BusinessApplication')
  })

  it('breadcrumbJsonLd builds BreadcrumbList from items', () => {
    const items = [
      { name: 'Home', url: 'https://jobshr.com' },
      { name: 'Features', url: 'https://jobshr.com/features' },
    ]
    const result = breadcrumbJsonLd(items)
    expect(result['@type']).toBe('BreadcrumbList')
    expect(result.itemListElement).toHaveLength(2)
    const elements = result.itemListElement as unknown as Array<{
      position: number
      name: string
      item: string
    }>
    expect(elements[0].position).toBe(1)
    expect(elements[0].name).toBe('Home')
    expect(elements[1].position).toBe(2)
  })

  it('faqJsonLd builds FAQPage from questions', () => {
    const questions = [
      { question: 'What is HR?', answer: 'An HR platform.' },
    ]
    const result = faqJsonLd(questions)
    expect(result['@type']).toBe('FAQPage')
    const entities = result.mainEntity as Array<{
      '@type': string
      name: string
      acceptedAnswer: { text: string }
    }>
    expect(entities).toHaveLength(1)
    expect(entities[0].name).toBe('What is HR?')
    expect(entities[0].acceptedAnswer.text).toBe('An HR platform.')
  })

  it('jsonLdScript returns script props with serialized JSON', () => {
    const data = { '@type': 'Thing', name: 'Test' }
    const result = jsonLdScript(data)
    expect(result.type).toBe('application/ld+json')
    expect(result.dangerouslySetInnerHTML.__html).toBe(JSON.stringify(data))
  })
})
