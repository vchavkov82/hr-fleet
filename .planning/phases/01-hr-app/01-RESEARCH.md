# Phase 1: HR App - Research

**Researched:** 2026-02-25
**Domain:** Next.js 14 marketing site — Bulgarian HR SaaS product pages, calculators, templates, blog integration
**Confidence:** HIGH

## Summary

Phase 15 involves a major content and design overhaul of the existing `app/hr/` Next.js 14 application. The app already has a complete routing structure with 20+ pages under `[locale]/`, a working next-intl i18n setup (Bulgarian + English), layout components (header/footer), homepage sections, and full i18n message files. The current pages contain placeholder-quality content styled with a bright blue (#215cff) palette that needs shifting toward a deeper corporate blue (BambooHR/Personio/Workday aesthetic).

The work divides into several domains: (1) visual design system overhaul to a corporate blue palette, (2) homepage redesign with product screenshot hero and social proof, (3) features page with alternating screenshot rows, (4) pricing page redesign to per-module "get a quote" model, (5) HR tools section with interactive Bulgarian tax calculators on individual URLs, (6) email-gated template downloads, (7) blog integration via Next.js rewrite proxy to the Astro hr-blog at port 3013, (8) framer-motion scroll animations, (9) polishing all supporting pages (about, contact, partners, careers, api-docs, help-center, legal pages), and (10) free trial sign-up flow refinement.

**Primary recommendation:** Work in waves: design system first (colors, typography, component primitives), then homepage + layout, then feature-heavy pages (features, pricing, hr-tools/calculators), then supporting pages, then blog integration and animations last.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Full HR suite: ATS + employee management, leave tracking, payroll integration, performance reviews, onboarding
- Target audience: Bulgarian SMBs (10-200 employees) — HR managers, office managers, founders
- Keep existing next-intl i18n setup (Bulgarian primary + English available)
- All pages get polished: home, features, pricing, hr-tools, blog, auth (login/sign-up), about, partners, careers, api-docs, help-center, contact, and legal pages (privacy, terms, cookies, gdpr)
- No page is deferred — every route gets real content
- Own identity separate from the jobs platform (not RemotePass-inspired)
- Clean & professional vibe — think BambooHR, Personio
- More corporate blue palette — deeper navy/blue tones, muted accents, enterprise-feeling (like Workday, SAP)
- Existing #215cff blue and #EC4899 pink need adjustment toward this corporate direction
- Mix of product screenshots/mockups on feature pages and illustrations for conceptual sections
- Product screenshot hero: headline + subtext on left, large product screenshot/mockup on right (classic SaaS)
- Social proof with placeholder content — testimonial sections, company logo strips, stat counters
- Latest 3 blog posts shown in a card grid on the homepage
- Features page: alternating rows (screenshot left / text right, swap for next feature)
- Pricing page: per-module pricing structure with "Contact for pricing" / "Get a quote" forms (no public prices)
- Feature comparison table showing what's included in each module
- HR-Tools page: both interactive calculators AND downloadable templates
- Calculators: salary (net/gross), leave day, total employment cost — all using real 2026 Bulgarian tax/social security rates
- Each calculator on its own URL: /hr-tools/salary-calculator, /hr-tools/leave-calculator, etc.
- Calculators embedded in SEO content pages with explanatory content about Bulgarian payroll/leave laws
- Templates: full HR document set — contracts, job descriptions, leave policies, onboarding checklists, performance review forms, termination docs
- Each template on its own URL: /hr-tools/templates/employment-contract, etc.
- Templates are email-gated — enter email to download (lead capture)
- Primary CTA: "Start free trial" — free trial sign-up across the site
- Simple sign-up form: name, email, password, company name — instant account creation
- CTA placement: sticky header button + hero section CTA + closing CTA section at page bottom
- No demo request path (just free trial)
- Astro blog (app/hr-blog) served at /blog via subpath proxy through Next.js rewrite
- Next.js /blog route acts as proxy entry point to the Astro app
- Shared header/footer navigation — visually identical across both apps
- Homepage shows latest 3 blog posts in a card grid
- Desktop-first design, responsive adaptation for mobile
- Hamburger menu for mobile navigation
- Calculators use same layout, inputs stack vertically on mobile
- Subtle scroll reveal animations — sections fade/slide in on scroll (professional, not flashy)
- Use framer-motion for viewport-triggered animations (already installed)
- Subtle cross-fade page transitions using Next.js layout animations
- Stat counters animate (count up from 0) when scrolling into view
- Standard button hover transitions

### Claude's Discretion
- Exact color hex values for the new corporate blue palette
- Typography choices (font families, sizes, weights)
- Specific illustration style and sourcing
- Loading states and skeleton patterns
- Error page designs
- Footer layout and content structure
- Header navigation menu item order
- Responsive breakpoints

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| Next.js | 14.2.35 | App Router, SSG, ISR | Installed |
| React | 18.3.1 | UI framework | Installed |
| next-intl | 4.8.3 | i18n with `[locale]` routing | Installed, configured |
| framer-motion | 11.18.2 | Scroll animations, page transitions | Installed |
| Tailwind CSS | 3.4.14 | Utility-first styling | Installed |
| @tailwindcss/forms | 0.5.9 | Form element styling | Installed |
| @tailwindcss/typography | 0.5.15 | Prose content styling | Installed |
| react-hook-form | 7.53.2 | Form state management | Installed |
| zod | 3.23.8 | Schema validation | Installed |
| @hookform/resolvers | 3.9.1 | Zod + RHF integration | Installed |
| clsx | 2.1.1 | Conditional classnames | Installed |
| tailwind-merge | 2.5.4 | Merge conflicting Tailwind classes | Installed |
| @headlessui/react | 2.2.0 | Accessible UI primitives (modals, tabs) | Installed |
| swiper | 12.1.2 | Carousel/slider component | Installed |

### Supporting (No New Dependencies Needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Inter font | via next/font/google | Body text | Already configured in fonts.ts |
| Mulish font | via next/font/google | Headings | Already configured in fonts.ts |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| framer-motion | CSS-only scroll animations | framer-motion already installed, provides whileInView and counter animation; CSS would need IntersectionObserver manually |
| react-hook-form | HTML native forms | RHF already installed and used in sign-up form; needed for calculator forms with validation |
| @headlessui/react | Custom dropdowns/modals | Already installed; provides accessible disclosure, dialog, tabs for FAQ, mobile menu |

**Installation:** No new packages needed. The existing dependency set covers all requirements.

## Architecture Patterns

### Current Project Structure
```
app/hr/src/
├── app/
│   ├── fonts.ts                    # Inter + Mulish font setup
│   ├── globals.css                 # Tailwind layers, button/card classes
│   ├── layout.tsx                  # Root layout (metadata only)
│   └── [locale]/
│       ├── layout.tsx              # Locale layout (header, footer, NextIntlClientProvider)
│       ├── page.tsx                # Homepage (server component)
│       ├── loading.tsx             # Suspense skeleton
│       ├── features/page.tsx       # Features page
│       ├── pricing/page.tsx        # Pricing page
│       ├── hr-tools/page.tsx       # HR tools listing
│       ├── blog/page.tsx           # Blog page (stub — needs proxy)
│       ├── auth/login/             # Login page + LoginForm client component
│       ├── auth/sign-up/           # Sign-up page + SignUpForm client component
│       ├── about/page.tsx          # About page
│       ├── contact/page.tsx        # Contact page
│       ├── partners/page.tsx       # Partners page
│       ├── careers/page.tsx        # Careers page
│       ├── api-docs/page.tsx       # API docs page
│       ├── help-center/page.tsx    # Help center page
│       ├── system-status/page.tsx  # System status page
│       ├── terms/page.tsx          # Terms of service
│       ├── privacy/page.tsx        # Privacy policy
│       ├── cookies/page.tsx        # Cookie policy
│       └── gdpr/page.tsx           # GDPR compliance
├── components/
│   ├── layout/
│   │   ├── header.tsx              # Client component with nav dropdowns
│   │   └── footer.tsx              # Server component with link columns
│   └── sections/
│       ├── hero.tsx                # Homepage hero (server component)
│       ├── features.tsx            # Homepage features grid
│       ├── how-it-works.tsx        # How it works steps
│       ├── pricing-preview.tsx     # Pricing cards preview
│       ├── testimonials.tsx        # Testimonial cards
│       └── cta.tsx                 # Call to action banner
├── i18n/
│   ├── routing.ts                  # defineRouting({locales: ['en', 'bg']})
│   └── request.ts                  # getRequestConfig with dynamic import
├── navigation.ts                   # createNavigation(routing) exports
├── middleware.ts                   # next-intl middleware
└── lib/
    ├── image-utils.ts              # Cloudflare image URL builder
    └── cloudflare-image-loader.ts  # next/image custom loader
```

### New Structure Additions (Phase 15)
```
app/hr/src/
├── app/[locale]/
│   ├── hr-tools/
│   │   ├── page.tsx                        # Tools index (calculators + templates listing)
│   │   ├── salary-calculator/page.tsx      # Salary net/gross calculator + SEO content
│   │   ├── leave-calculator/page.tsx       # Leave day calculator + SEO content
│   │   ├── employment-cost-calculator/page.tsx  # Total cost calculator + SEO content
│   │   └── templates/
│   │       ├── page.tsx                    # Templates listing page
│   │       ├── employment-contract/page.tsx
│   │       ├── job-description/page.tsx
│   │       ├── leave-policy/page.tsx
│   │       ├── onboarding-checklist/page.tsx
│   │       ├── performance-review/page.tsx
│   │       └── termination-document/page.tsx
│   └── blog/
│       └── [...slug]/page.tsx              # Catch-all proxy route for Astro blog
├── components/
│   ├── ui/                                 # Reusable UI primitives
│   │   ├── section-reveal.tsx              # framer-motion whileInView wrapper
│   │   ├── counter.tsx                     # Animated number counter
│   │   ├── email-gate-modal.tsx            # Email capture modal for templates
│   │   └── quote-form.tsx                  # "Get a quote" form component
│   ├── calculators/
│   │   ├── salary-calculator.tsx           # Interactive salary calculator
│   │   ├── leave-calculator.tsx            # Leave day calculator
│   │   └── employment-cost-calculator.tsx  # Total cost calculator
│   └── sections/
│       ├── trusted-companies.tsx           # Company logo strip
│       ├── blog-posts.tsx                  # Latest 3 blog posts grid
│       └── feature-row.tsx                 # Alternating feature screenshot row
└── lib/
    └── bulgarian-tax.ts                    # 2026 Bulgarian tax rate constants
```

### Pattern 1: Server Component Pages with Client Islands
**What:** Pages are server components (async, use `getTranslations`). Interactive parts (calculators, forms, animations) are extracted into `'use client'` components.
**When to use:** Every page in this app follows this pattern already.
**Example:**
```typescript
// page.tsx (server component)
import { getTranslations } from 'next-intl/server'
import SalaryCalculator from '@/components/calculators/salary-calculator'

export default async function SalaryCalculatorPage({ params }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('pages.hrTools.salaryCalculator')

  return (
    <>
      <section className="py-20">
        {/* SEO content — server rendered */}
        <h1>{t('heading')}</h1>
        <p>{t('introContent')}</p>
      </section>
      {/* Interactive calculator — client component */}
      <SalaryCalculator labels={/* pass translated strings */} />
      <section>{/* More SEO content below calculator */}</section>
    </>
  )
}
```

### Pattern 2: framer-motion whileInView Wrapper
**What:** A reusable wrapper component that applies scroll-triggered fade/slide animations.
**When to use:** Wrap each major page section for subtle reveal animations.
**Example:**
```typescript
// components/ui/section-reveal.tsx
'use client'
import { motion } from 'framer-motion'

interface SectionRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function SectionReveal({ children, className, delay = 0 }: SectionRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

### Pattern 3: Animated Counter
**What:** Numbers that count up from 0 to target value when scrolled into view.
**When to use:** Stat counters on homepage, about page.
**Example:**
```typescript
// components/ui/counter.tsx
'use client'
import { useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'

export function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { duration: 2000, bounce: 0 })
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString())

  useEffect(() => {
    if (isInView) motionValue.set(target)
  }, [isInView, motionValue, target])

  return <motion.span ref={ref}>{display}{suffix}</motion.span>
}
```

### Pattern 4: Blog Proxy via Next.js Rewrites
**What:** Proxy `/blog/*` requests to the Astro hr-blog app running on port 3013.
**When to use:** Blog integration without iframe or subdomain.
**Example:**
```javascript
// next.config.mjs — add rewrites
async rewrites() {
  return [
    {
      source: '/blog/:path*',
      destination: 'http://localhost:3013/blog/:path*',
    },
  ]
}
```
**Caveat:** next-intl middleware matcher must exclude `/blog` paths to avoid locale prefix injection. The middleware config `matcher` must be updated: `['/', '/(bg|en)/:path*']` already covers locale paths. Blog rewrite must be `beforeFiles` to intercept before Next.js routing.

### Pattern 5: Email-Gated Template Download
**What:** Template pages show preview content; download requires email submission. Client component handles the gate.
**When to use:** All template pages under `/hr-tools/templates/*`.
**Example:**
```typescript
// components/ui/email-gate-modal.tsx
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({ email: z.string().email() })

export function EmailGateModal({ templateSlug, onSuccess }) {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data) {
    // Store email for lead capture (localStorage or API)
    localStorage.setItem(`template_${templateSlug}_email`, data.email)
    onSuccess()
  }

  return (/* form UI */)
}
```

### Anti-Patterns to Avoid
- **Putting `'use client'` on page.tsx files:** Pages should remain server components for SEO. Extract interactive parts into separate client components.
- **Importing framer-motion in server components:** `motion.div` requires `'use client'`. Use the SectionReveal wrapper pattern.
- **Hardcoding Bulgarian text in components:** All text must go through next-intl `t()` functions. Update both `en.json` and `bg.json`.
- **Using `next/link` directly instead of `@/navigation` Link:** The project uses `createNavigation(routing)` which produces locale-aware Link. Always import from `@/navigation`.
- **Creating new pages without `generateStaticParams`:** Every page under `[locale]` needs this for static generation.
- **Missing `setRequestLocale(locale)` in page components:** Required for static rendering with next-intl.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll animations | Custom IntersectionObserver + CSS | framer-motion `whileInView` + `useInView` | Already installed; handles timing, easing, viewport margins, once-only triggers |
| Form validation | Manual if/else checks | react-hook-form + zod + @hookform/resolvers | Already installed and used in sign-up form; consistent validation pattern |
| Accessible dropdowns/modals | Custom focus trap + aria | @headlessui/react Dialog, Disclosure, Tab | Already installed; handles a11y automatically |
| i18n routing | Manual locale detection | next-intl middleware + routing config | Already configured and working |
| Number formatting | Manual toLocaleString | Intl.NumberFormat with 'bg-BG' locale | Browser built-in; handles Bulgarian number formatting (space thousands, comma decimal) |
| Image optimization | Manual srcset/picture | next/image with cloudflare-image-loader.ts | Already configured |
| Mobile hamburger menu | Custom slide-in drawer | Existing header.tsx mobile menu | Already fully functional |

**Key insight:** The existing app has excellent infrastructure. This phase is about content and design quality, not architecture changes. Almost no new packages needed.

## Common Pitfalls

### Pitfall 1: next-intl Middleware Blocking Blog Proxy
**What goes wrong:** The next-intl middleware intercepts `/blog/*` requests and redirects them to `/en/blog/*` or `/bg/blog/*`, preventing the rewrite to the Astro app from working.
**Why it happens:** The middleware matcher `['/', '/(bg|en)/:path*']` may not exclude `/blog` paths explicitly, and Next.js rewrites run after middleware.
**How to avoid:** Use `beforeFiles` rewrites in next.config.mjs AND update the middleware matcher to exclude blog paths. Alternatively, use `skipPatterns` in the next-intl middleware config.
**Warning signs:** Blog pages return 404 or redirect to `/en/blog/...` instead of proxying to Astro.

### Pitfall 2: Calculator Client/Server Boundary
**What goes wrong:** Putting calculator logic in a server component loses interactivity; putting the entire page as `'use client'` loses SEO content.
**Why it happens:** Calculators need real-time input/output (client) but the surrounding SEO content (Bulgarian tax explanations, law references) must be server-rendered for SEO.
**How to avoid:** Page is server component with SEO content above and below; calculator is an extracted `'use client'` component receiving only translated label strings as props.
**Warning signs:** SEO content not appearing in view-source, or calculator inputs not responding.

### Pitfall 3: Large i18n Message Files
**What goes wrong:** The en.json is already ~83KB. Adding all new page content could push it past comfortable loading sizes.
**Why it happens:** Every page's content is stored as translation strings.
**How to avoid:** For long-form content (legal pages, SEO articles around calculators), consider using markdown files or splitting the message file. However, the current approach with a single JSON per locale is the established pattern. Keep monitoring bundle size.
**Warning signs:** Slow page loads, large JS bundle with translations.

### Pitfall 4: Bulgarian Number/Currency Formatting in Calculators
**What goes wrong:** Displaying "1,234.56" (English format) instead of "1 234,56" (Bulgarian format) in salary calculator results.
**Why it happens:** Using `toFixed()` or US-locale formatting instead of Bulgarian locale.
**How to avoid:** Use `new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'BGN' })` for all monetary values. Use the current locale from the page context.
**Warning signs:** Numbers look wrong in Bulgarian locale view.

### Pitfall 5: Missing `generateStaticParams` on New Routes
**What goes wrong:** New pages under `[locale]/hr-tools/salary-calculator/` fail to build statically.
**Why it happens:** Every route segment under `[locale]` requires `generateStaticParams` returning `[{locale: 'en'}, {locale: 'bg'}]`.
**How to avoid:** Copy the `generateStaticParams` export from any existing page — it's identical across all pages.
**Warning signs:** Build errors about missing static params.

### Pitfall 6: Pricing Page Still Showing Prices
**What goes wrong:** Implementing a pricing page with actual price numbers when the decision is "contact for pricing" / "get a quote".
**Why it happens:** The current pricing page stub has actual prices from the template. Developer inertia might carry these forward.
**How to avoid:** Replace all price displays with "Get a quote" CTAs. Show feature comparison tables with checkmarks, not price columns.
**Warning signs:** Any actual currency amounts on the pricing page.

## Code Examples

### Bulgarian Tax Rate Constants
```typescript
// lib/bulgarian-tax.ts
// Source: PWC Tax Summaries Bulgaria 2026, Bulgarian Ministry of Economy

export const BG_TAX_2026 = {
  // Personal income tax (flat rate)
  INCOME_TAX_RATE: 0.10,

  // Social security total: 24.7% - 25.4% (employer + employee)
  // Split ratio: employer 60/40 employee for most contributions
  SOCIAL_SECURITY: {
    // Pension (Category III — most common for office workers)
    PENSION_TOTAL: 0.148,       // 14.8% (born before 1960) or 19.8% (born after, includes 5% universal pension)
    PENSION_EMPLOYER: 0.0888,   // ~60% of 14.8%
    PENSION_EMPLOYEE: 0.0592,   // ~40% of 14.8%

    // General illness and maternity
    ILLNESS_MATERNITY_TOTAL: 0.035,
    ILLNESS_MATERNITY_EMPLOYER: 0.021,
    ILLNESS_MATERNITY_EMPLOYEE: 0.014,

    // Unemployment
    UNEMPLOYMENT_TOTAL: 0.01,
    UNEMPLOYMENT_EMPLOYER: 0.006,
    UNEMPLOYMENT_EMPLOYEE: 0.004,

    // Accident at work (employer only, varies 0.4%-1.1%, use 0.5% average for office work)
    ACCIDENT_EMPLOYER: 0.005,

    // Total employer social security: ~12.12% (Category III, low-risk)
    // Total employee social security: ~7.72%
  },

  // Health insurance: 8% total
  HEALTH: {
    TOTAL: 0.08,
    EMPLOYER: 0.048,            // 4.8%
    EMPLOYEE: 0.032,            // 3.2%
  },

  // Additional mandatory pension (universal, born after Dec 31, 1959)
  UNIVERSAL_PENSION: {
    TOTAL: 0.05,
    EMPLOYER: 0.028,            // 2.8%
    EMPLOYEE: 0.022,            // 2.2%
  },

  // Thresholds (BGN per month, 2026)
  MIN_INSURABLE_INCOME: 1213,   // BGN 1,213 (minimum wage 2026)
  MAX_INSURABLE_INCOME: 3850,   // BGN 3,850 (social security ceiling)

  // Summary totals (Category III, born after 1960, average risk)
  TOTAL_EMPLOYER_RATE: 0.1892,  // 18.92%
  TOTAL_EMPLOYEE_RATE: 0.1378,  // 13.78%

  // Leave entitlements
  MINIMUM_ANNUAL_LEAVE_DAYS: 20, // Working days
  PUBLIC_HOLIDAYS_PER_YEAR: 15,  // Approximate
} as const
```

### Salary Calculator Component Pattern
```typescript
// components/calculators/salary-calculator.tsx
'use client'
import { useState, useMemo } from 'react'
import { BG_TAX_2026 } from '@/lib/bulgarian-tax'

interface SalaryCalculatorProps {
  labels: {
    grossLabel: string
    netLabel: string
    resultTitle: string
    employerCostLabel: string
    // ...
  }
}

export function SalaryCalculator({ labels }: SalaryCalculatorProps) {
  const [grossSalary, setGrossSalary] = useState(2000)
  const [bornAfter1960, setBornAfter1960] = useState(true)

  const result = useMemo(() => {
    const insurable = Math.min(grossSalary, BG_TAX_2026.MAX_INSURABLE_INCOME)

    const employeeSocial = insurable * BG_TAX_2026.SOCIAL_SECURITY.PENSION_EMPLOYEE
      + insurable * BG_TAX_2026.SOCIAL_SECURITY.ILLNESS_MATERNITY_EMPLOYEE
      + insurable * BG_TAX_2026.SOCIAL_SECURITY.UNEMPLOYMENT_EMPLOYEE
      + insurable * BG_TAX_2026.HEALTH.EMPLOYEE
      + (bornAfter1960 ? insurable * BG_TAX_2026.UNIVERSAL_PENSION.EMPLOYEE : 0)

    const taxableIncome = grossSalary - employeeSocial
    const incomeTax = taxableIncome * BG_TAX_2026.INCOME_TAX_RATE
    const netSalary = grossSalary - employeeSocial - incomeTax

    const employerSocial = insurable * BG_TAX_2026.SOCIAL_SECURITY.PENSION_EMPLOYER
      + insurable * BG_TAX_2026.SOCIAL_SECURITY.ILLNESS_MATERNITY_EMPLOYER
      + insurable * BG_TAX_2026.SOCIAL_SECURITY.UNEMPLOYMENT_EMPLOYER
      + insurable * BG_TAX_2026.SOCIAL_SECURITY.ACCIDENT_EMPLOYER
      + insurable * BG_TAX_2026.HEALTH.EMPLOYER
      + (bornAfter1960 ? insurable * BG_TAX_2026.UNIVERSAL_PENSION.EMPLOYER : 0)

    const totalEmployerCost = grossSalary + employerSocial

    return { netSalary, employeeSocial, incomeTax, employerSocial, totalEmployerCost }
  }, [grossSalary, bornAfter1960])

  // ... render form inputs + result display
}
```

### Next.js Rewrite for Blog Proxy
```javascript
// next.config.mjs — rewrites section
async rewrites() {
  return {
    beforeFiles: [
      {
        source: '/blog',
        destination: `${process.env.HR_BLOG_URL || 'http://localhost:3013'}/`,
      },
      {
        source: '/blog/:path*',
        destination: `${process.env.HR_BLOG_URL || 'http://localhost:3013'}/:path*`,
      },
    ],
  }
},
```

### Section Reveal Animation Wrapper
```typescript
// components/ui/section-reveal.tsx
'use client'
import { motion, type Variants } from 'framer-motion'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

export function SectionReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

### Corporate Blue Palette (Claude's Discretion)
```javascript
// Recommended Tailwind color palette adjustment
// Inspired by BambooHR (#73b41a primary) and Personio (#0054FF primary)
// but shifted toward deeper corporate blue per user decision

colors: {
  primary: {
    DEFAULT: '#1B4DDB',     // Deeper corporate blue (was #215cff)
    light: '#3B6EF0',       // Lighter variant
    dark: '#133AAB',        // Hover/active state
    50: '#EEF2FF',          // Backgrounds
    100: '#DBE4FE',
    200: '#BCC8FC',
    500: '#1B4DDB',
    600: '#133AAB',
    700: '#0E2E80',
    900: '#0A1F5C',
  },
  accent: {
    DEFAULT: '#0EA5E9',     // Sky blue accent (replaces pink — more corporate)
    light: '#38BDF8',
    dark: '#0284C7',
  },
  navy: {
    DEFAULT: '#0F172A',     // Deeper navy (was #1E293B)
    light: '#1E293B',
    dark: '#020617',
    deep: '#030B24',        // Deepest for hero backgrounds
  },
  success: '#059669',       // Emerald for positive indicators
  warning: '#D97706',       // Amber for caution
  surface: {
    light: '#F0F4FE',       // Light blue tinted backgrounds
    lighter: '#F8FAFC',     // Near-white sections
  },
}
```

### Feature Row Component (Alternating Layout)
```typescript
// components/sections/feature-row.tsx
import Image from 'next/image'

interface FeatureRowProps {
  title: string
  description: string
  features: string[]
  imageSrc: string
  imageAlt: string
  reversed?: boolean
}

export function FeatureRow({ title, description, features, imageSrc, imageAlt, reversed }: FeatureRowProps) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${reversed ? 'lg:flex-row-reverse' : ''}`}>
      <div className={reversed ? 'lg:order-2' : ''}>
        <h3 className="text-3xl font-bold font-heading text-navy mb-4">{title}</h3>
        <p className="text-lg text-gray-600 mb-6">{description}</p>
        <ul className="space-y-3">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-3 text-gray-700">
              <svg className="w-5 h-5 text-primary flex-shrink-0" /* checkmark */ />
              {f}
            </li>
          ))}
        </ul>
      </div>
      <div className={reversed ? 'lg:order-1' : ''}>
        <div className="rounded-2xl border border-gray-200 shadow-lg overflow-hidden bg-gray-50">
          {/* Product screenshot mockup or placeholder */}
          <div className="aspect-[16/10] bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
            <span className="text-primary/30 text-lg font-medium">Product Screenshot</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package name | `motion` (rebranded) | 2024 | The package is still published as `framer-motion` on npm but the official site is now motion.dev. The API is identical. |
| CSS scroll-linked animations | `whileInView` + `useInView` | framer-motion 7+ | Built-in IntersectionObserver integration; no need for custom hooks |
| next-intl v3 `createSharedPathnamesNavigation` | next-intl v4 `createNavigation` | 2024 | Already using v4 pattern in `navigation.ts` |
| Tailwind CSS v4 | Still Tailwind v3 in this project | 2024 | app/hr uses Tailwind 3.4; no migration needed for this phase |

**Deprecated/outdated:**
- `swiper/css` imports: Still valid in Swiper 12, but the project may not need Swiper if testimonials don't use a carousel. Could use a simpler approach.

## Open Questions

1. **Blog Proxy — Shared Header/Footer**
   - What we know: The decision says "shared header/footer navigation — visually identical across both apps." The Astro hr-blog has its own layout.
   - What's unclear: Whether the Astro blog should be modified to use the same header/footer HTML, or if the Next.js rewrite proxy approach will naturally wrap Astro content in the Next.js layout.
   - Recommendation: Next.js rewrites return the raw Astro HTML — they do NOT wrap it in the Next.js layout. Two approaches: (a) style the Astro blog header/footer to match exactly, or (b) use a `[...slug]` catch-all page that fetches Astro content and renders it within the Next.js layout. Approach (b) is more reliable for visual consistency but more complex. Approach (a) is simpler and the standard pattern. **Recommend approach (a)**: style the Astro blog to match, since the rewrite is the simplest integration path.

2. **Product Screenshots/Mockups**
   - What we know: Features page needs product screenshots showing the HR SaaS UI. Social proof needs company logos.
   - What's unclear: There are no actual product screenshots or logo assets in the repo. The product doesn't exist yet.
   - Recommendation: Use placeholder mockup frames (browser chrome + gradient/skeleton content) that look professional. Use SVG gradient placeholders, not lorem-ipsum-style stock photos. Company logos on social proof sections should use placeholder boxes with "Company Name" text.

3. **Email-Gated Template Downloads — Backend**
   - What we know: Templates need email-gated download. Forms capture email before allowing download.
   - What's unclear: Where to store captured emails (no backend API for lead capture exists). What file format templates download as.
   - Recommendation: For MVP, use `localStorage` to gate downloads (if email submitted, allow download). Store email capture submissions in localStorage. When backend lead capture endpoint exists, swap to API call. Templates can be static PDF files in `/public/templates/`.

4. **Blog Post Cards on Homepage**
   - What we know: Homepage should show latest 3 blog posts in a card grid.
   - What's unclear: How to fetch blog post data from the Astro hr-blog (it's a separate SSG app with no API).
   - Recommendation: Use a shared RSS feed. The Astro hr-blog generates RSS via `@astrojs/rss`. The Next.js homepage can fetch the RSS feed at build time (or ISR) from the blog's `/rss.xml` endpoint. Parse the XML and render 3 cards. Alternative: hardcode placeholder blog posts in the i18n messages (already done in current blog page stub).

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis: `app/hr/` — 40+ files examined, all components and pages reviewed
- Existing codebase: `package.json` — all dependency versions confirmed installed
- PWC Tax Summaries Bulgaria 2026 — social security rates (https://taxsummaries.pwc.com/bulgaria/individual/other-taxes)
- Bulgarian Ministry of Economy — contribution rates (https://www.mi.government.bg/en/general/vaznagrajdeniya-i-osigurovki/)

### Secondary (MEDIUM confidence)
- Eurofast — Bulgaria minimum wage 2026: BGN 1,213 (https://eurofast.eu/bulgaria-to-increase-its-minimum-wage-from-2026/)
- BTA — Maximum insurable income 2026: BGN 3,850 ceiling confirmed (https://www.bta.bg/en/news/bulgaria/1036420)
- Next.js official docs — rewrites configuration (https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites)
- motion.dev — scroll animation docs (https://motion.dev/docs/react-scroll-animations)
- next-intl docs — middleware proxy integration (https://next-intl.dev/docs/routing/middleware)

### Tertiary (LOW confidence)
- Individual fund breakdowns (pension/illness/unemployment splits): The exact employer/employee split ratios for individual funds (60/40 pension, etc.) are from training data, not verified against official 2026 gazette. The totals (18.92% employer, 13.78% employee) are verified. Individual fund splits should be cross-checked against the National Revenue Agency (NAP) website before publishing calculators.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All packages already installed and working; no new dependencies needed
- Architecture: HIGH — Existing patterns well-established; new pages follow identical structure
- Pitfalls: HIGH — Based on direct codebase analysis; common Next.js + next-intl issues documented
- Bulgarian tax rates: MEDIUM — Total rates verified (PWC + Ministry); individual fund breakdowns need NAP cross-check
- Blog proxy integration: MEDIUM — Standard Next.js rewrite pattern; middleware interaction needs testing

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (stable stack; tax rates valid for 2026 calendar year)
