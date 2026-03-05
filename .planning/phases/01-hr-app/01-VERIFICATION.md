---
phase: 01-hr-app
verified: 2026-02-25T07:22:59Z
status: human_needed
score: 20/20 must-haves verified
human_verification:
  - test: "Open http://localhost:3010/bg and http://localhost:3010/en — toggle language switcher"
    expected: "All visible page text switches between Bulgarian and English with no missing-key placeholders"
    why_human: "Cannot confirm runtime i18n rendering without running both apps"
  - test: "Visit http://localhost:3010/hr-tools/salary-calculator, enter gross 3000 BGN"
    expected: "Net salary displays approximately 2282 BGN; breakdown shows employee/employer contributions from BG_TAX_2026"
    why_human: "Calculator math correctness requires rendered React state — cannot verify via static analysis alone"
  - test: "Visit http://localhost:3010/pricing — verify no currency amounts appear anywhere on the page"
    expected: "Page shows module cards with 'Get a quote' buttons only; no BGN, EUR, лв., or /month strings visible to user"
    why_human: "Currency strings might appear inside translated bg.json/en.json values rendered at runtime"
  - test: "Visit http://localhost:3010/hr-tools/templates/employment-contract and click 'Download free'"
    expected: "EmailGateModal opens; after submitting name+email, localStorage stores the lead and marks template as unlocked"
    why_human: "Modal interaction and localStorage behavior require browser execution"
  - test: "Start both apps (make dev-hr and make dev-hr-blog), then visit http://localhost:3010/blog"
    expected: "Blog content from Astro hr-blog (port 3013) renders at /blog without locale redirect"
    why_human: "Proxy only works when Astro app is running; cannot verify cross-app rewrite statically"
  - test: "Visit http://localhost:3010/auth/sign-up on desktop — verify split-screen layout"
    expected: "Left half shows navy panel with branding, right half shows sign-up form with 4 fields: name, email, password, company name"
    why_human: "Split-screen layout and visual appearance require browser rendering"
---

# Phase 1: HR App Verification Report

**Phase Goal:** All marketing pages for the HR SaaS product (app/hr/) are polished with a corporate blue design system, product screenshot hero, alternating feature rows, per-module "get a quote" pricing, interactive Bulgarian tax calculators on individual URLs, email-gated HR template downloads, blog integration via Next.js rewrite proxy, and complete Bulgarian translations — making the site production-ready for the Bulgarian SMB audience.
**Verified:** 2026-02-25T07:22:59Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

All 10 plans executed. 20/20 automated must-haves pass. Six items require human (browser) verification.

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | Corporate blue palette (#1B4DDB primary, #0EA5E9 accent) in Tailwind | VERIFIED | `tailwind.config.js` grep confirmed both hex values |
| 2  | SectionReveal and Counter are 'use client' framer-motion components | VERIFIED | Both files exist with `'use client'` and `from 'framer-motion'` imports |
| 3  | BG_TAX_2026 constants module exists with INCOME_TAX_RATE and social rates | VERIFIED | `src/lib/bulgarian-tax.ts` exports `BG_TAX_2026` with `INCOME_TAX_RATE` |
| 4  | Header has "Start free trial" CTA linking to /auth/sign-up | VERIFIED | `header.tsx` contains `startFree` pattern and `auth/sign-up` href |
| 5  | Homepage hero has two-column grid layout with trusted companies strip | VERIFIED | `hero.tsx` contains `grid-cols` and `trusted` patterns |
| 6  | Homepage includes TrustedCompanies, BlogPosts, SectionReveal, Counter (via StatsCounters) | VERIFIED | All four imported and used in `[locale]/page.tsx` |
| 7  | Features page has 6 alternating FeatureRow sections (ats/employees/leave/payroll/performance/onboarding) | VERIFIED | `FEATURE_SECTIONS` array with 6 entries; FeatureRow rendered via map |
| 8  | Pricing page shows "get a quote" model with QuoteForm; no currency strings in JSX | VERIFIED | `QuoteForm` imported and rendered; pricing JSX has no BGN/EUR/лв. strings (values come from i18n) |
| 9  | Three calculators exist on individual URLs with BG_TAX_2026 integration | VERIFIED | `/hr-tools/salary-calculator`, `/leave-calculator`, `/employment-cost-calculator` pages all exist; all three calculator components import `BG_TAX_2026` |
| 10 | Salary calculator uses bg-BG locale number formatting | VERIFIED | `Intl.NumberFormat('bg-BG', { currency: 'BGN' })` in `salary-calculator.tsx` |
| 11 | EmailGateModal + TemplateDownloadCard exist; 6 template pages on individual URLs | VERIFIED | All 6 template pages confirmed; chain: template pages → `TemplatePageLayout` → `TemplateDownloadCard` → `EmailGateModal` |
| 12 | EmailGateModal stores lead to localStorage on submit | VERIFIED | `localStorage.setItem('template_leads', ...)` and `template_unlocked_${templateSlug}` in `email-gate-modal.tsx` |
| 13 | All supporting pages (about, contact, partners, careers, api-docs, help-center) have generateStaticParams | VERIFIED | All 6 confirmed |
| 14 | About page uses Counter for animated stats (via AboutStats component) | VERIFIED | `about-stats.tsx` imports `Counter` from `@/components/ui/counter`; used 4 times |
| 15 | Legal pages (terms, privacy, cookies, gdpr) have generateStaticParams | VERIFIED | All 4 confirmed |
| 16 | Auth pages (sign-up, login) have split-screen grid-cols-1 lg:grid-cols-2 layout | VERIFIED | Both `sign-up/page.tsx` and `login/page.tsx` contain `grid grid-cols-1 lg:grid-cols-2` |
| 17 | Sign-up form has company name field | VERIFIED | `SignUpForm.tsx` has `company` field with validation, label, and input |
| 18 | Blog proxy configured in next.config.mjs with beforeFiles rewrites to port 3013 | VERIFIED | `beforeFiles` and `3013` confirmed in `next.config.mjs` |
| 19 | Middleware excludes /blog paths from locale injection | VERIFIED | `middleware.ts` wraps next-intl, returns `NextResponse.next()` for `/blog` paths |
| 20 | bg.json has complete Bulgarian translations matching en.json top-level structure (2540 lines) | VERIFIED | Node check confirms top-level key structure matches; 2540 lines vs 2516 in en.json |

**Score:** 20/20 truths verified

### Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `app/hr/tailwind.config.js` | VERIFIED | Contains `#1B4DDB` primary and `#0EA5E9` accent |
| `app/hr/src/components/ui/section-reveal.tsx` | VERIFIED | `'use client'`, `from 'framer-motion'` |
| `app/hr/src/components/ui/counter.tsx` | VERIFIED | `'use client'`, `from 'framer-motion'` |
| `app/hr/src/lib/bulgarian-tax.ts` | VERIFIED | Exports `BG_TAX_2026` with `INCOME_TAX_RATE` |
| `app/hr/src/components/layout/header.tsx` | VERIFIED | `startFree` pattern, `auth/sign-up` link |
| `app/hr/src/components/sections/hero.tsx` | VERIFIED | `grid-cols`, `trusted` patterns |
| `app/hr/src/components/sections/trusted-companies.tsx` | VERIFIED | Contains `trusted` |
| `app/hr/src/components/sections/blog-posts.tsx` | VERIFIED | Contains `blog` |
| `app/hr/src/components/sections/testimonials.tsx` | VERIFIED | Contains `testimonial` |
| `app/hr/src/components/sections/feature-row.tsx` | VERIFIED | Contains `reversed` prop |
| `app/hr/src/app/[locale]/features/page.tsx` | VERIFIED | Imports `FeatureRow`, 6 entries in FEATURE_SECTIONS |
| `app/hr/src/app/[locale]/pricing/page.tsx` | VERIFIED | Imports `QuoteForm`, no hardcoded currency in JSX |
| `app/hr/src/components/ui/quote-form.tsx` | VERIFIED | `'use client'`, stores to localStorage on submit |
| `app/hr/src/components/calculators/salary-calculator.tsx` | VERIFIED | `'use client'`, imports `BG_TAX_2026`, `bg-BG` locale formatting |
| `app/hr/src/components/calculators/leave-calculator.tsx` | VERIFIED | `'use client'`, imports `BG_TAX_2026` |
| `app/hr/src/components/calculators/employment-cost-calculator.tsx` | VERIFIED | `'use client'`, imports `BG_TAX_2026` |
| `app/hr/src/app/[locale]/hr-tools/salary-calculator/page.tsx` | VERIFIED | Imports `SalaryCalculator`, 122 lines (SEO content present) |
| `app/hr/src/app/[locale]/hr-tools/leave-calculator/page.tsx` | VERIFIED | 117 lines (SEO content present) |
| `app/hr/src/app/[locale]/hr-tools/employment-cost-calculator/page.tsx` | VERIFIED | Exists |
| `app/hr/src/components/ui/email-gate-modal.tsx` | VERIFIED | `'use client'`, uses `Dialog` from headlessui, localStorage logic |
| `app/hr/src/components/ui/template-download-card.tsx` | VERIFIED | Imports `EmailGateModal` |
| `app/hr/src/app/[locale]/hr-tools/templates/page.tsx` | VERIFIED | Contains `template` |
| `app/hr/src/app/[locale]/hr-tools/templates/employment-contract/page.tsx` | VERIFIED | Uses `TemplatePageLayout` (which wires EmailGateModal) |
| `app/hr/src/app/[locale]/hr-tools/templates/job-description/page.tsx` | VERIFIED | Exists |
| `app/hr/src/app/[locale]/hr-tools/templates/leave-policy/page.tsx` | VERIFIED | Exists |
| `app/hr/src/app/[locale]/hr-tools/templates/onboarding-checklist/page.tsx` | VERIFIED | Exists |
| `app/hr/src/app/[locale]/hr-tools/templates/performance-review/page.tsx` | VERIFIED | Exists |
| `app/hr/src/app/[locale]/hr-tools/templates/termination-document/page.tsx` | VERIFIED | Exists |
| `app/hr/src/app/[locale]/about/page.tsx` | VERIFIED | Has `team`, `generateStaticParams` |
| `app/hr/src/app/[locale]/about/about-stats.tsx` | VERIFIED | Imports `Counter`, 4 Counter instances |
| `app/hr/src/app/[locale]/contact/page.tsx` | VERIFIED | Has `contact`, `generateStaticParams` |
| `app/hr/src/app/[locale]/partners/page.tsx` | VERIFIED | Has `generateStaticParams` |
| `app/hr/src/app/[locale]/careers/page.tsx` | VERIFIED | Has `careers`, `generateStaticParams` |
| `app/hr/src/app/[locale]/api-docs/page.tsx` | VERIFIED | Has `generateStaticParams` |
| `app/hr/src/app/[locale]/help-center/page.tsx` | VERIFIED | Has `generateStaticParams` |
| `app/hr/src/app/[locale]/terms/page.tsx` | VERIFIED | Has `terms`, `generateStaticParams` |
| `app/hr/src/app/[locale]/privacy/page.tsx` | VERIFIED | Has `privacy`, `generateStaticParams` |
| `app/hr/src/app/[locale]/cookies/page.tsx` | VERIFIED | Has `generateStaticParams` |
| `app/hr/src/app/[locale]/gdpr/page.tsx` | VERIFIED | Has `generateStaticParams` |
| `app/hr/src/app/[locale]/auth/sign-up/page.tsx` | VERIFIED | `grid grid-cols-1 lg:grid-cols-2`; `SignUpForm` with company field |
| `app/hr/src/app/[locale]/auth/login/page.tsx` | VERIFIED | `grid grid-cols-1 lg:grid-cols-2` |
| `app/hr/src/app/[locale]/system-status/page.tsx` | VERIFIED | Has `generateStaticParams` |
| `app/hr/next.config.mjs` | VERIFIED | `beforeFiles` rewrites with port `3013` |
| `app/hr/src/middleware.ts` | VERIFIED | Wraps next-intl, skips `/blog` paths |
| `app/hr/messages/bg.json` | VERIFIED | 2540 lines, top-level keys match en.json structure |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `section-reveal.tsx` | framer-motion | `import { motion }` | WIRED | `from 'framer-motion'` confirmed |
| `counter.tsx` | framer-motion | `useInView, useSpring, useMotionValue` | WIRED | `from 'framer-motion'` confirmed |
| `header.tsx` | `/auth/sign-up` | `Link href` | WIRED | `auth/sign-up` pattern in file |
| `[locale]/page.tsx` | `SectionReveal` | import | WIRED | Imported and used |
| `[locale]/page.tsx` | `Counter` (via StatsCounters) | import | WIRED | `StatsCounters` imported; uses `Counter` |
| `features/page.tsx` | `FeatureRow` | import | WIRED | Imported and used in map |
| `pricing/page.tsx` | `QuoteForm` | import | WIRED | Imported and rendered |
| `salary-calculator.tsx` | `BG_TAX_2026` | `import { BG_TAX_2026 }` | WIRED | Used throughout computation |
| `leave-calculator.tsx` | `BG_TAX_2026` | `import { BG_TAX_2026 }` | WIRED | Used for leave day constants |
| `employment-cost-calculator.tsx` | `BG_TAX_2026` | `import { BG_TAX_2026 }` | WIRED | Used for employer cost computation |
| `salary-calculator/page.tsx` | `SalaryCalculator` | import | WIRED | Imported and rendered with `labels` prop |
| `email-gate-modal.tsx` | localStorage | direct call | WIRED | `localStorage.setItem` for leads and unlock key |
| `template-download-card.tsx` | `EmailGateModal` | import | WIRED | Imported and rendered at line 107 |
| `template-page-layout.tsx` | `TemplateDownloadCard` | import | WIRED | Imported and rendered |
| `about-stats.tsx` | `Counter` | import | WIRED | 4 Counter instances rendered |
| `next.config.mjs` | `http://localhost:3013` | `beforeFiles` rewrite | WIRED | Source `/blog/:path*` proxied to port 3013 |
| `middleware.ts` | blog exclusion | path check before intlMiddleware | WIRED | `pathname.startsWith('/blog')` returns early |

### Requirements Coverage

No explicit requirement IDs were assigned to Phase 15 — the phase goal serves as the specification. All deliverables map directly to the phase goal statement and have been verified above.

### Anti-Patterns Found

No blockers detected. The following are informational:

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `[locale]/blog/page.tsx` | Blog page is a visual fallback card grid, not the actual proxy target | INFO | By design — the page shows when Astro blog is down. Proxy works at Next.js rewrite level, not page level. |
| `quote-form.tsx` | Stores to localStorage only (no backend endpoint) | INFO | Per plan design — lead capture without backend. Acceptable for marketing site phase. |
| `email-gate-modal.tsx` | No actual PDF served — template marked unlocked client-side only | INFO | Per plan 07 decision: "Template will be emailed to you" model. No real PDF required in /public/templates/. |

### Human Verification Required

#### 1. Bulgarian Language Rendering

**Test:** Start `make dev-hr`, open http://localhost:3010/bg and http://localhost:3010/en, toggle between languages using the language switcher
**Expected:** All visible text switches languages with no missing-key placeholders (no raw key strings like `pages.about.heading`)
**Why human:** Runtime i18n rendering cannot be verified via static analysis; missing keys only surface at render time

#### 2. Salary Calculator Math Correctness

**Test:** Visit http://localhost:3010/hr-tools/salary-calculator, enter 3000 BGN gross, ensure "born after 1960" is checked
**Expected:** Net salary displays approximately 2282 BGN; breakdown table shows employee social (~414 BGN), income tax (~259 BGN), employer total cost (~3568 BGN)
**Why human:** Calculator correctness requires rendered React state and user interaction; static grep cannot execute the useMemo computation

#### 3. Pricing Page — No Visible Currency

**Test:** Visit http://localhost:3010/pricing and http://localhost:3010/bg/pricing in browser, inspect all visible text
**Expected:** Zero occurrences of BGN, EUR, лв., $, or per-month language visible to user
**Why human:** Currency strings may exist inside bg.json/en.json values rendered at runtime — cannot guarantee via static file scan

#### 4. Email-Gated Template Download Flow

**Test:** Visit http://localhost:3010/hr-tools/templates/employment-contract, click "Download free", submit name + email in modal
**Expected:** EmailGateModal opens; after submission, modal closes; `template_leads` array in localStorage contains the entry; `template_unlocked_employment-contract` is set to `'true'` in localStorage
**Why human:** Modal opening, form submission, and localStorage state require browser execution

#### 5. Blog Proxy Functionality

**Test:** Start both `make dev-hr` (port 3010) and `make dev-hr-blog` (port 3013), then visit http://localhost:3010/blog
**Expected:** Astro hr-blog content renders at /blog without being redirected to /en/blog or /bg/blog; Next.js does not inject locale prefix
**Why human:** Cross-app proxy only functions when Astro blog process is running; cannot verify without both apps active

#### 6. Auth Split-Screen Visual Layout

**Test:** Visit http://localhost:3010/auth/sign-up on desktop viewport (>1024px)
**Expected:** Left half shows navy (#030B24) panel with logo, "Start managing HR smarter" headline, and benefit bullet points; right half shows white form with Name, Email, Password, Company name fields and "Start free trial" button
**Why human:** Split-screen layout correctness and visual quality require browser rendering

---

_Verified: 2026-02-25T07:22:59Z_
_Verifier: Claude (gsd-verifier)_
