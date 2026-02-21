---
name: Design Consistency
description: Design system rules — colors, typography, spacing, glass-card, dark mode, and component patterns
---

# Portfolio Design Consistency

This skill defines the design system for awalakaushik.dev. Follow these rules when creating or modifying any UI element.

## Design Tokens

All design tokens live in `src/styles/global.css` under `@theme`.

### Color Palette

| Token              | Hex       | Usage                                    |
|---------------------|-----------|------------------------------------------|
| `primary-50…900`    | Indigo    | Buttons, links, accents, gradients       |
| `surface-50…950`    | Slate     | Backgrounds, text, borders, cards        |
| `accent-400…600`    | Emerald   | Success states, gradient endpoints       |

- **Never** use raw hex values. Always use token classes like `text-primary-500` or `bg-surface-900`.
- Dark mode is class-based (`.dark` on `<html>`), toggle via `@custom-variant dark`.

### Typography

| Font      | Variable     | Usage              |
|-----------|--------------|--------------------|
| Inter     | `--font-sans` | All body text      |
| JetBrains Mono | `--font-mono` | Code blocks   |

- Body text: `text-surface-600 dark:text-surface-400`
- Headings: `text-surface-900 dark:text-white font-bold`
- Small labels: `text-xs font-semibold uppercase tracking-wider text-surface-400`

## Core Utility Classes

These are defined in `global.css` under `@layer utilities`:

| Class             | Description                                                  |
|--------------------|--------------------------------------------------------------|
| `.text-gradient`   | Gradient text (primary → accent)                             |
| `.glass-card`      | Frosted card: `bg-white/60 dark:bg-surface-900/60 backdrop-blur-xl border rounded-2xl` |
| `.section-padding` | Responsive section padding: `px-6 md:px-12 lg:px-24 py-20 md:py-28` |

### When to use `.glass-card`
- Stat cards, info cards, sidebar cards, experience timeline
- **Not** for full-width sections, nav, footer, or project image containers

## Component Patterns

### Section Layout
Every section follows this pattern:
```astro
<section class="section-padding bg-surface-50/50 dark:bg-surface-900/20">
  <div class="max-w-6xl mx-auto">
    <FadeIn client:visible>
      <SectionHeading title="..." subtitle="..." align="center|left" />
    </FadeIn>
    <!-- content -->
  </div>
</section>
```

### Animations
- Use `<FadeIn>` React component for scroll-triggered entry animations.
- Use `framer-motion` (`motion`, `AnimatePresence`) only inside React components (e.g., `ProjectCard`).
- Hover effects: `hover:-translate-y-0.5 transition-all duration-200` for subtle lift.
- Interactive cards: `whileHover={{ y: -6 }}` with spring physics.

### Buttons
- Primary: `px-8 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm`
- Add `hover:shadow-lg hover:shadow-primary-500/25 active:scale-[0.98]` for press feedback.
- Ghost/outline: `border border-surface-200 dark:border-surface-700 hover:border-primary-500/30`

### Responsive
- Mobile-first approach. Use `md:` and `lg:` breakpoints.
- Grid layouts: `grid md:grid-cols-2 lg:grid-cols-3 gap-8`
- Max container width: `max-w-6xl mx-auto`

## Do NOT
- Add new color tokens without updating `global.css`
- Use `className` in `.astro` files (use `class`)
- Mix Tailwind v3 syntax (e.g., `dark:` without class strategy)
- Use inline styles when a utility class exists
- Add external CSS frameworks (everything is Tailwind v4)
