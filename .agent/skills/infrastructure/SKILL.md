---
name: Infrastructure
description: Astro config, Netlify deployment, GitHub Actions, and environment setup rules
---

# Infrastructure

This skill covers the build pipeline, deployment config, and environment setup.

## Tech Stack

| Tool | Version | Config File |
|------|---------|-------------|
| Astro | 5.x | `astro.config.mjs` |
| React | 19.x | (via `@astrojs/react`) |
| Tailwind CSS | 4.x | `src/styles/global.css` (Vite plugin, no `tailwind.config`) |
| Framer Motion | 12.x | (no config) |
| Node.js | 20 | `netlify.toml`, CI |

## Astro Config (`astro.config.mjs`)

```javascript
export default defineConfig({
  site: 'https://awalakaushik.dev',
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  adapter: netlify()
});
```

Key rules:
- `site` is used for canonical URLs and sitemaps — must stay `https://awalakaushik.dev`
- React integration is required for all `.tsx` components
- Tailwind is a Vite plugin (v4 style), NOT an Astro integration
- Netlify adapter enables server-side features (sessions, forms)

## Netlify Config (`netlify.toml`)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

- Build output goes to `dist/`
- Always use Node 20
- Netlify Forms: detected via `data-netlify="true"` in HTML during build

## GitHub Actions

| Workflow | File | Trigger |
|----------|------|---------|
| Deploy to Netlify | `.github/workflows/deploy.yml` | Push to `main` |

Required secrets:
- `NETLIFY_AUTH_TOKEN` — Netlify personal access token
- `NETLIFY_SITE_ID` — from Netlify site settings

## Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| Dev server | `npm run dev` | Local development at `localhost:4321` |
| Build | `npm run build` | Production build to `dist/` |
| Preview | `npm run preview` | Preview production build locally |
| Generate README | `node scripts/generate-readme.mjs` | Generate GitHub profile README from `bio.json` |

## Cache Clearing

If you see stale content or schema errors after changing content files:
```bash
rm -rf .astro/data-store.json
```
Then rebuild. The Astro data store caches content collection entries.

## Dependencies

**Do NOT add new dependencies** without good reason. The project intentionally has a minimal dependency footprint:
- No CSS framework beyond Tailwind
- No state management library (React state is sufficient)
- No CMS or headless API (content is in markdown files)
- No analytics SDK (add via Netlify if needed)

If a dependency is needed, prefer:
1. Astro integrations (`@astrojs/*`)
2. Well-maintained, small packages
3. CDN resources (like devicon) over npm packages for assets

## Environment

- No `.env` file required — all config is in checked-in files
- Dark mode: class-based, persisted to `localStorage`
- No server-side secrets needed for the static site
