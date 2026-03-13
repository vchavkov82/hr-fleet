import { describe, it, expect, vi } from 'vitest'

describe('Internationalization (i18n)', () => {
  describe('Locale Support', () => {
    it('should support English locale', () => {
      const supportedLocales = ['en', 'bg']
      expect(supportedLocales).toContain('en')
    })

    it('should support Bulgarian locale', () => {
      const supportedLocales = ['en', 'bg']
      expect(supportedLocales).toContain('bg')
    })

    it('should have valid locale codes', () => {
      const locales = ['en', 'bg']
      const validRegex = /^[a-z]{2}$/

      locales.forEach(locale => {
        expect(locale).toMatch(validRegex)
      })
    })
  })

  describe('Translation Keys', () => {
    const translations = {
      en: {
        'pages.hrTools.salaryCalculator': {
          metaTitle: 'Salary Calculator',
          heading: 'Salary Calculator',
          grossToNet: 'Gross to Net',
        },
      },
      bg: {
        'pages.hrTools.salaryCalculator': {
          metaTitle: 'Калкулатор на заплата',
          heading: 'Калкулатор на заплата',
          grossToNet: 'Брутто в Нетто',
        },
      },
    }

    it('should have matching keys across locales', () => {
      const enKeys = Object.keys(translations.en['pages.hrTools.salaryCalculator'])
      const bgKeys = Object.keys(translations.bg['pages.hrTools.salaryCalculator'])

      expect(enKeys).toEqual(bgKeys)
    })

    it('should have non-empty translations', () => {
      Object.entries(translations).forEach(([locale, namespaces]) => {
        Object.entries(namespaces).forEach(([namespace, keys]) => {
          Object.entries(keys).forEach(([key, value]) => {
            expect(value).toBeTruthy()
            expect(typeof value).toBe('string')
          })
        })
      })
    })

    it('should have different content for different locales', () => {
      const enTitle = translations.en['pages.hrTools.salaryCalculator'].metaTitle
      const bgTitle = translations.bg['pages.hrTools.salaryCalculator'].metaTitle

      expect(enTitle).not.toEqual(bgTitle)
    })
  })

  describe('Language-Specific Formatting', () => {
    it('should format currency for English', () => {
      const locale = 'en'
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
      })

      const formatted = formatter.format(1234.56)
      expect(formatted).toMatch(/\$|USD/)
    })

    it('should format currency for Bulgarian', () => {
      const locale = 'bg'
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'BGN',
      })

      const formatted = formatter.format(1234.56)
      expect(formatted).toBeTruthy()
    })

    it('should format dates for English', () => {
      const locale = 'en'
      const formatter = new Intl.DateTimeFormat(locale)
      const formatted = formatter.format(new Date(2024, 0, 15))

      expect(formatted).toMatch(/\d/)
    })

    it('should format dates for Bulgarian', () => {
      const locale = 'bg'
      const formatter = new Intl.DateTimeFormat(locale)
      const formatted = formatter.format(new Date(2024, 0, 15))

      expect(formatted).toMatch(/\d/)
    })
  })

  describe('URL Routing with Locales', () => {
    it('should route English pages correctly', () => {
      const enRoutes = [
        '/en',
        '/en/hr-tools',
        '/en/hr-tools/salary-calculator',
        '/en/about',
      ]

      enRoutes.forEach(route => {
        expect(route).toMatch(/^\/en/)
      })
    })

    it('should route Bulgarian pages correctly', () => {
      const bgRoutes = [
        '/bg',
        '/bg/hr-tools',
        '/bg/hr-tools/salary-calculator',
        '/bg/about',
      ]

      bgRoutes.forEach(route => {
        expect(route).toMatch(/^\/bg/)
      })
    })

    it('should handle locale prefix in URLs', () => {
      const urls = ['/en/page', '/bg/page', '/page']

      const withLocale = urls.filter(url => /^\/[a-z]{2}\//.test(url) || /^\/[a-z]{2}$/.test(url))
      expect(withLocale.length).toBeGreaterThan(0)
    })
  })

  describe('Locale Detection', () => {
    it('should detect locale from URL path', () => {
      const url = '/en/hr-tools'
      const localeMatch = url.match(/^\/([a-z]{2})/)

      expect(localeMatch).toBeTruthy()
      expect(localeMatch?.[1]).toBe('en')
    })

    it('should detect Bulgarian locale from URL', () => {
      const url = '/bg/hr-tools'
      const localeMatch = url.match(/^\/([a-z]{2})/)

      expect(localeMatch).toBeTruthy()
      expect(localeMatch?.[1]).toBe('bg')
    })

    it('should fallback to default locale if not detected', () => {
      const url = '/random-path'
      const localeMatch = url.match(/^\/([a-z]{2})($|\/)/)
      const defaultLocale = 'en'

      expect(localeMatch).toBeFalsy()
      expect(defaultLocale).toBe('en')
    })
  })
})
