---
name: Content Consistency
description: Global content rules — tone, naming, SEO, and content collection conventions
---

# Content Consistency

This skill defines the overarching content rules for the portfolio: tone, naming conventions, SEO, tech stack entries, and blog posts.

## Tone & Voice

- **Professional but approachable** — not stiff, not casual
- First person ("I built...", "I specialize in...")
- Avoid buzzwords: "synergy", "leverage", "cutting-edge"
- Quantify impact whenever possible

## Naming Conventions

### Files
| Content Type | Directory | Naming |
|-------------|-----------|--------|
| Projects | `src/content/projects/` | kebab-case project name |
| Experience | `src/content/experience/` | kebab-case company name |
| Tech Stack | `src/content/tech-stack/` | kebab-case tech name |
| Blogs | `src/content/blogs/` | kebab-case slug |

### Technology Names
Always use canonical names consistently:

| ✅ Correct | ❌ Wrong |
|-----------|---------|
| Angular | AngularJS, angular |
| React | ReactJS, react.js |
| Vue.js | VueJS, Vue |
| TypeScript | TS, Typescript |
| .NET Core | dotnet, .Net |
| C# | C Sharp, csharp |
| Azure | MS Azure |
| AWS | Amazon Web Services (in UI) |

## Content Collections

All content is managed via Astro Content Collections with Zod schemas in `src/content.config.ts`.

### Adding a New Collection
1. Define the collection in `src/content.config.ts` with a Zod schema
2. Export it in the `collections` object
3. Create the content directory under `src/content/`
4. Add markdown files matching the schema

### Tech Stack Entries

File format for `src/content/tech-stack/`:
```yaml
---
name: "Technology Name"
category: "Frontend|Language|Backend|Cloud|DevOps|Database"
icon: "devicon-slug"
proficiency: "beginner|intermediate|advanced|expert"
---
```

Icons use the [Devicon CDN](https://cdn.jsdelivr.net/gh/devicons/devicon/icons/) with a 3-tier fallback:
1. `{slug}-original.svg`
2. `{slug}-plain-wordmark.svg`
3. `{slug}-original-wordmark.svg`

Valid categories: `Frontend`, `Language`, `Backend`, `Cloud`, `DevOps`, `Database`

## SEO

Every page must have:
- Descriptive `<title>` tag including "Kaushik Reddy Awala"
- `description` meta tag (set via `BaseLayout` prop)
- Single `<h1>` per page
- Semantic HTML (`<section>`, `<article>`, `<nav>`, `<footer>`)

Title format: `Page Name — Kaushik Reddy Awala`

## Blog Posts

```yaml
---
title: "Blog Post Title"
description: "1-2 sentence summary for SEO and previews."
pubDate: 2026-01-15
tags: ["Tag1", "Tag2"]
draft: false
---
```

- Set `draft: true` to hide from production
- `pubDate` must be a valid date (YYYY-MM-DD)
- Tags should use the same canonical names as project tags

## Footer

The footer (`src/components/Footer.astro`) must always contain:
- Brand logo (`AK.dev`)
- Social links (GitHub, LinkedIn, X) — matching `bio.json` handles
- Copyright with current year (auto-generated)
- Tech credits: Claude, Astro, Tailwind CSS
