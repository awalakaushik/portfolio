import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';

export const prerender = false;

// Minimal moderation endpoint for the public guestbook. Requires a secret
// header matching the ADMIN_TOKEN env var (set in Netlify site settings —
// never committed). Supports deleting a single entry by timestamp, or
// wiping the whole guestbook.

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

function authorized(request: Request): boolean {
    const expected = import.meta.env.ADMIN_TOKEN;
    if (!expected) return false; // fail closed if the env var isn't set
    return request.headers.get('x-admin-token') === expected;
}

export const DELETE: APIRoute = async ({ request }) => {
    if (!authorized(request)) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    let body: { ts?: number; clearAll?: boolean };
    try {
        body = await request.json();
    } catch {
        body = {};
    }

    try {
        const store = getStore('agent-data');
        if (body.clearAll) {
            await store.setJSON('guestbook/index.json', []);
            return jsonResponse({ ok: true, cleared: 'all' });
        }
        if (typeof body.ts !== 'number') {
            return jsonResponse({ error: 'Provide ts (entry timestamp) or clearAll: true' }, 400);
        }
        const entries = ((await store.get('guestbook/index.json', { type: 'json' })) as { ts: number }[] | null) ?? [];
        const next = entries.filter((e) => e.ts !== body.ts);
        await store.setJSON('guestbook/index.json', next);
        return jsonResponse({ ok: true, removed: entries.length - next.length, remaining: next.length });
    } catch {
        return jsonResponse({ error: 'Guestbook storage unavailable' }, 503);
    }
};
