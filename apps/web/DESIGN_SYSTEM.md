# Move By Practice - Sui Design System 🎨

## Overview

Modern, minimalistic design system built on Sui's official brand guidelines featuring **Cabinet Grotesk** typography and **Sui Ocean** color palette.

---

## 🎨 Color Palette

### Primary Colors (Sui Brand)
```css
--sui-ocean: #6FBCF0        /* Primary brand color */
--sui-ocean-dark: #4DA2D9   /* Hover states */
--sui-sea: #4CA3D9           /* Accent */
--sui-navy: #0A2540          /* Dark text */
--sui-midnight: #0D1B2A      /* Darkest */
```

### Background Colors
```css
--sui-sky: #E5F3FF           /* Light background */
--sui-mist: #F7FBFF          /* Lightest background */
--sui-white: #FFFFFF         /* Pure white */
```

### Neutral Grays
```css
--sui-gray-50: #F8FAFC
--sui-gray-100: #F1F5F9
--sui-gray-200: #E2E8F0
--sui-gray-300: #CBD5E1
--sui-gray-400: #94A3B8
--sui-gray-500: #64748B
--sui-gray-600: #475569
--sui-gray-700: #334155
--sui-gray-800: #1E293B
--sui-gray-900: #0F172A
```

### Usage in Tailwind
```tsx
className="bg-sui-ocean text-white"
className="text-sui-navy border-sui-gray-200"
className="hover:bg-sui-ocean-dark"
```

---

## ✍️ Typography

### Font Family
**Cabinet Grotesk** - Official Sui typeface

```css
font-family: 'Cabinet Grotesk', system-ui, -apple-system, sans-serif;
```

### Font Weights Available
- **100** - Thin
- **200** - Extralight
- **300** - Light
- **400** - Regular (default)
- **500** - Medium
- **700** - Bold
- **800** - Extrabold
- **900** - Black

### Typography Scale
```css
/* Headings */
.text-6xl { font-size: 3.75rem; }   /* Hero */
.text-5xl { font-size: 3rem; }      /* Page Titles */
.text-4xl { font-size: 2.25rem; }   /* Section Headings */
.text-3xl { font-size: 1.875rem; }  /* Subheadings */
.text-2xl { font-size: 1.5rem; }    /* Large text */
.text-xl { font-size: 1.25rem; }    /* Body large */

/* Body */
.text-lg { font-size: 1.125rem; }   /* Body text */
.text-base { font-size: 1rem; }     /* Default */
.text-sm { font-size: 0.875rem; }   /* Small text */
.text-xs { font-size: 0.75rem; }    /* Captions */
```

### Example Usage
```tsx
<h1 className="text-6xl font-black text-sui-navy">
  Learn Move by Building
</h1>

<p className="text-xl text-sui-gray-600 font-light">
  Master Sui Move through interactive lessons
</p>
```

---

## 🎯 Components

### Buttons

#### Primary Button
```tsx
<button className="px-8 py-4 bg-sui-ocean text-white rounded-full hover:bg-sui-ocean-dark transition-all font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5">
  Start Learning
</button>
```

#### Secondary Button
```tsx
<button className="px-8 py-4 bg-white text-sui-navy border-2 border-sui-gray-300 rounded-full hover:border-sui-ocean transition-all font-semibold">
  Learn More
</button>
```

#### Icon Button
```tsx
<button className="w-14 h-14 bg-sui-ocean/10 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform">
  ⚡
</button>
```

### Cards

#### Feature Card
```tsx
<div className="group p-8 bg-sui-mist rounded-3xl border-2 border-transparent hover:border-sui-ocean transition-all hover:shadow-xl">
  <div className="w-14 h-14 bg-sui-ocean/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
    <span className="text-3xl">⚡</span>
  </div>
  <h3 className="text-2xl font-bold text-sui-navy mb-3">
    Feature Title
  </h3>
  <p className="text-sui-gray-600 leading-relaxed">
    Feature description text goes here
  </p>
</div>
```

#### XP Progress Card
```tsx
<div className="flex items-center gap-4 bg-white border-2 border-sui-gray-200 rounded-2xl p-5 shadow-sm">
  <!-- Content -->
</div>
```

### Badges

#### Status Badge
```tsx
<span className="px-4 py-1.5 bg-sui-sky text-sui-ocean text-sm rounded-full font-medium">
  Beginner
</span>
```

#### XP Badge
```tsx
<span className="px-4 py-1.5 bg-sui-ocean/10 text-sui-ocean text-sm rounded-full font-medium">
  +100 XP
</span>
```

#### Animated Badge
```tsx
<div className="inline-flex items-center gap-2 px-4 py-2 bg-sui-sky/50 rounded-full text-sm text-sui-navy font-medium">
  <span className="w-2 h-2 bg-sui-ocean rounded-full animate-pulse"></span>
  Powered by Sui
</div>
```

---

## 📐 Layout

### Spacing Scale
```css
gap-2  /* 0.5rem - 8px */
gap-4  /* 1rem - 16px */
gap-6  /* 1.5rem - 24px */
gap-8  /* 2rem - 32px */
gap-12 /* 3rem - 48px */
gap-16 /* 4rem - 64px */
```

### Border Radius
```css
rounded-xl   /* 0.75rem - 12px - Buttons */
rounded-2xl  /* 1rem - 16px - Cards */
rounded-3xl  /* 1.5rem - 24px - Large cards */
rounded-full /* Badges, avatars */
```

### Shadows
```css
shadow-sm    /* Subtle elevation */
shadow-md    /* Default cards */
shadow-lg    /* Buttons, hover states */
shadow-xl    /* Feature cards, modals */
shadow-2xl   /* Hero elements */
```

### Container Sizes
```css
max-w-6xl   /* Main content - 72rem */
max-w-4xl   /* Narrow content - 56rem */
max-w-2xl   /* Text blocks - 42rem */
```

---

## 🎭 Animation

### Transitions
```css
transition-all      /* All properties */
transition-colors   /* Color changes */
transition-transform /* Scale, translate */
```

### Duration
```css
duration-150  /* Fast - 150ms */
duration-300  /* Default - 300ms */
duration-500  /* Slow - 500ms */
```

### Hover Effects

#### Button Hover
```tsx
hover:bg-sui-ocean-dark
hover:shadow-xl
hover:-translate-y-0.5
```

#### Card Hover
```tsx
hover:border-sui-ocean
hover:shadow-xl
```

#### Icon Hover
```tsx
hover:scale-110
transition-transform
```

### Framer Motion Examples

#### Fade In
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

#### Scale In
```tsx
<motion.div
  initial={{ scale: 0.8 }}
  animate={{ scale: 1 }}
  whileHover={{ scale: 1.05 }}
>
  Content
</motion.div>
```

---

## 🖼️ Assets

### Logos
```tsx
/* Sui Symbol (Icon) */
<Image src="/sui-symbol.svg" alt="Sui" width={32} height={32} />

/* Sui Logo (Full) */
<Image src="/sui-logo.svg" alt="Sui Logo" width={120} height={40} />

/* For dark backgrounds */
<Image src="/sui-logo.svg" className="brightness-0 invert" />
```

### Icons
Use emojis for simplicity and universality:
```tsx
⚡ - Fast/Performance
🎮 - Gamification
🚀 - Deployment
💻 - Code/Development
🎯 - Goals/Targets
🏆 - Achievements
💡 - Ideas/Hints
🔥 - Streak/Hot
```

---

## 📱 Responsive Design

### Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Mobile-First Examples
```tsx
/* Stack on mobile, side-by-side on desktop */
<div className="flex flex-col lg:flex-row">

/* Hide on mobile, show on desktop */
<div className="hidden lg:block">

/* Full width on mobile, fixed on desktop */
<div className="w-full sm:w-auto">
```

---

## 🎨 Page Templates

### Homepage Hero
```tsx
<section className="pt-32 pb-20 px-6">
  <div className="max-w-6xl mx-auto text-center">
    <h1 className="text-6xl md:text-7xl font-black text-sui-navy mb-6">
      Learn Move by<br />
      <span className="text-sui-ocean">Building Real Projects</span>
    </h1>
    <p className="text-xl md:text-2xl text-sui-gray-600 mb-12 max-w-3xl mx-auto font-light">
      Master Sui Move through interactive, gamified lessons
    </p>
  </div>
</section>
```

### Lesson Page Layout
```tsx
<div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-sui-mist to-white">
  {/* Left Panel - Tutorial */}
  <div className="w-full lg:w-1/2 p-8 overflow-y-auto bg-white border-r border-sui-gray-200">
    <!-- Tutorial content -->
  </div>

  {/* Right Panel - Code Editor */}
  <div className="w-full lg:w-1/2 p-8 flex flex-col bg-sui-gray-50">
    <!-- Editor and output -->
  </div>
</div>
```

---

## ✅ Best Practices

### DO ✅
- Use Cabinet Grotesk for all text
- Stick to Sui color palette
- Use rounded corners (rounded-2xl, rounded-3xl)
- Add hover effects for interactivity
- Use white space generously
- Follow mobile-first approach
- Use semantic HTML

### DON'T ❌
- Mix custom colors with Sui palette
- Use default Tailwind blue/gray
- Use sharp corners (rounded-none)
- Overcrowd layouts
- Ignore accessibility
- Use inconsistent spacing
- Forget hover states

---

## 🚀 Quick Start

### Install Dependencies
```bash
npm install framer-motion @mysten/dapp-kit
```

### Import Fonts
```tsx
// app/globals.css
@import "./fonts.css";

body {
  font-family: 'Cabinet Grotesk', system-ui, sans-serif;
}
```

### Use Colors
```tsx
// Tailwind classes
className="bg-sui-ocean text-white hover:bg-sui-ocean-dark"

// CSS variables
style={{ backgroundColor: 'var(--sui-ocean)' }}
```

---

## 📚 Resources

- **Sui Brand Guidelines**: Official Sui design system
- **Cabinet Grotesk**: Sui's official typeface
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library

---

## 🎯 Examples in Codebase

- **Homepage**: `app/page.tsx` - Full hero + features + footer
- **Lesson Page**: `app/lessons/[id]/page.tsx` - Split-screen layout
- **XP Progress**: `app/components/gamification/XPProgress.tsx`
- **Buttons**: `app/components/editor/MoveEditor.tsx`
- **Cards**: Homepage feature cards

---

**Design System v1.0 - Built with ❤️ for Sui developers**
