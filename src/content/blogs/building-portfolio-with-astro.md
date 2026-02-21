---
title: "Building a Modern Portfolio with Astro and Framer Motion"
description: "A deep dive into how I built this portfolio using Astro's content collections, Tailwind CSS v4, seasonal color themes, and tasteful Framer Motion animations."
pubDate: 2026-02-15
tags: ["Astro", "Tailwind CSS", "Framer Motion", "Web Development"]
draft: false
---

## Why Astro?

When I set out to rebuild my portfolio, I had a clear goal: **fast, content-first, and minimal JavaScript**. Astro's island architecture was the perfect fit. By shipping zero JavaScript by default, every page loads instantly — and you only hydrate the interactive bits that actually *need* to be interactive.

The result? A portfolio that scores 100 on Lighthouse Performance while still having smooth animations, a dark mode toggle, and even a seasonal color palette system.

## The Stack

Here's what powers this site:

- **Astro 5** — Static site generation with island architecture
- **React 19** — Interactive components (navbar, project cards, contact form)
- **Tailwind CSS v4** — Utility-first styling with the new `@theme` directive
- **Framer Motion** — Scroll-triggered animations and micro-interactions
- **Netlify** — Hosting, form processing, and CI/CD via GitHub Actions

The key insight: not everything needs to be a React component. I split components into two categories:

| Type | Extension | When to Use |
|------|-----------|-------------|
| **Static** | `.astro` | No client-side interactivity needed |
| **Interactive** | `.tsx` | Needs state, event handlers, or animations |

This means the `Footer` and `SectionHeading` ship **zero JavaScript**, while the `Navbar` and `ProjectCard` hydrate only when needed.

### Try it: Hydration Comparison

Hover over the cards below to see how Astro island architecture works — static components render instantly with no JS, while interactive islands hydrate on demand:

<div class="demo-hydration">
<style>
.demo-hydration {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1.5rem 0 2rem;
}
@media (max-width: 640px) {
  .demo-hydration { grid-template-columns: 1fr; }
}
.demo-hydration-card {
  position: relative;
  padding: 1.25rem;
  border-radius: 0.75rem;
  border: 1px solid var(--color-surface-200);
  background: var(--color-surface-50);
  transition: all 0.3s ease;
  overflow: hidden;
}
.dark .demo-hydration-card {
  border-color: var(--color-surface-700);
  background: var(--color-surface-900);
}
.demo-hydration-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(0,0,0,0.12);
}
.dark .demo-hydration-card:hover {
  box-shadow: 0 8px 25px -5px rgba(0,0,0,0.4);
}
.demo-hydration-card:focus-within {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
.demo-hydration-card .card-tag {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}
.demo-card-static .card-tag {
  background: var(--color-accent-500);
  color: white;
}
.demo-card-island .card-tag {
  background: var(--color-primary-500);
  color: white;
}
.demo-hydration-card h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0.5rem 0 0.25rem;
  color: var(--color-surface-900);
}
.dark .demo-hydration-card h4 {
  color: white;
}
.demo-hydration-card p {
  font-size: 0.85rem;
  color: var(--color-surface-500);
  margin: 0;
  line-height: 1.5;
}
.demo-hydration-card .js-badge {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
  text-transform: uppercase;
}
.demo-card-static .js-badge {
  background: var(--color-accent-500);
  color: white;
}
.demo-card-island .js-badge {
  background: var(--color-primary-500);
  color: white;
}
</style>
<div class="demo-hydration-card demo-card-static" tabindex="0" role="region" aria-label="Static component example: Footer">
  <span class="card-tag">Static (.astro)</span>
  <h4>Footer</h4>
  <p>Social links, copyright, tech credits. No client-side interactivity needed.</p>
  <span class="js-badge" aria-label="Zero kilobytes of JavaScript">0 KB JS</span>
</div>
<div class="demo-hydration-card demo-card-island" tabindex="0" role="region" aria-label="Interactive island example: Navbar">
  <span class="card-tag">Island (.tsx)</span>
  <h4>Navbar</h4>
  <p>Mobile menu, dark mode toggle, scroll detection. Hydrates via <code>client:load</code>.</p>
  <span class="js-badge" aria-label="Approximately seven kilobytes of JavaScript">~7 KB JS</span>
</div>
</div>

## Content Collections

One of Astro's best features is Content Collections — type-safe markdown content with Zod schema validation. No more runtime surprises when a field is missing or malformed.

Here's the actual schema powering my projects:

```typescript
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
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
  }),
});
```

I have four collections: **projects**, **experience**, **blogs**, and **tech-stack**. Each lives in its own directory under `src/content/` and follows strict naming conventions (kebab-case file names matching the company or project name).

The beauty of this approach is that adding a new project is just creating a markdown file — no database, no CMS, no API calls.

## Seasonal Color Palettes 🎨

This is probably my favorite feature. The site's color palette changes automatically based on the time of year:

| Season | Months | Primary Colors | Accent |
|--------|--------|----------------|--------|
| ❄️ Winter | Dec–Feb | Indigo | Emerald |
| 🌸 Spring | Mar–May | Teal | Rose |
| ☀️ Summer | Jun–Aug | Amber | Cyan |
| 🍂 Autumn | Sep–Nov | Orange | Gold |

### Try it: Season Preview

Click any season below to see its color palette. The gradient text and accent dot update live — this is the same CSS variable override the real site uses:

<div class="demo-seasons-wrapper">
<style>
.demo-seasons-wrapper {
  margin: 1.5rem 0 2rem;
}
.demo-season-btns {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.demo-season-btn {
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 99px;
  border: 2px solid var(--color-surface-200);
  background: transparent;
  color: var(--color-surface-600);
  transition: all 0.25s ease;
}
.dark .demo-season-btn {
  border-color: var(--color-surface-700);
  color: var(--color-surface-400);
}
.demo-season-btn:hover {
  transform: scale(1.05);
}
.demo-season-btn:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
.demo-season-preview {
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid var(--color-surface-200);
  background: var(--color-surface-50);
  transition: all 0.4s ease;
}
.dark .demo-season-preview {
  border-color: var(--color-surface-700);
  background: var(--color-surface-900);
}
.demo-season-preview .demo-gradient-text {
  font-size: 1.5rem;
  font-weight: 700;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.4s ease;
}
.demo-season-preview .demo-accent-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.5rem;
  transition: background 0.4s ease;
}
.demo-season-preview .demo-subtitle {
  font-size: 0.85rem;
  color: var(--color-surface-500);
  margin-top: 0.25rem;
}
.demo-season-preview .demo-palette {
  display: flex;
  gap: 0.375rem;
  margin-top: 0.75rem;
}
.demo-palette-swatch {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  transition: background 0.4s ease;
  border: 1px solid rgba(0,0,0,0.1);
}
</style>
<div class="demo-season-btns" role="radiogroup" aria-label="Season palette selector">
  <button class="demo-season-btn" role="radio" aria-checked="true" aria-label="Switch to Winter theme" onclick="setDemoSeason('winter')"><span aria-hidden="true">❄️</span> Winter</button>
  <button class="demo-season-btn" role="radio" aria-checked="false" aria-label="Switch to Spring theme" onclick="setDemoSeason('spring')"><span aria-hidden="true">🌸</span> Spring</button>
  <button class="demo-season-btn" role="radio" aria-checked="false" aria-label="Switch to Summer theme" onclick="setDemoSeason('summer')"><span aria-hidden="true">☀️</span> Summer</button>
  <button class="demo-season-btn" role="radio" aria-checked="false" aria-label="Switch to Autumn theme" onclick="setDemoSeason('autumn')"><span aria-hidden="true">🍂</span> Autumn</button>
</div>
<div class="demo-season-preview" id="demo-season-card" aria-live="polite" aria-label="Season color palette preview">
  <span class="demo-accent-dot" id="demo-dot" aria-hidden="true"></span>
  <span class="demo-gradient-text" id="demo-text">A portfolio built with 'Astro'</span>
  <p class="demo-subtitle" id="demo-label"><span aria-hidden="true">❄️</span> Winter — Indigo + Emerald</p>
  <div class="demo-palette" id="demo-swatches" aria-label="Color swatches"></div>
</div>
<script>
var demoSeasons = {
  winter: { label: '❄️ Winter — Indigo + Emerald', primary: ['#eef2ff','#c7d2fe','#818cf8','#6366f1','#4f46e5','#3730a3'], accent: '#10b981', from: '#818cf8', via: '#6366f1', to: '#34d399' },
  spring: { label: '🌸 Spring — Teal + Rose', primary: ['#f0fdfa','#99f6e4','#2dd4bf','#14b8a6','#0d9488','#115e59'], accent: '#f43f5e', from: '#2dd4bf', via: '#14b8a6', to: '#fb7185' },
  summer: { label: '☀️ Summer — Amber + Cyan', primary: ['#fffbeb','#fde68a','#fbbf24','#f59e0b','#d97706','#92400e'], accent: '#06b6d4', from: '#fbbf24', via: '#f59e0b', to: '#22d3ee' },
  autumn: { label: '🍂 Autumn — Orange + Gold', primary: ['#fff7ed','#fed7aa','#fb923c','#f97316','#ea580c','#9a3412'], accent: '#eab308', from: '#fb923c', via: '#f97316', to: '#facc15' }
};
function setDemoSeason(s) {
  var d = demoSeasons[s];
  document.getElementById('demo-text').style.backgroundImage = 'linear-gradient(to right, ' + d.from + ', ' + d.via + ', ' + d.to + ')';
  document.getElementById('demo-dot').style.background = d.accent;
  document.getElementById('demo-label').textContent = d.label;
  // Update ARIA checked states
  document.querySelectorAll('.demo-season-btn').forEach(function(btn) {
    btn.setAttribute('aria-checked', btn.textContent.trim().toLowerCase().indexOf(s) !== -1 ? 'true' : 'false');
  });
  var sw = document.getElementById('demo-swatches');
  sw.innerHTML = '';
  d.primary.forEach(function(c) {
    var el = document.createElement('div');
    el.className = 'demo-palette-swatch';
    el.style.background = c;
    sw.appendChild(el);
  });
  var acEl = document.createElement('div');
  acEl.className = 'demo-palette-swatch';
  acEl.style.background = d.accent;
  acEl.setAttribute('aria-label', 'Accent color');
  sw.appendChild(acEl);
}
setDemoSeason('winter');
</script>
</div>

### How It Works

The implementation is surprisingly simple. Tailwind CSS v4's `@theme` directive defines CSS custom properties:

```css
@theme {
  --color-primary-500: #6366f1; /* Winter indigo */
  --color-accent-500: #10b981;  /* Winter emerald */
}
```

Then each season overrides these tokens via a `data-season` attribute on `<html>`:

```css
html[data-season="spring"] {
  --color-primary-500: #14b8a6; /* Teal */
  --color-accent-500: #f43f5e;  /* Rose */
}
```

An inline script in `<head>` detects the current month *before the page paints*, so there's no flash of wrong colors:

```javascript
var seasons = ['winter','winter','spring','spring','spring',
               'summer','summer','summer','autumn','autumn',
               'autumn','winter'];
var season = localStorage.getItem('season') || seasons[new Date().getMonth()];
document.documentElement.setAttribute('data-season', season);
```

Visitors can also manually cycle through seasons using the emoji toggle (🌸 ☀️ 🍂 ❄️) in the navbar, and their preference persists in `localStorage`.

## The Design System

Every visual element is built on three utility classes:

- **`.text-gradient`** — The signature gradient text that blends primary into accent colors
- **`.glass-card`** — Frosted glass cards with backdrop blur and subtle borders
- **`.section-padding`** — Responsive section spacing that scales with screen size

These, combined with a consistent color token system (`primary-*`, `surface-*`, `accent-*`), mean I never write raw hex values. Everything adapts automatically when the season or theme changes.

## Animations Done Right

Framer Motion powers all the animations, but I follow a strict rule: **use `client:visible` hydration whenever possible**. This means animation components only load when scrolled into view.

```tsx
// FadeIn wraps any content with a scroll-triggered entrance
<FadeIn client:visible delay={0.1}>
  <ProjectCard ... />
</FadeIn>
```

The `ProjectCard` itself uses `whileHover` for the achievement overlay reveal — when you hover a project card, the achievements slide in from the bottom with a spring animation. Here's what that looks like in action:

### Try it: Project Card Hover

Hover over the card below to reveal the achievement overlay, just like the real project cards on the portfolio:

<div class="demo-project-card-wrapper">
<style>
.demo-project-card-wrapper {
  margin: 1.5rem 0 2rem;
  perspective: 1000px;
}
.demo-project-card {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--color-surface-200);
  background: var(--color-surface-50);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}
.dark .demo-project-card {
  border-color: var(--color-surface-700);
  background: var(--color-surface-900);
}
.demo-project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -12px rgba(0,0,0,0.15);
}
.dark .demo-project-card:hover {
  box-shadow: 0 20px 40px -12px rgba(0,0,0,0.5);
}
.demo-project-img {
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600), var(--color-accent-500));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}
.demo-project-content {
  padding: 1.25rem;
}
.demo-project-content h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-surface-900);
  margin: 0 0 0.375rem;
}
.dark .demo-project-content h4 {
  color: white;
}
.demo-project-content p {
  font-size: 0.85rem;
  color: var(--color-surface-500);
  margin: 0 0 0.75rem;
  line-height: 1.5;
}
.demo-project-tags {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}
.demo-project-tag {
  font-size: 0.7rem;
  font-weight: 500;
  padding: 0.2rem 0.5rem;
  border-radius: 99px;
  background: var(--color-primary-50);
  color: var(--color-primary-600);
}
.dark .demo-project-tag {
  background: rgba(99, 102, 241, 0.15);
  color: var(--color-primary-400);
}
/* Achievement overlay */
.demo-project-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 60%, transparent 100%);
  padding: 3rem 1.25rem 1.25rem;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.demo-project-card:hover .demo-project-overlay {
  transform: translateY(0);
}
.demo-overlay-title {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-primary-400);
  margin-bottom: 0.5rem;
}
.demo-overlay-item {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.9);
  padding-left: 1rem;
  position: relative;
  margin-bottom: 0.375rem;
  line-height: 1.4;
}
.demo-overlay-item::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-accent-400);
  font-weight: 700;
}
</style>
<div class="demo-project-card">
  <div class="demo-project-img">🛒</div>
  <div class="demo-project-content">
    <h4>E-Commerce Platform</h4>
    <p>Full-stack e-commerce solution with real-time inventory, payment processing, and an admin dashboard.</p>
    <div class="demo-project-tags">
      <span class="demo-project-tag">React</span>
      <span class="demo-project-tag">.NET Core</span>
      <span class="demo-project-tag">Azure</span>
      <span class="demo-project-tag">SQL Server</span>
    </div>
  </div>
  <div class="demo-project-overlay">
    <div class="demo-overlay-title">Key Achievements</div>
    <div class="demo-overlay-item">Reduced page load time by 40% with lazy loading</div>
    <div class="demo-overlay-item">Handled 10K+ concurrent users at peak</div>
    <div class="demo-overlay-item">99.9% uptime SLA with Azure deployment</div>
  </div>
</div>
</div>

## Contact Form with Netlify Forms

The contact form is a React component (`ContactForm.tsx`) that submits via `fetch` to Netlify Forms — no page redirect, no janky full-page POST:

### Try it: Form States

Click the buttons below to cycle through the contact form's four states:

<div class="demo-form-states">
<style>
.demo-form-states {
  margin: 1.5rem 0 2rem;
}
.demo-form-btns {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.demo-form-btn {
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.4rem 0.85rem;
  border-radius: 99px;
  border: 2px solid var(--color-surface-200);
  background: transparent;
  color: var(--color-surface-600);
  transition: all 0.2s ease;
}
.dark .demo-form-btn {
  border-color: var(--color-surface-700);
  color: var(--color-surface-400);
}
.demo-form-btn:hover {
  transform: scale(1.05);
}
.demo-form-btn:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
.demo-form-btn.active-state {
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
  color: white;
}
.demo-form-preview {
  border-radius: 0.75rem;
  border: 1px solid var(--color-surface-200);
  background: var(--color-surface-50);
  padding: 1.25rem;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.3s ease;
}
.dark .demo-form-preview {
  border-color: var(--color-surface-700);
  background: var(--color-surface-900);
}
.demo-form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-surface-300);
  background: white;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: var(--color-surface-700);
}
.dark .demo-form-input {
  background: var(--color-surface-800);
  border-color: var(--color-surface-600);
  color: var(--color-surface-300);
}
.demo-form-input.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.demo-submit-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: default;
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  width: fit-content;
}
.demo-success-msg {
  text-align: center;
  color: #10b981;
  font-weight: 600;
  font-size: 1.1rem;
}
.demo-error-msg {
  text-align: center;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  color: #ef4444;
  font-size: 0.85rem;
}
@keyframes demo-spin {
  to { transform: rotate(360deg); }
}
.demo-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: demo-spin 0.6s linear infinite;
}
</style>
<div class="demo-form-btns" role="radiogroup" aria-label="Form state selector">
  <button class="demo-form-btn active-state" role="radio" aria-checked="true" aria-label="Show idle state" onclick="showFormState('idle')">Idle</button>
  <button class="demo-form-btn" role="radio" aria-checked="false" aria-label="Show submitting state" onclick="showFormState('submitting')">Submitting</button>
  <button class="demo-form-btn" role="radio" aria-checked="false" aria-label="Show success state" onclick="showFormState('success')">Success</button>
  <button class="demo-form-btn" role="radio" aria-checked="false" aria-label="Show error state" onclick="showFormState('error')">Error</button>
</div>
<div class="demo-form-preview" id="demo-form" aria-live="polite" aria-label="Contact form state preview"></div>
<script>
function showFormState(state) {
  var form = document.getElementById('demo-form');
  var btns = document.querySelectorAll('.demo-form-btn');
  btns.forEach(function(b) { b.classList.remove('active-state'); b.setAttribute('aria-checked', 'false'); });
  event.target.classList.add('active-state');
  event.target.setAttribute('aria-checked', 'true');
  if (state === 'idle') {
    form.innerHTML = '<input class="demo-form-input" placeholder="Your Name" value="John Doe" readonly>' +
      '<input class="demo-form-input" placeholder="Email" value="john@example.com" readonly>' +
      '<button class="demo-submit-btn" style="background:var(--color-primary-500)">Send Message →</button>';
  } else if (state === 'submitting') {
    form.innerHTML = '<input class="demo-form-input disabled" value="John Doe" readonly>' +
      '<input class="demo-form-input disabled" value="john@example.com" readonly>' +
      '<button class="demo-submit-btn" style="background:var(--color-primary-500);opacity:0.7"><span class="demo-spinner"></span> Sending...</button>';
  } else if (state === 'success') {
    form.innerHTML = '<div class="demo-success-msg">✓ Message Sent!</div><p style="text-align:center;color:var(--color-surface-500);font-size:0.85rem;margin-top:0.5rem">Thank you! I\'ll get back to you within 24 hours.</p>';
  } else {
    form.innerHTML = '<div class="demo-error-msg">⚠ Network error — failed to send message.</div>' +
      '<button class="demo-submit-btn" style="background:#ef4444;margin-top:0.75rem;cursor:pointer" onclick="showFormState(\'idle\')">Try Again</button>';
  }
}
showFormState('idle');
</script>
</div>

The form includes a honeypot field for spam prevention and the hidden `form-name` input that Netlify requires to detect forms during the build step.

## Deployment Pipeline

Every push to `main` triggers a GitHub Action that:

1. Checks out the code
2. Installs dependencies with `npm ci`
3. Builds the production bundle with `astro build`
4. Deploys to Netlify via the `nwtgck/actions-netlify@v3` action

The whole pipeline runs in under 30 seconds. The site is live at [awalakaushik.dev](https://awalakaushik.dev).

## What I Learned

Building with Astro taught me to think critically about what actually *needs* JavaScript. The answer? Far less than you'd think. A navbar with a mobile menu and dark mode toggle — yes. A footer with social links — no. A project card with hover animations — yes. A section heading — absolutely not.

This mindset shift — defaulting to static and opting into interactivity — is what makes Astro so powerful. And with Tailwind v4's CSS-first approach and seasonal theming, the site feels alive and personal without sacrificing performance.

If you're thinking about building your own portfolio, here's my advice: **start with content, not code**. Define your data structures first (schemas, markdown files), then build the UI around them. It's faster, it's more maintainable, and it forces you to think about what actually matters.
