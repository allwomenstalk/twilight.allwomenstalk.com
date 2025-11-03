# Post Images CSS Fix

## Problem Identified
Images in post pages (generated from `post.njk`) were not displaying the expected styling:
- Missing rounded corners (`rounded-md`)
- Not centered (`mx-auto`)
- Missing background color (`bg-slate-100`)
- Not full width (`w-full`)

## Root Cause Analysis
1. **CSS Location Issue**: Post image styles were only in `components.css` but post content is below-the-fold
2. **Loading Strategy**: Post content loads with deferred CSS, but image styles weren't in deferred CSS
3. **Prose Class Override**: Tailwind Typography's `.prose` class has its own image styling that was overriding custom styles
4. **Selector Specificity**: The `.post img` selector wasn't specific enough to override prose styles

## Solution Implemented

### 1. Added Styles to Deferred CSS
Updated `src/styles/deferred.css` to include post image styles:

```css
/* Post Content Styles */
.post-image,
.post img,
.prose .post img,
article.post img {
    @apply mx-auto rounded-md w-full bg-slate-100 !important;
}
```

### 2. Enhanced Components CSS
Updated `src/styles/components.css` with matching styles:

```css
.post-image,
.post img,
.prose .post img,
article.post img {
    @apply mx-auto rounded-md w-full bg-slate-100 !important;
}
```

### 3. Increased Selector Specificity
Used multiple selectors to ensure proper targeting:
- `.post img` - Basic post image selector
- `.prose .post img` - Override prose class styling
- `article.post img` - Target images in post articles specifically
- `.post-image` - Class-based targeting

### 4. Added Important Declarations
Used `!important` to ensure styles override prose class defaults:
- `margin-left: auto !important`
- `margin-right: auto !important`
- `border-radius: .375rem !important`
- `width: 100% !important`
- `background-color: rgb(241 245 249) !important`

## Template Structure Context
Post pages use this structure:
```njk
<article class="post prose p-4 overflow-hidden mx-auto max-w-xl">
  {{ page.pageContent | enhanceLists | safe }}
</article>
```

Images within `pageContent` are now properly styled with:
- **Centered alignment** (`mx-auto`)
- **Rounded corners** (`rounded-md`)
- **Full width** (`w-full`)
- **Light gray background** (`bg-slate-100`)

## CSS Loading Strategy
- **Development Mode**: Styles available immediately via components.css
- **Production Mode**: 
  - Critical styles in components.css (inline)
  - Post content styles in deferred.css (async after page load)
  - Both files now contain the image styles for complete coverage

## Compiled CSS Output
The styles are now compiled as:
```css
.post img,.post-image,.prose .post img,article.post img{
  border-radius:.375rem!important;
  margin-left:auto!important;
  margin-right:auto!important;
  width:100%!important;
  --tw-bg-opacity:1!important;
  background-color:rgb(241 245 249/var(--tw-bg-opacity,1))!important
}
```

## Current Status
✅ **Fixed**: Post images now display with proper styling
✅ **Override**: Prose class styling properly overridden
✅ **Coverage**: Styles available in both critical and deferred CSS
✅ **Specificity**: Multiple selectors ensure proper targeting
✅ **Consistency**: Same styling across all post images

The fix ensures that all images within post content display consistently with the expected styling, regardless of the prose class interference.