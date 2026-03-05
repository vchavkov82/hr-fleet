# Phase 1: HR App - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Build and polish all marketing pages for the HR SaaS product (app/hr/) — a Bulgarian-language marketing site for a full HR suite targeting Bulgarian SMBs. This includes homepage, features, pricing, hr-tools (calculators + templates), blog integration, auth flows, and all supporting pages (about, partners, careers, api-docs, help-center, contact, legal). The app already has route stubs; this phase fills them with real, polished, production-ready content and components.

</domain>

<decisions>
## Implementation Decisions

### Product & Audience
- Full HR suite: ATS + employee management, leave tracking, payroll integration, performance reviews, onboarding
- Target audience: Bulgarian SMBs (10-200 employees) — HR managers, office managers, founders
- Keep existing next-intl i18n setup (Bulgarian primary + English available)

### Page Scope
- All pages get polished: home, features, pricing, hr-tools, blog, auth (login/sign-up), about, partners, careers, api-docs, help-center, contact, and legal pages (privacy, terms, cookies, gdpr)
- No page is deferred — every route gets real content

### Visual Design
- Own identity separate from the jobs platform (not RemotePass-inspired)
- Clean & professional vibe — think BambooHR, Personio
- More corporate blue palette — deeper navy/blue tones, muted accents, enterprise-feeling (like Workday, SAP)
- Existing #215cff blue and #EC4899 pink need adjustment toward this corporate direction
- Mix of product screenshots/mockups on feature pages and illustrations for conceptual sections

### Homepage Layout
- Product screenshot hero: headline + subtext on left, large product screenshot/mockup on right (classic SaaS)
- Social proof with placeholder content — testimonial sections, company logo strips, stat counters
- Latest 3 blog posts shown in a card grid on the homepage

### Features Page
- Alternating rows: screenshot left / text right, swap for next feature
- Each feature gets a full section with description and product screenshot

### Pricing Page
- Per-module pricing structure (base price + add-on modules: ATS, Leave, Payroll, etc.)
- "Contact for pricing" — no public prices shown, "Get a quote" forms instead
- Feature comparison table showing what's included in each module

### HR-Tools Page
- Both interactive calculators AND downloadable templates
- Calculators: salary (net/gross), leave day, total employment cost — all using real 2026 Bulgarian tax/social security rates
- Each calculator on its own URL: /hr-tools/salary-calculator, /hr-tools/leave-calculator, etc.
- Calculators embedded in SEO content pages with explanatory content about Bulgarian payroll/leave laws
- Templates: full HR document set — contracts, job descriptions, leave policies, onboarding checklists, performance review forms, termination docs
- Each template on its own URL: /hr-tools/templates/employment-contract, etc.
- Templates are email-gated — enter email to download (lead capture)

### Conversion Flow
- Primary CTA: "Start free trial" — free trial sign-up across the site
- Simple sign-up form: name, email, password, company name — instant account creation
- CTA placement: sticky header button + hero section CTA + closing CTA section at page bottom
- No demo request path (just free trial)

### Blog Integration
- Astro blog (app/hr-blog) served at /blog via subpath proxy through Next.js rewrite
- Next.js /blog route acts as proxy entry point to the Astro app
- Shared header/footer navigation — visually identical across both apps, user doesn't notice transition
- Homepage shows latest 3 blog posts in a card grid

### Mobile Experience
- Desktop-first design, responsive adaptation for mobile
- Hamburger menu for mobile navigation
- Calculators use same layout, inputs stack vertically on mobile (standard responsive)

### Animation & Interactions
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

</decisions>

<specifics>
## Specific Ideas

- "Clean & professional like BambooHR or Personio" — trust-building, corporate-friendly aesthetic
- "More corporate blue like Workday or SAP" — deeper navy/blue tones vs current bright blue
- Product screenshot hero (left text, right screenshot) is the classic SaaS landing page pattern
- Calculators should use real Bulgarian tax rates for credibility and SEO value
- Each tool/template gets its own URL for independent SEO ranking
- Blog integration via reverse proxy so URLs are seamless (/blog/*)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-hr-app*
*Context gathered: 2026-02-25*
