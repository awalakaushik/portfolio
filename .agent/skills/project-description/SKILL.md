---
name: Project Description
description: Rules for creating and editing project entries with consistent fields, achievements, and display behavior
---

# Project Description Consistency

This skill defines how portfolio project entries should be structured, including content fields, achievements, and the hover-reveal interaction.

## Schema

Defined in `src/content.config.ts`:

```typescript
schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    image: z.string().optional(),
    liveUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    achievements: z.array(z.string()).default([]),
    company: z.string().optional(),
})
```

## File Location & Naming

- Directory: `src/content/projects/`
- File name: kebab-case project name, e.g. `angular-spa-migration.md`
- One file per project

## Frontmatter Template

```yaml
---
title: "Project Title"
description: "1-2 sentence description of what the project does and its impact."
tags: ["Framework", "Language", "Tool"]
image: "/images/project-placeholder.svg"
company: "Company Name"
achievements:
  - "Achievement with measurable impact"
  - "Another achievement"
  - "Third achievement"
  - "Fourth achievement"
featured: true
order: N
---
```

## Content Rules

### Title
- Use the project's actual name or a descriptive professional title
- Title case, no abbreviations unless standard (e.g., "SPA", "PWA", "CI/CD")

### Description
- 1-2 sentences maximum
- Focus on **what it does** and **business impact**
- Avoid generic phrases like "built with modern technologies"

### Tags
- List technologies used, most important first
- Use canonical names: `Angular` not `AngularJS`, `TypeScript` not `TS`
- Keep to 4-7 tags; the UI shows the first 4 and displays `+N` for the rest

### Achievements
- Exactly **3-4 bullet points**
- Each must be a concrete, measurable outcome
- Start with a past-tense verb: "Migrated...", "Reduced...", "Automated..."
- Include numbers when possible: "reduced errors by 60%", "improved load time by 3x"

### Company
- Full company name, title case
- This appears as a badge on the project card image

### Order
- Lower numbers appear first on the page
- Featured projects (`featured: true`) appear on the homepage

### Image
- Use `/images/project-placeholder.svg` as fallback
- Preferred: screenshot of the actual project at 16:9 aspect ratio

## Display Behavior

The `ProjectCard.tsx` component handles rendering:
- **Default state**: Shows image (with company badge), title, description, and tag pills
- **Hover state**: Reveals an animated overlay showing "Key Achievements" with checkmark icons
- Tag overflow: Displays first 4 tags, then `+N` pill for remaining

## Validation Checklist

- [ ] Title is descriptive and title-cased
- [ ] Description is 1-2 sentences with clear impact
- [ ] 4-7 tags in canonical form
- [ ] 3-4 achievements with past-tense verbs and metrics
- [ ] `company` field is set
- [ ] `order` is correct relative to other projects
- [ ] `featured: true` if it should appear on homepage
