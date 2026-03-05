# Unified Design System - HR Platform

## Overview

This project consolidates the design and visual identity across three web applications:
- **Blog** (Astro) - Now serves as the main homepage
- **WWW** (Next.js) - Marketing site with specialized features
- **Docs** (Astro + Starlight) - Documentation site

## Architecture

### Shared Design System (`packages/design-system`)

A central package containing design tokens and components shared across all applications.

**Exports:**
- `tokens/colors.ts` - Unified color palette
- `tokens/typography.ts` - Typography scales and font definitions
- `tailwind.config.ts` - Tailwind configuration for all projects
- `components/header.tsx` - Unified header component
- `components/footer.tsx` - Unified footer component

### Color Palette

| Name | Primary | Light | Dark | Usage |
|------|---------|-------|------|-------|
| Primary Blue | #1B4DDB | #3B6EF0 | #133AAB | Main brand color, CTAs |
| Navy | #0F172A | #1E293B | #020617 | Text, backgrounds |
| Accent | #0EA5E9 | #38BDF8 | #0284C7 | Secondary actions |
| Gray | Various | - | - | Neutral elements |

### Typography

- **Sans Serif** (Body): Inter
- **Display/Heading**: Mulish
- **Font Weights**: Light (300), Regular (400), Medium (500), Semibold (600), Bold (700), Black (900)

### Design Patterns

#### Sections
All marketing sections follow this pattern:
```tsx
<section className="py-20 sm:py-28 bg-[color]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Content */}
  </div>
</section>
```

#### Component Sizing
- Section padding: `py-20` (desktop), `py-28` (larger)
- Container padding: `px-4 sm:px-6 lg:px-8`
- Gap spacing: `gap-8`, `gap-12` (for large sections)

## Project Structure

### Blog (`blog/`)
**Framework**: Astro 5.16+
**Purpose**: Main homepage + blog content

**Homepage Sections** (in order):
1. `HeroSection.astro` - Hero with CTA
2. `FeaturesSection.astro` - Product features grid
3. `StatsSection.astro` - Key metrics
4. Blog posts section - Featured and recent articles
5. `CTASection.astro` - Call-to-action

**Key Files:**
- `src/pages/index.astro` - Main homepage
- `src/components/Header.astro` - Navigation header
- `src/components/Footer.astro` - Footer with links
- `src/styles/global.css` - Global styles with Tailwind

### WWW (`www/`)
**Framework**: Next.js 15+
**Purpose**: Specialized features, pricing, tools

**Key Pages:**
- `/[locale]/features` - Feature showcase
- `/[locale]/pricing` - Pricing page
- `/[locale]/hr-tools` - HR tools and calculators
- `/[locale]/blog` - Blog listing (links to main blog)

**Header Component**: `src/components/layout/header.tsx`
**Footer Component**: `src/components/layout/footer.tsx`

### Docs (`docs/`)
**Framework**: Astro 5.16+ + Starlight
**Purpose**: Comprehensive documentation

**Uses**: Starlight framework with custom styling

## Implementation Steps

### Setup Instructions

1. **Install dependencies:**
```bash
npm install
# or
pnpm install
```

2. **Run development servers:**
```bash
npm run dev
# Starts all three projects:
# - www: http://localhost:3010
# - blog: http://localhost:3013
# - docs: http://localhost:3011
```

3. **Build all projects:**
```bash
npm run build
```

### Customization Guide

#### Changing Colors
Edit `packages/design-system/tokens/colors.ts`:
```typescript
export const colors = {
  primary: {
    DEFAULT: '#1B4DDB', // Change primary blue
    light: '#3B6EF0',
    dark: '#133AAB',
    // ... rest of palette
  }
}
```

#### Updating Typography
Edit `packages/design-system/tokens/typography.ts`:
```typescript
export const typography = {
  fontFamily: {
    sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
    heading: ['var(--font-mulish)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
  }
}
```

#### Adding New Sections
Create new Astro components in `blog/src/components/`:
```astro
---
// New section component
---

<section class="py-20 sm:py-28 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Your content */}
  </div>
</section>
```

Then import and use in `blog/src/pages/index.astro`.

## Navigation Map

### Global Navigation Structure
- **Root/Blog** (http://localhost:3013) - Main landing page with blog
- **WWW** (http://localhost:3010) - Features, pricing, tools
- **Docs** (http://localhost:3011) - Documentation

### Header Links (Unified)
- Home → Blog homepage
- Features → WWW features page
- Pricing → WWW pricing page
- Blog → Links to main blog
- Contact → Contact page
- Sign In / Sign Up → Auth pages

## Responsive Design

All components are fully responsive:
- **Mobile**: Single column, full width
- **Tablet** (768px+): Multi-column layout
- **Desktop** (1024px+): Full feature layout

### Breakpoints (Tailwind)
- `sm`: 640px - Mobile optimizations
- `md`: 768px - Tablet layout
- `lg`: 1024px - Desktop layout
- `xl`: 1280px - Wide layout

## Performance Optimization

1. **Image Optimization**
   - Use next/image in www components
   - Use Astro's image optimization in blog

2. **Code Splitting**
   - Turbo handles multi-project builds
   - Each project has its own optimization

3. **Deployment**
   - Each project can be deployed independently
   - Shared design tokens are included in each build

## Troubleshooting

### Styling Issues
1. Check that Tailwind classes are properly imported
2. Verify color tokens in `packages/design-system/tokens/colors.ts`
3. Check for conflicting CSS in global.css files

### Navigation Issues
1. Verify locale in URL matches routing config
2. Check link href values in header/navigation components
3. Ensure all external links are using full URLs

### Build Failures
1. Run `npm run clean:cache` to clear build caches
2. Delete `node_modules` and reinstall if dependency conflicts occur
3. Check that all imports use correct paths

## Future Enhancements

- [ ] Migrate www to Astro for complete framework unification
- [ ] Create component library (button, card, modal, etc.)
- [ ] Add dark mode support across all projects
- [ ] Implement design tokens generator (Figma integration)
- [ ] Add animation system
- [ ] Create Storybook for component documentation

## Team Guidelines

### When Making Design Changes
1. Update `packages/design-system` tokens first
2. Test changes across all three projects
3. Document significant changes in this README
4. Ensure mobile responsiveness

### Code Standards
- Use Tailwind for styling (no inline CSS)
- Follow BEM naming for custom classes
- Keep components reusable and composable
- Add comments for complex component logic

## Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Astro Docs](https://docs.astro.build)
- [Next.js Docs](https://nextjs.org/docs)
- [Starlight Docs](https://starlight.astro.build)

## License

All projects are part of HR platform. See individual project LICENSE files for details.
