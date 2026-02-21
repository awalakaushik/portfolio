---
name: Contact Me
description: Contact page and form rules — fields, Netlify Forms integration, social links, and submission UX
---

# Contact Me Consistency

This skill defines the rules for the contact page, form submission, and all contact-related information.

## Form Component

The contact form is a React component at `src/components/ContactForm.tsx`, rendered with `client:load` in `src/pages/contact.astro`.

### Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Name | text | ✅ | Required |
| Email | email | ✅ | Required, valid email |
| Company | text | ❌ | Optional |
| Message | textarea | ✅ | Required |

### Netlify Forms Integration

The form uses Netlify Forms with fetch-based submission:
- `data-netlify="true"` attribute on the `<form>` element
- Hidden `form-name` input with value `"contact"`
- Honeypot field (`bot-field`) for spam prevention
- Submissions go to the Netlify dashboard under Forms

**Important**: The form submits via `fetch()` with `Content-Type: application/x-www-form-urlencoded`. It does NOT do a full page POST.

### Form States

The component manages 4 states:

| State | UI Behavior |
|-------|-------------|
| `idle` | Normal form, all inputs enabled |
| `submitting` | Inputs disabled, button shows spinner + "Sending..." |
| `success` | Form replaced with checkmark + "Message Sent!" + "Send another" link |
| `error` | Red error banner shown below message field, form still usable |

### Styling Rules

All form inputs must use this class pattern:
```
w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700
bg-white dark:bg-surface-900/50 text-surface-900 dark:text-white
placeholder-surface-400 dark:placeholder-surface-600
focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
outline-none transition-all
```

Add `disabled:opacity-50` for the submitting state.

## Contact Information

All contact details must match `src/data/bio.json`:

| Channel | Value |
|---------|-------|
| Email | `reach@awalakaushik.dev` |
| GitHub | `github.com/awalakaushik` |
| LinkedIn | `linkedin.com/in/akaushikr` |
| X / Twitter | `x.com/akaushikr` |

### Social Link Display Pattern

Each social link in the sidebar uses this structure:
```astro
<a href="URL" target="_blank" rel="noopener noreferrer"
   class="flex items-center gap-3 text-surface-600 dark:text-surface-400
          hover:text-primary-600 dark:hover:text-primary-400 transition-colors group">
  <div class="p-2 rounded-lg bg-surface-100 dark:bg-surface-800
              group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10">
    <!-- SVG icon -->
  </div>
  <div>
    <p class="text-sm font-medium">Platform Name</p>
    <p class="text-xs text-surface-400 dark:text-surface-500">@handle</p>
  </div>
</a>
```

## When Modifying

- Never add fields to the form without updating the Netlify form name or creating a new form
- Keep field `name` attributes stable — changing them breaks Netlify form detection
- Test form submission on Netlify (not locally) since form processing requires Netlify's build step
- Always include `form-name` hidden input and honeypot field
