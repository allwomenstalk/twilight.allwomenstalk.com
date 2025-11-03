# Development Mode Fix

## Issue Identified
The development server was trying to load `/critical.css` which doesn't exist as a separate file in development mode, causing a 404 error.

## Solution Implemented

### 1. Updated Layout Strategy
**Before**: Separate CSS file links in development
**After**: Inline CSS compilation in both development and production

### 2. Development Mode CSS Loading
```njk
{% if metadata.NODE_ENV == "production" %}
    {# Production: Critical CSS inline for immediate rendering #}
    {% set criticalCss %}
    {% include 'partials/css/critical.css' %}
    {% include 'partials/css/components.css' %}
    {% endset %}
    <style>{{ criticalCss | safe }}</style>
{% else %}
    {# Development: Use combined CSS for simplicity #}
    {% set devCss %}
    {% include 'partials/css/base.css' %}
    {% include 'partials/css/components.css' %}
    {% include 'partials/css/site.css' %}
    {% endset %}
    <style>{{ devCss | safe }}</style>
{% endif %}
```

### 3. Enhanced Components CSS
- Added back essential styles to `components.css` for development compatibility
- Included font imports in `site.css` for development mode
- Maintained production optimizations

### 4. File Structure
**Development Mode**: All CSS inlined from compiled partials
**Production Mode**: Critical CSS inline + deferred CSS async

## Benefits
- ✅ No more 404 errors in development
- ✅ Maintains production optimizations
- ✅ Simpler development workflow
- ✅ All styles available in both modes

## Current File Sizes
- **base.css**: 10.1KB (Tailwind base)
- **components.css**: 1.3KB (shared components)
- **critical.css**: 30.9KB (above-the-fold)
- **deferred.css**: 21.0KB (below-the-fold)
- **site.css**: 57.0KB (utilities)
- **amp.css**: 14.2KB (AMP optimized)

## Development vs Production
**Development**: 68.4KB total CSS (base + components + site) - all inline
**Production**: 31KB critical inline + 78KB deferred async

The fix maintains all performance optimizations while ensuring development mode works seamlessly.