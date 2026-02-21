---
description: How to add a new project to the portfolio
---

# Add New Project

Follow these steps to add a new project entry to the portfolio.

## Steps

1. Read the project description skill for schema rules:
```
.agent/skills/project-description/SKILL.md
```

2. Create a new markdown file in `src/content/projects/` using kebab-case naming:
```
src/content/projects/{project-name}.md
```

3. Fill in the frontmatter with all required fields:
```yaml
---
title: "Project Title"
description: "1-2 sentence impact-focused description."
tags: ["Tech1", "Tech2", "Tech3", "Tech4"]
image: "/images/project-placeholder.svg"
company: "Company Name"
achievements:
  - "Achievement with measurable result"
  - "Another achievement"
  - "Third achievement"
featured: true
order: N
---
```

4. Set the `order` field:
// turbo
```bash
ls -la src/content/projects/
```
- Check existing orders and assign the correct position (lower = appears first)

5. Update the homepage stats if the total project count changed:
- Edit `src/pages/index.astro` and update the Projects stat number

6. Run build validation:
// turbo
```bash
rm -rf .astro/data-store.json && npm run build 2>&1
```

7. Start the dev server and visually verify on the homepage and /projects page:
```bash
npm run dev
```
