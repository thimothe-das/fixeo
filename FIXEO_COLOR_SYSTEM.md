# Fixeo Color System

A comprehensive, modern color palette designed specifically for the Fixeo platform using OKLCH color space for optimal consistency and accessibility.

## Overview

The Fixeo color system includes:
- **Main Blue**: 9 shades for primary brand elements
- **Accent Green**: 9 shades for secondary accents (distinct from success states)
- **Gray System**: 9 shades for neutral elements and text

All colors are defined using OKLCH color space for better perceptual uniformity and future-proof color management.

## Color Palette

### Main Blue (Primary Brand)
```css
--color-fixeo-main-50:  oklch(0.97 0.05 235)  /* Very light blue */
--color-fixeo-main-100: oklch(0.94 0.08 235)  /* Light blue */
--color-fixeo-main-200: oklch(0.86 0.12 235)  /* Lighter blue */
--color-fixeo-main-300: oklch(0.76 0.16 235)  /* Light blue */
--color-fixeo-main-400: oklch(0.64 0.20 235)  /* Medium light blue */
--color-fixeo-main-500: oklch(0.55 0.24 235)  /* Primary blue */
--color-fixeo-main-600: oklch(0.45 0.26 235)  /* Main brand blue */
--color-fixeo-main-700: oklch(0.37 0.24 235)  /* Dark blue */
--color-fixeo-main-800: oklch(0.28 0.20 235)  /* Darker blue */
--color-fixeo-main-900: oklch(0.20 0.16 235)  /* Very dark blue */
```

### Accent Green (Secondary)
```css
--color-fixeo-green-50:  oklch(0.96 0.05 155)  /* Very light green */
--color-fixeo-green-100: oklch(0.92 0.08 155)  /* Light green */
--color-fixeo-green-200: oklch(0.84 0.12 155)  /* Lighter green */
--color-fixeo-green-300: oklch(0.74 0.16 155)  /* Light green */
--color-fixeo-green-400: oklch(0.62 0.20 155)  /* Medium light green */
--color-fixeo-green-500: oklch(0.52 0.24 155)  /* Accent green */
--color-fixeo-green-600: oklch(0.42 0.26 155)  /* Medium green */
--color-fixeo-green-700: oklch(0.34 0.24 155)  /* Dark green */
--color-fixeo-green-800: oklch(0.26 0.20 155)  /* Darker green */
--color-fixeo-green-900: oklch(0.18 0.16 155)  /* Very dark green */
```

### Gray System (Neutral)
```css
--color-fixeo-gray-50:  oklch(0.98 0.005 270)  /* Very light gray */
--color-fixeo-gray-100: oklch(0.95 0.008 270)  /* Light gray */
--color-fixeo-gray-200: oklch(0.89 0.012 270)  /* Lighter gray */
--color-fixeo-gray-300: oklch(0.82 0.016 270)  /* Light gray */
--color-fixeo-gray-400: oklch(0.68 0.020 270)  /* Medium light gray */
--color-fixeo-gray-500: oklch(0.54 0.024 270)  /* Medium gray */
--color-fixeo-gray-600: oklch(0.42 0.024 270)  /* Medium dark gray */
--color-fixeo-gray-700: oklch(0.32 0.020 270)  /* Dark gray */
--color-fixeo-gray-800: oklch(0.24 0.016 270)  /* Darker gray */
--color-fixeo-gray-900: oklch(0.16 0.012 270)  /* Very dark gray */
```

## Usage

### Tailwind CSS Classes

Use the standard Tailwind naming convention with `fixeo-` prefix:

```html
<!-- Backgrounds -->
<div class="bg-fixeo-blue-600">Primary button</div>
<div class="bg-fixeo-green-500">Accent element</div>
<div class="bg-fixeo-gray-100">Light background</div>

<!-- Text -->
<p class="text-fixeo-gray-900">Primary text</p>
<p class="text-fixeo-gray-600">Secondary text</p>
<p class="text-fixeo-blue-600">Link text</p>

<!-- Borders -->
<div class="border-fixeo-gray-200">Card with border</div>
<input class="border-fixeo-blue-300 focus:border-fixeo-blue-500" />

<!-- Combinations -->
<button class="bg-fixeo-blue-600 hover:bg-fixeo-blue-700 text-white">
  Primary Button
</button>
```

### TypeScript Helper Functions

Import the color utilities from `lib/colors.ts`:

```typescript
import { 
  getFixeoColorClass, 
  getFixeoColorVar, 
  UI_COMBINATIONS,
  COLOR_USAGE 
} from '@/lib/colors';

// Generate class names
const buttonClass = getFixeoColorClass('bg', 'blue', '600');
// Returns: 'bg-fixeo-blue-600'

// Get CSS variables
const blueColor = getFixeoColorVar('blue', '500');
// Returns: 'var(--color-fixeo-main-500)'

// Use predefined combinations
const primaryButton = UI_COMBINATIONS.button.primary;
// Returns: 'bg-fixeo-blue-600 hover:bg-fixeo-blue-700 text-white border-fixeo-blue-600'
```

### CSS Variables

Access colors directly in CSS:

```css
.custom-element {
  background-color: var(--color-fixeo-main-600);
  border-color: var(--color-fixeo-gray-200);
  color: var(--color-fixeo-gray-900);
}

.accent-gradient {
  background: linear-gradient(
    to right, 
    var(--color-fixeo-main-500), 
    var(--color-fixeo-green-500)
  );
}
```

## Design Guidelines

### Color Usage Hierarchy

1. **Primary Blue (`fixeo-blue-600`)**: Main CTAs, primary navigation, key brand elements
2. **Accent Green (`fixeo-green-500`)**: Secondary actions, highlights, accent elements
3. **Gray Shades**: Text, borders, backgrounds, neutral elements

### Accessibility

- All color combinations meet WCAG 2.1 AA standards
- Text on `fixeo-blue-600` and darker shades: use white text
- Text on `fixeo-blue-500` and lighter shades: use `fixeo-gray-900`
- Always test color combinations for sufficient contrast

### Semantic Color Mapping

| UI Element | Recommended Color | Class Example |
|------------|-------------------|---------------|
| Primary buttons | Blue 600 | `bg-fixeo-blue-600 hover:bg-fixeo-blue-700` |
| Secondary buttons | Gray 100 | `bg-fixeo-gray-100 hover:bg-fixeo-gray-200` |
| Accent buttons | Green 500 | `bg-fixeo-green-500 hover:bg-fixeo-green-600` |
| Card backgrounds | White with gray border | `bg-white border-fixeo-gray-200` |
| Text primary | Gray 900 | `text-fixeo-gray-900` |
| Text secondary | Gray 600 | `text-fixeo-gray-600` |
| Text muted | Gray 400 | `text-fixeo-gray-400` |
| Input borders | Gray 300 | `border-fixeo-gray-300` |
| Focus states | Blue 500 | `focus:border-fixeo-blue-500` |

## Migration Guide

### From Existing Colors

Replace existing color usage:

```diff
- className="bg-blue-600 hover:bg-blue-700"
+ className="bg-fixeo-blue-600 hover:bg-fixeo-blue-700"

- className="text-gray-900"
+ className="text-fixeo-gray-900"

- className="border-gray-200"
+ className="border-fixeo-gray-200"
```

### Status Colors (Keep Existing)

Keep existing status colors for semantic states:
- Success: `bg-green-100 text-green-800` (existing)
- Warning: `bg-yellow-100 text-yellow-800` (existing)
- Error: `bg-red-100 text-red-800` (existing)
- Info: `bg-fixeo-blue-100 text-fixeo-blue-800` (new)

### Service Type Colors

Update service type indicators:

```typescript
import { SERVICE_COLORS } from '@/lib/colors';

const serviceColors = {
  plomberie: SERVICE_COLORS.plomberie,    // 'bg-fixeo-blue-100 text-fixeo-blue-700'
  electricite: SERVICE_COLORS.electricite, // 'bg-yellow-100 text-yellow-700'
  menuiserie: SERVICE_COLORS.menuiserie,   // 'bg-orange-100 text-orange-700'
  peinture: SERVICE_COLORS.peinture,       // 'bg-purple-100 text-purple-700'
  renovation: SERVICE_COLORS.renovation,   // 'bg-fixeo-green-100 text-fixeo-green-700'
  depannage: SERVICE_COLORS.depannage,     // 'bg-red-100 text-red-700'
};
```

## Dark Mode

The color system automatically adapts to dark mode:

- Background: `fixeo-gray-900`
- Cards: `fixeo-gray-800`
- Text: `fixeo-gray-50` / `fixeo-gray-200`
- Primary: `fixeo-blue-500` (lighter in dark mode)
- Accent: `fixeo-green-400` (lighter in dark mode)

## Best Practices

1. **Consistency**: Use the predefined `UI_COMBINATIONS` for common patterns
2. **Hierarchy**: Use color intensity to indicate importance
3. **Accessibility**: Always check contrast ratios
4. **Semantic meaning**: Don't use accent green for success states
5. **Performance**: Prefer Tailwind classes over CSS variables when possible

## Examples

### Button Variants
```html
<!-- Primary -->
<button class="bg-fixeo-blue-600 hover:bg-fixeo-blue-700 text-white px-4 py-2 rounded">
  Primary Action
</button>

<!-- Secondary -->
<button class="bg-fixeo-gray-100 hover:bg-fixeo-gray-200 text-fixeo-gray-900 px-4 py-2 rounded">
  Secondary Action
</button>

<!-- Accent -->
<button class="bg-fixeo-green-500 hover:bg-fixeo-green-600 text-white px-4 py-2 rounded">
  Accent Action
</button>

<!-- Outline -->
<button class="bg-transparent hover:bg-fixeo-blue-50 text-fixeo-blue-600 border border-fixeo-blue-300 px-4 py-2 rounded">
  Outline Button
</button>
```

### Card Components
```html
<!-- Default card -->
<div class="bg-white border-fixeo-gray-200 shadow-sm rounded-lg p-6">
  <h3 class="text-fixeo-gray-900 font-semibold mb-2">Card Title</h3>
  <p class="text-fixeo-gray-600">Card content...</p>
</div>

<!-- Highlighted card -->
<div class="bg-fixeo-blue-50 border-fixeo-blue-300 shadow-sm rounded-lg p-6">
  <h3 class="text-fixeo-blue-900 font-semibold mb-2">Featured Card</h3>
  <p class="text-fixeo-blue-700">Important content...</p>
</div>
```

### Form Inputs
```html
<input 
  type="text" 
  class="w-full px-3 py-2 border-fixeo-gray-300 rounded-md focus:border-fixeo-blue-500 focus:ring-fixeo-blue-500/20 text-fixeo-gray-900"
  placeholder="Enter text..."
/>
```

---

This color system provides a solid foundation for building consistent, accessible, and visually appealing interfaces across the Fixeo platform while maintaining flexibility for future design evolution.
