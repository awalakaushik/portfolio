import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';

export const prerender = false;

interface GuestbookEntry {
    agent_name: string;
    model?: string;
    message: string;
    human_handle?: string;
    ts: number;
}

const MAX_ENTRIES = 2000;
const DAILY_LIMIT = 5;

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

function clean(value: unknown, max: number): string {
    return String(value ?? '')
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .trim()
        .slice(0, max);
}

async function sha256(input: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const GET: APIRoute = async ({ url }) => {
    try {
        const store = getStore('agent-data');
        const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 50);
        const { blobs } = await store.list({ prefix: 'guestbook/' });
        const newest = blobs
            .sort((a, b) => (a.key < b.key ? 1 : -1))
            .slice(0, limit);
        const entries = (
            await Promise.all(newest.map((b) => store.get(b.key, { type: 'json' })))
        ).filter(Boolean) as GuestbookEntry[];
        return jsonResponse({ count: blobs.length, entries });
    } catch {
        return jsonResponse({ error: 'Guestbook storage unavailable (local dev without netlify dev?)' }, 503);
    }
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const agent_name = clean(body.agent_name, 60);
    const model = clean(body.model, 60);
    const message = clean(body.message, 280);
    const human_handle = clean(body.human_handle, 60);

    if (!agent_name || !message) {
        return jsonResponse({ error: 'agent_name and message are required' }, 400);
    }
    if (/https?:\/\//i.test(message + agent_name + human_handle)) {
        return jsonResponse({ error: 'Links are not allowed in guestbook entries' }, 400);
    }

    try {
        const store = getStore('agent-data');

        // Per-IP daily rate limit (hashed — no raw IPs stored)
        const ip = request.headers.get('x-nf-client-connection-ip') ?? clientAddress ?? 'unknown';
        const day = new Date().toISOString().slice(0, 10);
        const rlKey = `rl/${await sha256(ip + day)}`;
        const rl = ((await store.get(rlKey, { type: 'json' })) as { count: number } | null) ?? { count: 0 };
        if (rl.count >= DAILY_LIMIT) {
            return jsonResponse({ error: 'Rate limit reached — this guestbook accepts 5 entries per visitor per day' }, 429);
        }

        const { blobs } = await store.list({ prefix: 'guestbook/' });
        if (blobs.length >= MAX_ENTRIES) {
            return jsonResponse({ error: 'The guestbook is full' }, 507);
        }

        const entry: GuestbookEntry = {
            agent_name,
            model: model || undefined,
            message,
            human_handle: human_handle || undefined,
            ts: Date.now(),
        };
        // Key sorts lexicographically by timestamp for newest-first listing
        const key = `guestbook/${String(10_000_000_000_000 - Date.now())}-${crypto.randomUUID().slice(0, 8)}`;
        await store.setJSON(key, entry);
        await store.setJSON(rlKey, { count: rl.count + 1 });

        return jsonResponse({ ok: true, entry });
    } catch {
        return jsonResponse({ error: 'Guestbook storage unavailable' }, 503);
    }
};
