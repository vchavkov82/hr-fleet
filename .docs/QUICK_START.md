# Quick Start Guide - Unified Design System

## Installation & Testing (5 minutes)

### Step 1: Install Dependencies
```bash
cd /home/vchavkov/src/jobs/hr

# Install all dependencies including the new design-system package
pnpm install
# or
npm install
```

### Step 2: Test the Unified Homepage
```bash
# Start all three development servers
npm run dev
```

You should see:
```
www: started on http://localhost:3010
blog: started on http://localhost:3013  ← NEW MAIN HOMEPAGE
docs: started on http://localhost:3011
```

### Step 3: View the New Unified Homepage
1. Open http://localhost:3013
2. You'll see:
   - **Hero Section** - Main marketing message with CTA
   - **Features Section** - 6 key product features
   - **Stats Section** - Key metrics (10k+ users, 150+ countries, etc.)
   - **Blog Articles** - Featured and recent blog posts
   - **CTA Section** - Final call-to-action
   - **Unified Header & Footer** - Consistent navigation

### Step 4: Navigate Between Sites
- **Homepage**: http://localhost:3013 (blog)
- **Features & Pricing**: http://localhost:3010/features, /pricing (www)
- **Documentation**: http://localhost:3011 (docs)

## What Changed

### New Structure
```
packages/
  └─ design-system/  ← Shared design tokens & components
    ├─ tailwind.config.ts
    ├─ tokens/colors.ts
    ├─ tokens/typography.ts
    └─ components/header.tsx, footer.tsx

blog/
  └─ src/
    └─ components/
      ├─ HeroSection.astro ← NEW
      ├─ FeaturesSection.astro ← NEW
      ├─ StatsSection.astro ← NEW
      ├─ CTASection.astro ← NEW
    └─ pages/
      └─ index.astro ← UPDATED (now full homepage)

DESIGN_SYSTEM.md - Complete documentation
IMPLEMENTATION_SUMMARY.md - What was done
QUICK_START.md - This file
```

## Making Changes

### Change Colors Globally
1. Edit `packages/design-system/tokens/colors.ts`
2. Update the color values
3. All three projects will use the new colors automatically

**Example:**
```typescript
// Change primary blue
primary: {
  DEFAULT: '#FF5733',  // Change this
  light: '#FF8A5B',
  dark: '#C41E3A',
}
```

### Add a New Homepage Section
1. Create new Astro component in `blog/src/components/YourSection.astro`
2. Import in `blog/src/pages/index.astro`
3. Add between existing sections

**Template:**
```astro
---
// YourSection.astro
---

<section class="py-20 sm:py-28 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Your content here -->
  </div>
</section>
```

### Update Header Navigation
- **Blog Header**: `blog/src/components/Header.astro`
- **WWW Header**: `www/src/components/layout/header.tsx`
- Both use the same styling and navigation pattern

## Testing the Design System

### Check Color Consistency
1. Open browser DevTools
2. Inspect element with class `bg-primary` or `text-navy`
3. Verify color values match `packages/design-system/tokens/colors.ts`

### Test Responsiveness
1. Open blog homepage
2. Resize browser to different widths:
   - Mobile: 375px
   - Tablet: 768px
   - Desktop: 1024px+
3. Verify sections stack properly

### Verify Cross-Project Consistency
1. Open http://localhost:3013 (blog)
2. Open http://localhost:3010/features (www)
3. Compare:
   - Primary button color (should be same blue)
   - Navy text color (should be same)
   - Header style (should be similar)
   - Footer layout (should be consistent)

## Common Tasks

### Hide a Homepage Section
Open `blog/src/pages/index.astro` and comment out:
```astro
{/* <HeroSection /> */}
{/* <FeaturesSection /> */}
<StatsSection />  <!-- This shows -->
```

### Change Section Heading
Edit the Astro component directly:
```astro
<!-- In HeroSection.astro -->
<h1 class="text-5xl ...">
  Your new heading here
</h1>
```

### Update Footer Links
Edit `blog/src/components/Footer.astro` column links array:
```astro
const columns = [
  {
    label: "RESOURCES",
    links: [
      { label: "Blog", href: "/blog" },  // Update these
      // ...
    ],
  }
]
```

### Add Social Links
In `Footer.astro`, update the social links section

## Build & Deploy

### Build All Projects
```bash
npm run build
```

### Build Individual Projects
```bash
npm run build:blog    # Build blog homepage
npm run build:www     # Build www features/pricing
npm run build:docs    # Build documentation
```

### Preview Production Build
```bash
npm run build
# Then serve from the dist folders
```

## Troubleshooting

### Styles not applying?
```bash
# Clear Tailwind cache
npm run clean:cache

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npm run dev
```

### Component not showing?
1. Check import path matches file location
2. Verify component is exported correctly
3. Check for TypeScript errors in console
4. Verify Astro syntax is correct

### Port already in use?
```bash
# Kill processes on the ports
pkill -f "node.*3010"
pkill -f "node.*3013"
pkill -f "node.*3011"

# Then start dev again
npm run dev
```

### Color not changing?
1. Edit `packages/design-system/tokens/colors.ts`
2. Run `npm run clean:cache`
3. Restart dev server: `npm run dev`
4. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

## What's Next?

### Recommended Actions:
1. ✅ Test the new unified homepage (open http://localhost:3013)
2. ✅ Verify colors are consistent across all three projects
3. ✅ Check responsive design on mobile/tablet/desktop
4. ✅ Update any necessary content/messaging
5. ⏭️ (Optional) Add more sections to homepage
6. ⏭️ (Optional) Create component library in design-system package
7. ⏭️ (Optional) Migrate www to Astro for complete unification

## Reference Documents

- **DESIGN_SYSTEM.md** - Complete design system documentation
- **IMPLEMENTATION_SUMMARY.md** - Full details of what was done
- **blog/CLAUDE.md** - Blog project specific notes
- **www/** - WWW project with features/pricing/tools
- **docs/** - Documentation site with Starlight

## Quick Links

- Main Homepage: http://localhost:3013
- Features Page: http://localhost:3010/features
- Pricing Page: http://localhost:3010/pricing
- Documentation: http://localhost:3011
- Design System Tokens: `packages/design-system/tokens/`
- Blog Components: `blog/src/components/`

## Questions?

Refer to:
1. DESIGN_SYSTEM.md for comprehensive guide
2. IMPLEMENTATION_SUMMARY.md for what was done
3. Individual file comments in components
4. Tailwind documentation: https://tailwindcss.com

Happy designing! 🎨
