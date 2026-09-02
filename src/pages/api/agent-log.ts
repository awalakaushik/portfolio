import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';
import { TOOL_NAMES } from '../../lib/webmcp/tool-names';

export const prerender = false;

// Aggregate, anonymous tool-call stats feeding the public /agent-traffic
// dashboard. Read-modify-write races are acceptable at this traffic level —
// the numbers are illustrative, not billing.

interface Stats {
    totalCalls: number;
    toolCounts: Record<string, { count: number; errors: number; lastCalled: number }>;
    byDay: Record<string, number>;
}

const EMPTY: Stats = { totalCalls: 0, toolCounts: {}, byDay: {} };

function jsonResponse(body: unknown, status = 200, cache = false): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...(cache ? { 'Cache-Control': 'public, max-age=30' } : {}),
        },
    });
}

export const GET: APIRoute = async () => {
    try {
        const store = getStore('agent-data');
        const stats = ((await store.get('stats/tool-counts.json', { type: 'json' })) as Stats | null) ?? EMPTY;
        const recent =
            ((await store.get('stats/recent.json', { type: 'json' })) as { tool: string; ok: boolean; ts: number }[] | null) ?? [];
        // Fixed-key get, not list() — see /api/guestbook for why (eventual
        // consistency on list() delayed new entries showing up by ~40s).
        const guestbookEntries =
            ((await store.get('guestbook/index.json', { type: 'json' })) as unknown[] | null) ?? [];
        return jsonResponse({ ...stats, recent, guestbookCount: guestbookEntries.length }, 200, true);
    } catch {
        return jsonResponse({ ...EMPTY, recent: [], guestbookCount: 0, note: 'storage unavailable' }, 200);
    }
};

export const POST: APIRoute = async ({ request }) => {
    let body: { tool?: string; ok?: boolean; ms?: number };
    try {
        const raw = await request.text();
        if (raw.length > 1024) return jsonResponse({ error: 'Body too large' }, 413);
        body = JSON.parse(raw);
    } catch {
        return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const tool = String(body.tool ?? '');
    if (!(TOOL_NAMES as readonly string[]).includes(tool)) {
        return jsonResponse({ error: 'Unknown tool' }, 400);
    }
    const ok = body.ok !== false;

    try {
        const store = getStore('agent-data');
        const stats = ((await store.get('stats/tool-counts.json', { type: 'json' })) as Stats | null) ?? structuredClone(EMPTY);
        const day = new Date().toISOString().slice(0, 10);
        const entry = stats.toolCounts[tool] ?? { count: 0, errors: 0, lastCalled: 0 };
        entry.count += 1;
        if (!ok) entry.errors += 1;
        entry.lastCalled = Date.now();
        stats.toolCounts[tool] = entry;
        stats.totalCalls += 1;
        stats.byDay[day] = (stats.byDay[day] ?? 0) + 1;
        await store.setJSON('stats/tool-counts.json', stats);

        const recent =
            ((await store.get('stats/recent.json', { type: 'json' })) as { tool: string; ok: boolean; ts: number }[] | null) ?? [];
        recent.unshift({ tool, ok, ts: Date.now() });
        await store.setJSON('stats/recent.json', recent.slice(0, 100));

        return jsonResponse({ ok: true });
    } catch {
        // Local dev without netlify dev — accept silently so tools still work
        return jsonResponse({ ok: true, note: 'storage unavailable' });
    }
};
