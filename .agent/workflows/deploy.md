---
description: How to deploy the portfolio to awalakaushik.dev via Netlify
---

# Deploy to Production

The portfolio auto-deploys via GitHub Actions on push to `main`. This workflow covers manual verification and troubleshooting.

## Automatic Deploy (Recommended)

1. Ensure all changes pass build validation:
// turbo
```bash
rm -rf .astro/data-store.json && npm run build 2>&1
```

2. Commit and push to `main`:
```bash
git add -A && git commit -m "description of changes" && git push origin main
```

3. The GitHub Action (`.github/workflows/deploy.yml`) will:
   - Install dependencies
   - Build the project
   - Deploy to Netlify

4. Verify the deployment at https://awalakaushik.dev

## Required Secrets

These must be configured in GitHub → Settings → Secrets → Actions:

| Secret | Source |
|--------|--------|
| `NETLIFY_AUTH_TOKEN` | Netlify → User Settings → Applications → Personal Access Tokens |
| `NETLIFY_SITE_ID` | Netlify → Site → Site Configuration → General → Site ID |

## Troubleshooting

- **"Netlify credentials not provided"**: The secrets above aren't set. Add them.
- **Build fails in CI**: Run `npm run build` locally first to catch errors.
- **Forms not working**: Netlify must detect `data-netlify="true"` in the HTML during deploy. If form fields changed, redeploy.
- **Contact form 404**: The `ContactForm.tsx` submits to `/` — make sure the Netlify form name matches `contact`.
