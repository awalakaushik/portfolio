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

## Pages

| Page | File | Purpose |
|------|------|---------|
| Blog index | `src/pages/blog/index.astro` | Lists all non-draft posts, sorted by date |
| Blog post | `src/pages/blog/[...slug].astro` | Renders individual post content |

## Adding a New Post

1. Create `src/content/blogs/{slug}.md` with frontmatter
2. Write markdown content below the frontmatter
3. Set `draft: true` during development
4. Preview at `http://localhost:4321/blog/{slug}`
5. Set `draft: false` and commit when ready
