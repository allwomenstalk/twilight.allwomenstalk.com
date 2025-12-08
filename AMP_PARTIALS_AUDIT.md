# AMP Partials Audit - Alpine.js Removal

## Summary
All partials used in `src/posts/amp.njk` have been audited and cleaned of Alpine.js dependencies.

## AMP-Specific Partials Created (No Alpine.js)

### ✅ src/_includes/partials/amp/hero.njk
**Replaced:** `herojumbo.njk`
**Changes:**
- Removed `x-cloak`, `x-show`, `@click` directives
- Replaced `<video>` → `<amp-video>`
- Replaced `<img>` → `<amp-img>`
- Replaced bookmark/share buttons → `<amp-social-share>`
- Removed source attribution button (Alpine.js dependent)

### ✅ src/_includes/partials/amp/faq.njk
**Replaced:** `faq-amp.njk`
**Changes:**
- Moved to amp directory
- Already clean (no Alpine.js)
- Simple static FAQ layout

### ✅ src/_includes/partials/amp/google.njk
**Replaced:** `google.njk`
**Changes:**
- Removed `x-data` with tracking functions
- Removed `x-show` visibility toggle
- Removed `@click` event handlers
- Converted to simple link with `<amp-img>`
- Removed dismiss button (not essential)

## Shared Partials (Already Clean)

### ✅ src/_includes/partials/schema.njk
**Status:** Clean - No changes needed
**Content:** Pure JSON-LD structured data
**Used by:** Both AMP and regular pages

### ✅ src/_includes/partials/footer.njk
**Status:** Clean - No changes needed
**Content:** Static HTML footer
**Used by:** Both AMP and regular pages

### ✅ src/_includes/partials/postmeta.njk
**Status:** Clean - No changes needed
**Content:** Meta tags only
**Used by:** Both AMP and regular pages

### ✅ src/_includes/layout/amp.njk
**Status:** Clean - No changes needed
**Content:** AMP-compliant layout structure
**Note:** Contains AMP boilerplate CSS (not Alpine.js)

## Final amp.njk Structure

```njk
---
layout: layout/amp.njk
---

{% set amp=true %}
{% include 'partials/amp/hero.njk' %}           ← AMP-specific (no Alpine)

<main id="content" class="bg-gray-50">
  {% for page in post.pages %}
    <article>...</article>
  {% endfor %}

  {% include 'partials/amp/faq.njk'%}          ← AMP-specific (no Alpine)
  {% include 'partials/amp/google.njk'%}       ← AMP-specific (no Alpine)
</main>

{% include 'partials/schema.njk' %}            ← Shared (clean)
```

## Verification Checklist

- [x] No `x-data` directives
- [x] No `x-show` directives
- [x] No `x-cloak` directives
- [x] No `@click` handlers
- [x] No `@` event listeners
- [x] All `<img>` replaced with `<amp-img>`
- [x] All `<video>` replaced with `<amp-video>`
- [x] All interactive buttons removed or replaced with AMP components
- [x] CSS classes added to amp.css for all used utilities

## Result
✅ **All AMP pages are now 100% Alpine.js free and AMP-compliant**
