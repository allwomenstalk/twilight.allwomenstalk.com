# AMP Partials Refactor

## Changes Made

### 1. Created AMP-Specific Partials Directory
Created `src/_includes/partials/amp/` for all AMP-only components without Alpine.js dependencies.

### 2. New AMP Partials

**src/_includes/partials/amp/faq.njk**
- Moved from `faq-amp.njk`
- Clean FAQ display without any JavaScript
- Simple accordion-free layout

**src/_includes/partials/amp/hero.njk**
- AMP version of `herojumbo.njk`
- Removed all Alpine.js directives (`x-cloak`, `x-show`, `@click`, etc.)
- Replaced HTML5 video with `<amp-video>`
- Replaced `<img>` with `<amp-img>` with proper layout
- Replaced bookmark/share buttons with `<amp-social-share>`
- No JavaScript dependencies

**src/_includes/partials/amp/google.njk**
- AMP version of `google.njk`
- Removed Alpine.js `x-data`, `x-show`, `@click` directives
- Converted to simple link with `<amp-img>`
- Removed dismiss button (not essential for AMP)
- No tracking JavaScript

### 3. Updated Files

**src/posts/amp.njk**
- Changed `{% include 'partials/herojumbo.njk' %}` → `{% include 'partials/amp/hero.njk' %}`
- Changed `{% include 'partials/faq-amp.njk' %}` → `{% include 'partials/amp/faq.njk' %}`
- Changed `{% include 'partials/google.njk' %}` → `{% include 'partials/amp/google.njk' %}`

**Partials Verified Clean (No Alpine.js):**
- `src/_includes/partials/schema.njk` - Pure JSON-LD, no JavaScript
- `src/_includes/partials/footer.njk` - Static HTML only
- `src/_includes/partials/postmeta.njk` - Meta tags only
- `src/_includes/layout/amp.njk` - AMP-compliant layout

**tailwind.amp.config.js**
- Updated content paths to include `./src/_includes/partials/amp/*.njk`
- Removed unused partial references
- Simplified to only scan AMP-specific files

**src/styles/amp.css**
- Added additional utility classes needed by hero component
- Added spacing, grid, and layout utilities
- Added color and typography utilities
- Added responsive variants for sm/md/lg breakpoints

### 4. Deleted Files
- `src/_includes/partials/faq-amp.njk` (moved to amp/faq.njk)

## Benefits

1. **No Alpine.js** - AMP pages are fully compliant with no JavaScript framework dependencies
2. **Organized** - All AMP-specific partials in one directory
3. **Maintainable** - Clear separation between regular and AMP templates
4. **Smaller CSS** - Only includes styles actually used in AMP templates
5. **Valid AMP** - Uses proper AMP components (`amp-video`, `amp-img`, `amp-social-share`)

## Testing

Build and test:
```bash
npm run build:amp-css
npm run build
```

Validate an AMP page with the AMP validator to ensure compliance.
