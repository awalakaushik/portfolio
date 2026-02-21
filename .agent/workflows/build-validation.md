---
description: How to validate the portfolio build before committing changes
---

# Build Validation

Run this workflow after making any code or content changes to ensure nothing is broken.

## Steps

1. Clear the Astro data store cache to avoid stale content:
// turbo
```bash
rm -rf .astro/data-store.json
```

2. Run the production build:
// turbo
```bash
npm run build 2>&1
```

3. Verify the build output:
- All 6 pages should prerender: `/`, `/about/`, `/blog/`, `/contact/`, `/projects/`, `/blog/building-portfolio-with-astro/`
- No warnings about missing fields or schema mismatches
- Build should complete in under 3 seconds

4. If there are content schema errors, check `src/content.config.ts` for the expected shape and fix the offending markdown file.

5. If there are TypeScript errors in components, check for:
- `className` vs `class` (use `className` in `.tsx`, `class` in `.astro`)
- Missing imports
- Incorrect prop types
