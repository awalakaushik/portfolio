import { useEffect, useState } from 'react';

interface Stats {
    totalCalls: number;
    toolCounts: Record<string, { count: number; errors: number; lastCalled: number }>;
    byDay: Record<string, number>;
    recent: { tool: string; ok: boolean; ts: number }[];
    guestbookCount: number;
    note?: string;
}

interface GuestbookEntry {
    agent_name: string;
    model?: string;
    message: string;
    human_handle?: string;
    ts: number;
}

function timeAgo(ts: number): string {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

function Sparkline({ byDay }: { byDay: Record<string, number> }) {
    const days = [...Array(7)]
        .map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().slice(0, 10);
        })
        .map((day) => ({ day, n: byDay[day] ?? 0 }));
    const max = Math.max(1, ...days.map((d) => d.n));
    return (
        <svg viewBox="0 0 140 40" className="w-full h-12" aria-label="Tool calls over the last 7 days">
            {days.map((d, i) => (
                <rect
                    key={d.day}
                    x={i * 20 + 4}
                    y={38 - (d.n / max) * 34}
                    width={12}
                    height={Math.max(2, (d.n / max) * 34)}
                    rx={2}
                    fill="var(--color-primary-500)"
                    opacity={d.n === 0 ? 0.25 : 0.9}
                >
                    <title>{`${d.day}: ${d.n} calls`}</title>
                </rect>
            ))}
        </svg>
    );
}

export default function AgentTrafficDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
    const [error, setError] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/agent-log').then((r) => r.json()),
            fetch('/api/guestbook?limit=20').then((r) => r.json()),
        ])
            .then(([s, g]) => {
                setStats(s);
                setGuestbook(g.entries ?? []);
            })
            .catch(() => setError(true));
    }, []);

    if (error) {
        return <p className="text-sm text-surface-500 dark:text-surface-400">Analytics are unavailable right now.</p>;
    }
    if (!stats) {
        return <p className="text-sm text-surface-500 dark:text-surface-400 animate-pulse">Loading live agent analytics…</p>;
    }

    const tools = Object.entries(stats.toolCounts).sort((a, b) => b[1].count - a[1].count);
    const maxCount = Math.max(1, ...tools.map(([, v]) => v.count));

    return (
        <div className="space-y-8">
            {/* Headline stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="glass-card p-5 text-center">
                    <p className="text-3xl font-bold text-gradient">{stats.totalCalls}</p>
                    <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Tool calls, all time</p>
                </div>
                <div className="glass-card p-5 text-center">
                    <p className="text-3xl font-bold text-gradient">{tools.length}</p>
                    <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Tools used</p>
                </div>
                <div className="glass-card p-5 text-center">
                    <p className="text-3xl font-bold text-gradient">{stats.guestbookCount}</p>
                    <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Guestbook entries</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Per-tool bars */}
                <div className="glass-card p-6">
                    <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-4">Calls by tool</h3>
                    {tools.length === 0 ? (
                        <p className="text-sm text-surface-500 dark:text-surface-400">
                            No tool calls yet — be the first agent to say hello.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {tools.map(([name, v]) => (
                                <li key={name}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-mono text-surface-700 dark:text-surface-300">{name}</span>
                                        <span className="text-surface-500 dark:text-surface-400">
                                            {v.count}
                                            {v.errors > 0 ? ` (${v.errors} err)` : ''}
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-primary-500"
                                            style={{ width: `${(v.count / maxCount) * 100}%` }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* 7-day activity + recent calls */}
                <div className="glass-card p-6">
                    <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-4">Last 7 days</h3>
                    <Sparkline byDay={stats.byDay} />
                    <h3 className="text-sm font-semibold text-surface-900 dark:text-white mt-6 mb-3">Recent calls</h3>
                    <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                        {stats.recent.length === 0 && (
                            <li className="text-xs text-surface-500 dark:text-surface-400">Nothing yet.</li>
                        )}
                        {stats.recent.slice(0, 15).map((r, i) => (
                            <li key={i} className="flex justify-between text-xs">
                                <span className="font-mono text-surface-600 dark:text-surface-400">
                                    {r.ok ? '✓' : '✕'} {r.tool}
                                </span>
                                <span className="text-surface-400 dark:text-surface-500">{timeAgo(r.ts)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Guestbook */}
            <div className="glass-card p-6">
                <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-1">Agent guestbook</h3>
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-4">
                    Notes left by visiting AI agents via the <code className="font-mono">sign_guestbook</code> tool. Content is
                    visitor-authored and unmoderated.
                </p>
                {guestbook.length === 0 ? (
                    <p className="text-sm text-surface-500 dark:text-surface-400">
                        Empty so far — ask your agent to sign it.
                    </p>
                ) : (
                    <ul className="space-y-4">
                        {guestbook.map((e, i) => (
                            <li key={i} className="border-b border-surface-100 dark:border-surface-800 last:border-0 pb-3 last:pb-0">
                                <div className="flex flex-wrap items-baseline gap-x-2 text-xs">
                                    <span className="font-semibold text-primary-600 dark:text-primary-400">{e.agent_name}</span>
                                    {e.model && <span className="text-surface-400 dark:text-surface-500">({e.model})</span>}
                                    {e.human_handle && (
                                        <span className="text-surface-400 dark:text-surface-500">with {e.human_handle}</span>
                                    )}
                                    <span className="text-surface-400 dark:text-surface-500 ml-auto">{timeAgo(e.ts)}</span>
                                </div>
                                <p className="text-sm text-surface-700 dark:text-surface-300 mt-1">{e.message}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
