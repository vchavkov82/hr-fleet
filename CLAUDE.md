# HR Docs — Astro 5 Starlight Documentation

## Product
Product documentation for the HR SaaS application. Helps users (HR managers, recruiters, admins) understand and use the platform. Also serves as SEO content for product-specific search queries.

## Tech Stack

- **Framework**: Astro 5 with Starlight (official Astro docs theme)
- **Content**: Markdoc + MDX (via `@astrojs/markdoc`, `@astrojs/starlight-markdoc`)
- **Search**: Algolia DocSearch (`@astrojs/starlight-docsearch`)
- **Styling**: Starlight-Tailwind integration (`@astrojs/starlight-tailwind`)
- **React**: `@astrojs/react` for interactive components
- **Sitemap**: `@astrojs/sitemap`
- **Port**: 3011

## Content Structure (`src/`)

```
content/
  docs/           → Documentation pages (.mdx or .mdoc files)
    getting-started/
    features/
    guides/
    api-reference/
config/           → Starlight sidebar and nav configuration
```

## Authoring Conventions

### Frontmatter
```yaml
---
title: "Page Title"
description: "Clear description for search and meta tags"
sidebar:
  order: 1        # Position in sidebar group
---
```

### Writing style
- Clear, task-oriented headings: "How to post a job", "Managing applications"
- Step-by-step numbered lists for procedures
- Code blocks with explicit language tags
- Notes/warnings using Starlight's `:::note` / `:::caution` / `:::tip` asides
- Screenshots should be in `src/assets/` with descriptive filenames

## Commands

```bash
# From repo root
make dev-hr-docs       # Start dev server on port 3011

# From app/hr-docs/
bun dev               # Astro Starlight dev server
bun build             # Production build
bun preview           # Preview build
```

---

## Review Protocol

After adding or modifying documentation pages, run the following review agents **before committing**:

### Frontend Quality Review
Invoke the `frontend-design` skill to check:
- Custom React components within docs (interactive demos, code playgrounds)
- Starlight theme customizations — ensure consistency with HR brand
- Callout/aside usage for important information
- Navigation clarity and information architecture

### SEO Review
Invoke the `seo-audit` skill to verify:
- Page `title` and `description` frontmatter for every new page
- Heading hierarchy (Starlight auto-generates `h1` from title — start content at `h2`)
- Sitemap includes all new docs pages
- Internal cross-links between related documentation sections

### Schema Markup
Invoke the `schema-markup` skill for:
- `TechArticle` JSON-LD on feature documentation pages
- `HowTo` schema for step-by-step procedure guides
