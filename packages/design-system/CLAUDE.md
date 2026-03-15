# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this directory.

## Package

Shared design tokens and components for the HR platform (`@hr/design-system`).

## Exports

```
@hr/design-system/tailwind          # Tailwind config with design tokens
@hr/design-system/colors            # Color palette constants
@hr/design-system/typography        # Font families, sizes, weights
@hr/design-system/styles/globals.css # Global CSS with custom properties
@hr/design-system/tokens/css-vars   # Light/dark CSS variable definitions
@hr/design-system/tokens/tokens.json # Master token file (JSON)
@hr/design-system/tokens/dark       # Dark theme overrides
@hr/design-system/tokens/transform  # Token transformation utilities
```

## Design Tokens

7 categories in `tokens/tokens.json`:
- **Colors**: Primary (#1B4DDB), Accent (#0EA5E9), Navy, semantic (success/warning/error), surface, grays
- **Typography**: Inter (body) + Mulish (headings), sizes xs-5xl
- **Spacing**: 0-64 units in rem
- **Shadows**: sm, md, lg, xl
- **Border radius**: none through full
- **Z-index**: organized strata (base 0-50, dropdown 1000, modal 1050, toast 1080)
- **Component tokens**: Pre-configured button, input, card, modal properties

## Theme Support

- Light mode (default)
- Dark mode via `prefers-color-scheme` media query + `.dark` class
- Dark overrides defined in `tokens/dark.ts`
- CSS custom properties set in `styles/globals.css`

## Dependencies

- Tailwind CSS v4 with typography and forms plugins

## Usage

All apps (web, blog, docs) consume this package. When modifying tokens, check impact across all consumers.
