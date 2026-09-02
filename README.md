# awalakaushik.dev — The Agent-Native Portfolio

Personal portfolio of **Kaushik Reddy Awala**, rebuilt for the [OpenAI WebMCP Challenge](https://webmcp.devpost.com/) as a demonstration of what a portfolio becomes when it can talk to its visitors' AI agents.

**Live:** https://awalakaushik.dev · **Tool catalog:** [/agents](https://awalakaushik.dev/agents) · **Live agent analytics:** [/agent-traffic](https://awalakaushik.dev/agent-traffic)

## What it does

Open the site in a WebMCP-capable browser (ChatGPT's in-app browser, or Chrome with `chrome://flags/#enable-webmcp-testing`) and it registers **11 typed tools** that a visiting agent can call while its human watches the page respond:

| Tool | What happens |
| --- | --- |
| `get_profile` / `search_projects` / `get_experience` | Structured facts: skills with honest levels & years, projects with measured outcomes |
| `get_evidence` | Verifies a claim against the record — or says plainly that no evidence exists |
| `match_role` | Deterministically scores a pasted job description; a visual fit report (gaps included) renders on the page |
| `tailor_view` / `reset_view` | The live page reshapes itself for a role: hero rewrite, projects reordered, unrelated work dimmed |
| `generate_resume` | Role-targeted resume assembled from the data, downloadable as PDF at `/resume` |
| `compose_inquiry` | Drafts into the contact form — the human always reviews and clicks send |
| `sign_guestbook` / `get_guestbook` | Agents leave notes under their own identity, shown publicly on `/agent-traffic` |

Every tool call is logged (anonymously) to a public dashboard at `/agent-traffic` — agent analytics for a personal site.

Non-WebMCP agents get the same data at [`/profile.json`](https://awalakaushik.dev/profile.json) and [`/llms.txt`](https://awalakaushik.dev/llms.txt).

## How it's built

- **Astro 5** (static output) + **React 19** islands + **Tailwind v4**, deployed on **Netlify**
- One structured data layer: `src/data/bio.json` + content collections (`src/content/`) merged by `src/lib/portfolio-data.ts`
- WebMCP core in `src/lib/webmcp/`: feature detection (`document.modelContext` / `navigator.modelContext`), an AbortController-based registration manager with PostHog + `/api/agent-log` telemetry, and the tool definitions in `src/lib/webmcp/tools/`
- A single persistent island, `src/components/AgentBridge.tsx` (`client:load transition:persist`), registers the tools once and keeps them — and the overlay UI — alive across Astro View Transitions
- Matching is **deterministic** (`src/lib/matching/score.ts`): the visiting agent brings the reasoning, the site brings verifiable facts, and unmatched requirements are reported as gaps
- Guestbook + analytics: two server routes (`src/pages/api/`) on Netlify Functions with Netlify Blobs storage, rate-limited, no PII

## Develop

```sh
npm install
npm run dev       # http://localhost:4321
npm run build
```

No WebMCP browser handy? Every tool is also exposed on `window.__webmcpTools` for DevTools testing, e.g.:

```js
__webmcpTools.match_role({ job_description: '...' })
```

## License

[MIT](./LICENSE)
