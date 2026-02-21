---
description: How to update the bio and sync it across all pages and the GitHub profile README
---

# Update Bio

Follow these steps when updating the About Me content to keep everything in sync.

## Steps

1. Read the about-me skill for rules:
```
.agent/skills/about-me/SKILL.md
```

2. Edit the single source of truth:
```
src/data/bio.json
```

3. If bio paragraphs changed, update the homepage About snippet:
```
src/pages/index.astro  (lines ~88-93)
```

4. If bio paragraphs changed, update the full About page:
```
src/pages/about.astro  (lines ~27-45)
```

5. If social handles changed, update all locations:
- `src/data/bio.json` → `social` object
- `src/components/Footer.astro` → `socialLinks` array
- `src/pages/contact.astro` → sidebar links

6. If stats changed (years, companies, technologies), update:
```
src/pages/index.astro  (stats section)
```

7. Preview the GitHub README:
// turbo
```bash
node scripts/generate-readme.mjs
```

8. Run build validation:
// turbo
```bash
rm -rf .astro/data-store.json && npm run build 2>&1
```
