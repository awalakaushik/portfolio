---
name: Blog Writing
description: Rules for creating and formatting blog posts — schema, markdown conventions, SEO, and publishing workflow
---

# Blog Writing

This skill governs how blog posts are authored, formatted, and published.

## Schema

Defined in `src/content.config.ts`:

```typescript
schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
})
```

## File Location & Naming

- Directory: `src/content/blogs/`
- File name: kebab-case slug matching the URL, e.g., `building-portfolio-with-astro.md`
- One file per post
- URL generated: `/blog/{slug}`

## Frontmatter Template

```yaml
---
title: "Descriptive Blog Post Title"
description: "1-2 sentence summary for SEO previews and meta tags."
pubDate: 2026-02-20
tags: ["Topic1", "Topic2"]
draft: false
---
```

## Content Rules

### Title
- Clear, descriptive, and engaging
- Title case
- Keep under 60 characters for SEO

### Description
- 1-2 sentences summarizing the post
- Used in `<meta name="description">` and blog index cards
- Keep under 160 characters for search engine display

### Publishing
- Set `draft: true` while writing — draft posts are hidden from production
- Set `draft: false` when ready to publish
- `pubDate` must be a valid `YYYY-MM-DD` date

### Tags
- Use canonical technology names (same as project tags): `Angular` not `AngularJS`
- 2-4 tags per post
- Tags are displayed on the blog index page

### Markdown Body
- Use proper heading hierarchy: start with `##` (the `<h1>` is the title)
- Use fenced code blocks with language identifiers: ` ```typescript `
- Include alt text for images: `![description](url)`
- Use relative links for internal pages: `[projects](/projects)`

---

## Plain Language & Readability

Blog posts must be written for **all readers**, not just experienced engineers. Follow these rules:

### Sentence Structure
- Prefer short, direct sentences (15-20 words max where possible)
- Break complex ideas into multiple sentences instead of long compound/complex ones
- Start paragraphs with the main point, then elaborate
- Use active voice: "Astro ships zero JavaScript" not "Zero JavaScript is shipped by Astro"

### Vocabulary
- Avoid jargon without explanation — if you must use a technical term, briefly define it on first use
- Use everyday words: "use" not "utilize", "start" not "instantiate", "build" not "scaffold"
- Spell out acronyms on first use: "Single Page Application (SPA)"

### Structure & Scannability
- Use headings every 3-5 paragraphs to break up content
- Use bullet lists for 3+ items instead of inline lists
- Use tables for structured comparisons (2+ dimensions)
- Bold key terms and takeaways so readers can scan
- Include a brief intro sentence before code blocks explaining what the code does

### Tone
- Conversational and first-person ("I built…", "Here's what I learned…")
- Enthusiastic without being hyperbolic
- Acknowledge trade-offs honestly — don't oversell

---

## Interactive Demos

Blog posts should include **inline interactive demos** wherever the text describes a visual behavior, UI pattern, or state change. This differentiates the blog from static-only content and lets readers *experience* what we're talking about.

### When to Add a Demo

Add a "Try it" demo block when:
- Describing a **hover/click interaction** (e.g., project card overlay reveal)
- Explaining **state transitions** (e.g., form idle → submitting → success → error)
- Demonstrating **visual theming** (e.g., seasonal color palette changes)
- Comparing **architectural patterns** (e.g., static vs hydrated components)

Do NOT add a demo when:
- The concept is purely textual/logical (algorithms, data flow diagrams)
- The interaction requires server-side state

### Implementation Pattern

Demos are embedded as **raw HTML blocks** inside the `.md` file. Astro's markdown renderer passes through HTML untouched. No MDX or extra packages required.

Structure every demo as:

```html
### Try it: [Demo Title]

[1 sentence explaining what the reader should do]

<div class="demo-[name]-wrapper">
<style>
  /* Scoped styles using .demo-[name]- prefix to avoid collisions */
  /* MUST use var(--color-*) tokens for theme/season compatibility */
  /* MUST include .dark selectors for dark mode */
</style>

  <!-- Interactive HTML here -->

<script>
  // Minimal JS, only if CSS :hover/:focus isn't sufficient
  // Use vanilla JS only — no imports
</script>
</div>
```

### Demo Rules

1. **Namespace CSS**: Prefix all classes with `demo-[name]-` to avoid collisions with `global.css` prose styles
2. **Use design tokens**: Always use `var(--color-primary-*)`, `var(--color-surface-*)`, and `var(--color-accent-*)` — never hardcode hex values in layout/accent elements
3. **Dark mode**: Include `.dark .demo-*` selectors for every background, border, and text color
4. **CSS-first**: Prefer CSS `:hover`, `:focus`, and `:checked` over JavaScript where possible
5. **No external dependencies**: Vanilla JS only — no React, no imports, no `fetch`
6. **Keep it small**: Each demo should be self-contained in a single HTML block, under 100 lines of CSS
7. **Accessible**: All interactive demos must follow the accessibility rules below

### Existing Demo Patterns

Reference these in `building-portfolio-with-astro.md`:
- **Hydration Comparison**: Two side-by-side cards with hover lift (CSS-only)
- **Season Preview**: Click buttons to swap gradient text and palette swatches (JS)
- **Project Card Hover**: CSS `:hover` overlay revealing achievements
- **Form States**: Button group cycling through idle/submitting/success/error views (JS)

---

## Accessibility

All blog content and embedded demos **must** be accessible. This is non-negotiable.

### Text & Prose

- **Color contrast**: All text must meet WCAG AA contrast ratios (4.5:1 for body text, 3:1 for large text)
- **Font size**: Prose body text minimum 1rem (18px actual via the `.prose` class)
- **Line height**: Minimum 1.5 for body text (the prose class uses 1.8)
- **Link distinction**: Links must be distinguishable by more than color alone (underline by default via `.prose a`)

### Headings & Structure

- Use semantic heading hierarchy (`h2` → `h3`, never skip levels)
- All images must have descriptive `alt` text — never leave `alt=""` unless the image is purely decorative
- Use `<article>`, `<header>`, `<nav>`, `<main>` landmark elements (already handled by `[...slug].astro`)

### Interactive Demos — ARIA & Keyboard

All demo interactive elements must be:
1. **Keyboard navigable**: Clickable elements must use `<button>`, not `<div onclick>`. Buttons are keyboard-focusable by default
2. **Focus visible**: Include `:focus-visible` styles on all interactive elements:
   ```css
   .demo-btn:focus-visible {
     outline: 2px solid var(--color-primary-500);
     outline-offset: 2px;
   }
   ```
3. **ARIA labels**: Add `aria-label` to buttons that use only emoji or icons:
   ```html
   <button aria-label="Switch to Spring theme" onclick="...">🌸 Spring</button>
   ```
4. **Live regions**: Use `aria-live="polite"` on content that updates dynamically (e.g., the season preview card):
   ```html
   <div id="demo-season-card" aria-live="polite">...</div>
   ```
5. **Role attributes**: If a group of buttons acts as a selector, use `role="radiogroup"` and `role="radio"` with `aria-checked`

### Screen Reader Considerations

- Hidden decorative content: Use `aria-hidden="true"` on emoji or decorative elements that add no informational value
- Announce state changes: When JS updates content (e.g., form state switch), ensure the live region container receives the new content so screen readers announce it
- Skip-to-content: The blog layout already includes a spacer div; ensure a skip-to-main link is available if not present
- Code blocks: Wrap `<pre><code>` blocks with `role="region"` and an `aria-label` describing the content:
  ```html
  <pre role="region" aria-label="TypeScript schema definition"><code>...</code></pre>
  ```

### Color & Theme Safety

- Demos must never rely on **color alone** to convey information — always pair color with text labels, icons, or patterns
- All seasonal color palettes must maintain AA contrast ratios in both light and dark modes
- Use text labels alongside swatches (e.g., "Indigo" not just a purple circle)

---

## Pages

| Page | File | Purpose |
|------|------|---------|
| Blog index | `src/pages/blog/index.astro` | Lists all non-draft posts, sorted by date |
| Blog post | `src/pages/blog/[...slug].astro` | Renders individual post content |

## Adding a New Post

1. Create `src/content/blogs/{slug}.md` with frontmatter
2. Write markdown content below the frontmatter
3. Add interactive demos for any visual/UI concepts described
4. Verify accessibility: keyboard navigation, ARIA labels, contrast
5. Set `draft: true` during development
6. Preview at `http://localhost:4321/blog/{slug}`
7. Set `draft: false` and commit when ready
