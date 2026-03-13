# HR Blog — Astro 5 Blog (AstroPaper Template)

## Product
Content marketing blog for the HR SaaS product. Drives organic traffic via SEO-optimized HR/recruitment articles. Built on AstroPaper, a high-performance Astro 5 blog template.

## Tech Stack

- **Framework**: Astro 5 (content collections, SSG)
- **Template**: AstroPaper v5
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Search**: Pagefind (static full-text search, built into `dist/`)
- **Feed**: `@astrojs/rss`
- **Sitemap**: `@astrojs/sitemap`
- **OG Images**: `@resvg/resvg-js` (server-side SVG → PNG)
- **Package manager**: bun
- **Port**: 3013

## Content Structure (`src/`)

```
content/
  blog/           → Blog posts (.md / .mdx files)
  authors/        → Author profiles
data/             → Site config, social links
layouts/          → Post, page, and base layouts
pages/
  posts/          → Post listing, pagination
  tags/           → Tag index and filtered views
  about.md        → About page
  rss.xml.ts      → RSS feed
scripts/
  generateOgImages.ts   → OG image generation at build
```

## Authoring Conventions

### Frontmatter (required for all posts)
```yaml
---
title: "Article Title"
description: "150-160 char meta description"
pubDate: 2026-01-01
author: "Author Name"
tags: ["hr", "recruitment"]
featured: false
draft: false
---
```

### Content guidelines
- Articles target HR managers, recruiters, business owners in Bulgaria
- Minimum 800 words for SEO value; 1500+ for pillar content
- Use `## H2` headings for structure (Pagefind indexes these)
- Internal links to other blog posts and to `app/hr/` marketing pages
- Always include a concluding CTA linking to the HR SaaS product

## Commands

```bash
# From repo root
make dev-hr-blog       # Start dev server on port 3013

# From app/hr-blog/
bun dev               # Astro dev server
bun build             # astro check + build + pagefind + copy pagefind to public/
bun preview           # Preview production build
bun lint              # ESLint
bun format            # Prettier
```

## Build Notes
- `bun build` runs `astro check && astro build && pagefind --site dist && cp -r dist/pagefind public/`
- Pagefind index must be rebuilt with every content change for search to stay current
- OG images are generated at build time via `scripts/generateOgImages.ts`

---

## Review Protocol

After adding or modifying content/pages, run the following review agents **before committing**:

### SEO Review
Invoke the `seo-audit` skill to verify:
- Frontmatter `title` (50-60 chars) and `description` (150-160 chars) for every post
- Heading hierarchy (`h1` → `h2` → `h3`, no skipped levels)
- Internal linking density (≥2 internal links per post)
- Image alt attributes (all images must have descriptive alt text)
- Canonical URL generation in `astro.config.ts`
- RSS feed and sitemap include all new posts

### Schema Markup
Invoke the `schema-markup` skill to verify:
- `Article` or `BlogPosting` JSON-LD on every post page
- `BreadcrumbList` structured data
- `Person` schema for author pages

### AI Search Visibility
After publishing new posts, invoke the `ai-seo` skill to ensure:
- Content answers specific HR questions in citation-friendly format
- Key facts are stated clearly and early (LLMs prefer front-loaded answers)
- Post is linkable and citable for AI Overviews

### Programmatic SEO
When creating category/tag/topic landing pages at scale, invoke the `programmatic-seo` skill.
