---
name: Component Architecture
description: Rules for creating and modifying components — when to use React vs Astro, file conventions, and established patterns
---

# Component Architecture

This skill defines when and how to create components in this portfolio.

## Component Types

| Extension | Framework | Use When |
|-----------|-----------|----------|
| `.astro`  | Astro     | Static content, no client-side interactivity, server-rendered |
| `.tsx`    | React     | Needs state, event handlers, animations, or `client:*` hydration |

### Decision Tree

```
Does the component need client-side interactivity?
├── No → Use .astro
└── Yes → Use .tsx (React)
    ├── Needs animation? → Use framer-motion
    └── Needs state? → Use useState/useEffect
```

## Current Components

| Component | Type | Purpose | Hydration |
|-----------|------|---------|-----------|
| `Navbar.tsx` | React | Nav links, mobile menu, theme toggle | `client:load` |
| `FadeIn.tsx` | React | Scroll-triggered fade animation wrapper | `client:visible` |
| `ProjectCard.tsx` | React | Project card with hover achievements overlay | `client:visible` |
| `TimelineItem.tsx` | React | Experience timeline entry with animation | `client:visible` |
| `ContactForm.tsx` | React | Form with fetch submission and state management | `client:load` |
| `Footer.astro` | Astro | Static footer with social links and copyright | None (SSR) |
| `SectionHeading.astro` | Astro | Reusable section title + subtitle | None (SSR) |
| `TechBadge.astro` | Astro | Single tech badge display | None (SSR) |

## Hydration Directives

| Directive | When to Use |
|-----------|-------------|
| `client:load` | Must be interactive immediately (navbar, forms) |
| `client:visible` | Can wait until scrolled into view (cards, animations) |
| `client:idle` | Low-priority interactivity (rarely used) |

**Always prefer `client:visible`** unless the component must work above the fold.

## File Conventions

### React Components (`.tsx`)
- Use `className` (not `class`)
- Export as `default` function
- Props interface defined inline or with `type`
- Import framer-motion for animations: `motion`, `AnimatePresence`, `useInView`
- Tailwind classes use the same design tokens as Astro components

### Astro Components (`.astro`)
- Use `class` (not `className`)
- Props via `interface Props` + `Astro.props`
- Cannot use React hooks or state
- Can import and render React components with `client:*`

## Layout

The single layout is `BaseLayout.astro`:
- Accepts `title` and `description` props
- Includes: Navbar (client:load), `<main>` slot, Footer (SSR)
- Handles: SEO meta tags, Open Graph, Twitter cards, canonical URL, dark mode FOUC prevention
- Default title: `"Awala, Kaushik Reddy — Front End Software Engineer"`

## Creating a New Component

1. Decide: interactive → `.tsx`, static → `.astro`
2. Place in `src/components/`
3. Use PascalCase naming: `MyComponent.tsx`
4. Use design tokens from `global.css` (never raw hex values)
5. If React: export default, choose appropriate hydration directive
6. If Astro: define Props interface, use `Astro.props`
