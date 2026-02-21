---
name: About Me
description: Guidelines for maintaining the About Me / bio content across the portfolio and external profiles
---

# About Me Consistency

This skill ensures the bio, personal details, and About Me sections stay consistent across the portfolio and external profiles.

## Single Source of Truth

All bio data lives in `src/data/bio.json`. This file is consumed by:
- The homepage About snippet (`src/pages/index.astro`)
- The GitHub profile README generator (`scripts/generate-readme.mjs`)

When updating bio content, **always update `bio.json` first**, then propagate changes to pages.

## `bio.json` Structure

```json
{
  "name": "Kaushik Reddy Awala",
  "greeting": "Hi there, I'm Awala, Kaushik Reddy! 👋",
  "title": "Software Engineer",
  "location": "Houston, TX",
  "email": "reach@awalakaushik.dev",
  "website": "https://awalakaushik.dev",
  "bio": ["paragraph 1", "paragraph 2", "paragraph 3"],
  "currentlyLearning": [...],
  "interests": [...],
  "certifications": [...],
  "social": { "github": "...", "linkedin": "...", "twitter": "..." },
  "techStack": { "Category": ["tech1", "tech2"] }
}
```

## Bio Content Rules

The `bio` array must contain exactly **3 paragraphs**, each with a clear purpose:

| Paragraph | Purpose | Must Include |
|-----------|---------|--------------|
| 1 | Professional identity | Role, focus areas, values |
| 2 | Technical expertise | Frameworks, tools, cloud platforms |
| 3 | Personal interests | Hobbies, side pursuits, current learning |

## Pages That Reference Bio

| Page | File | What it shows |
|------|------|---------------|
| Homepage "About Me" | `src/pages/index.astro` lines 88-93 | Paragraphs 1 & 3 (condensed) |
| About page | `src/pages/about.astro` lines 27-45 | All 3 paragraphs (full) |
| Contact sidebar | `src/pages/contact.astro` | Email, social handles |
| Footer | `src/components/Footer.astro` | Social links |

## Social Handle Sync

All social handles must match across these locations:
- `bio.json` → `social` object
- `Footer.astro` → `socialLinks` array
- `contact.astro` → Contact Info sidebar
- GitHub README → generated from `bio.json`

Current handles:
| Platform | Handle |
|----------|--------|
| GitHub | `awalakaushik` |
| LinkedIn | `akaushikr` |
| X/Twitter | `akaushikr` |
| Email | `reach@awalakaushik.dev` |

## Stats Section

Homepage stats (`src/pages/index.astro`) must be updated when:
- Adding a new company → increment Companies count
- Adding a new project → increment Projects count
- Years of experience → update annually

Current values: `8+` Years, `4+` Companies, `12+` Technologies

## When Updating Bio

1. Edit `src/data/bio.json`
2. Update the homepage snippet in `src/pages/index.astro` if paragraph 1 or 3 changed
3. Update the about page in `src/pages/about.astro` if any paragraph changed
4. Run `node scripts/generate-readme.mjs` to preview the GitHub README
5. Commit — the GitHub Action will sync the README automatically (when configured)
