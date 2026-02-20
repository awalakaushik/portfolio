---
title: "Building a Modern Portfolio with Astro and Framer Motion"
description: "A deep dive into how I built this portfolio using Astro's content collections, Tailwind CSS v4, and tasteful Framer Motion animations."
pubDate: 2026-02-15
tags: ["Astro", "Tailwind CSS", "Framer Motion", "Web Development"]
draft: false
---

## Why Astro?

Astro's island architecture is a game-changer for content-heavy sites. By shipping **zero JavaScript by default**, every page loads instantly — and you only hydrate the interactive bits.

### The Stack

- **Astro** for static site generation
- **React** for interactive islands (navbar, animations)
- **Tailwind CSS v4** for utility-first styling
- **Framer Motion** for buttery-smooth animations

## Content Collections

Astro's Content Collections give you type-safe markdown content with Zod schema validation. No more runtime surprises.

```typescript
const projects = defineCollection({
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
  }),
});
```

## What I Learned

Building with Astro taught me to think critically about what actually needs JavaScript. Spoiler: most things don't.
