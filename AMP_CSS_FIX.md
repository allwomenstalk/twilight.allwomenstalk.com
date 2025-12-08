# AMP CSS Size Fix

## Problem
AMP pages were exceeding the 75KB CSS limit (87KB) because they were including:
- `critical.css` with `@tailwind base` and `@tailwind components`
- `amp.css` with `@tailwind utilities`

This generated too much CSS for AMP's strict requirements.

## Solution
Created a minimal, hand-crafted CSS file specifically for AMP pages with only essential styles.

### Changes Made

1. **src/styles/amp.css** - Replaced Tailwind utilities with minimal custom CSS (~3KB)
   - Basic resets and typography
   - Only the utility classes actually used in AMP templates
   - Responsive breakpoints for sm/md/lg
   - Prose styles for article content
   - Hero/post title styles

2. **src/_includes/layout/amp.njk** - Removed critical.css include
   - Now only includes `amp.css`
   - Cleaner, faster AMP pages

### Build Process
The existing build script already handles AMP CSS correctly:
```bash
npm run build:amp-css
```

This uses `tailwind.amp.config.js` which scans only AMP-specific templates.

### Testing
1. Build the AMP CSS: `npm run build:amp-css`
2. Build the site: `npm run build`
3. Check an AMP page and validate with AMP validator
4. The CSS should now be well under 75KB

### Maintenance
If you need to add more styles to AMP pages:
- Add them directly to `src/styles/amp.css`
- Keep it minimal - only add what's actually used
- Test the file size after building

### File Size Estimate
The new amp.css should be around 3-5KB minified, well under the 75KB limit.
