---
name: Experience Consistency
description: Rules for adding or editing work experience entries to maintain consistent formatting
---

# Experience Consistency

This skill governs how work experience entries are structured in the portfolio.

## Schema

Defined in `src/content.config.ts`:

```typescript
schema: z.object({
    company: z.string(),
    role: z.string(),
    startDate: z.string(),       // Format: "YYYY-MM"
    endDate: z.string().optional(), // Omit for current role
    description: z.string(),
    logo: z.string().optional(),
    order: z.number().default(0),  // Lower = more recent
})
```

## File Location & Naming

- Directory: `src/content/experience/`
- File name: kebab-case company name, e.g. `university-of-houston.md`
- One file per company (even if multiple roles — summarize in description)

## Frontmatter Template

```yaml
---
company: "Company Name"
role: "Your Title"
startDate: "YYYY-MM"
endDate: "YYYY-MM"
description: "1-2 sentence summary with measurable impact. Include technologies used."
order: N
---
```

## Content Rules

1. **Description** must be 1-2 sentences summarizing impact. Include:
   - What you built or led
   - Technologies used
   - A quantifiable result (e.g., "reduced errors by 60%", "improved performance by 3x")

2. **Markdown body** below frontmatter is a slightly expanded version of the description (shown on the About page).

3. **Order** determines display order — lower numbers appear first (most recent).
   - Current position: order 1
   - Previous: increment from there

4. **Date format** is strictly `YYYY-MM`. No day component.

5. **Omit `endDate`** for current/present role.

## Example

```markdown
---
company: "Microsoft"
role: "Software Developer"
startDate: "2021-05"
endDate: "2022-01"
description: "Developed a reporting application using Angular and .NET Core. Integrated ML models for financial planning automation."
order: 3
---

Developed a reporting application using Angular and .NET Core. Integrated ML models for financial planning automation. Migrated legacy reports to a modern React/.NET Core/Azure dashboard and automated CI/CD pipelines using Azure DevOps.
```

## Validation Checklist

- [ ] File name is kebab-case company name
- [ ] `startDate` and `endDate` are in `YYYY-MM` format
- [ ] `description` includes technologies and measurable impact
- [ ] `order` is set correctly relative to other entries
- [ ] Markdown body expands on the frontmatter description
- [ ] No duplicate company files
