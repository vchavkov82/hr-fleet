# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this directory.

## App

HR product documentation (`@hr/docs`). Astro 5 + Starlight docs theme.

## Commands

```bash
pnpm dev                # Dev server on port 5011
pnpm build              # Production build
pnpm preview            # Preview build
```

## Tech Stack

- **Framework**: Astro 5 with Starlight 0.37
- **Content**: Markdoc + MDX
- **Search**: Algolia DocSearch
- **Styling**: Tailwind CSS v4 via Starlight-Tailwind integration
- **Interactive components**: React 18 + shadcn/ui (new-york style)
- **Icons**: Lucide
- **Code blocks**: Expressive Code (One Light + One Dark Pro themes)
- **Images**: Cloudflare Image Resizing
- **Locales**: English (root) + Bulgarian (bg)
- **Site URL**: https://docs.jobshr.com

## Architecture

```
src/
├── content/docs/       # Documentation pages (.mdx, .mdoc)
│   ├── getting-started/
│   ├── features/
│   ├── integrations/
│   ├── api/
│   ├── enterprise/
│   └── bg/             # Bulgarian translations
├── components/         # Astro + React components
│   └── ui/             # shadcn/ui components
├── data/               # Data files for showcases and coverage tables
├── config/             # Sidebar and nav configuration
├── fonts/              # Aeonik font family (Fono, Mono, Pro)
├── hooks/              # React custom hooks
├── lib/utils.ts        # clsx + tailwind-merge utility
└── styles/global.css   # Global styles
```

## Content Authoring

- Starlight auto-generates `h1` from `title` frontmatter — start content at `h2`
- Sidebar is auto-generated from directory structure (configured in astro.config.mjs)
- Use `:::note` / `:::caution` / `:::tip` for Starlight asides
- Every page needs `title` and `description` frontmatter

## Key Config

- Path alias: `@/*` → `./src/*`
- shadcn/ui: components.json with new-york style, neutral base color
- Expressive Code: line numbers plugin (off by default)

## Review Protocol

After modifying docs pages, invoke these skills before committing:
- `frontend-design` — check component consistency
- `seo-audit` — verify frontmatter, heading hierarchy, cross-links
- `schema-markup` — add TechArticle/HowTo JSON-LD as appropriate
