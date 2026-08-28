import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import type { PortfolioData } from '../lib/portfolio-data';
import { buildTools } from '../lib/webmcp/tools';
import { registerAll, unregisterAll } from '../lib/webmcp/register';
import { applyTailor } from '../lib/webmcp/apply-tailor';
import { $fitReport, $tailor, $resumeSpec, initStoresFromSession } from '../lib/stores';

interface Props {
    data: PortfolioData;
}

// The WebMCP heart of the site. Mounted once in BaseLayout with
// transition:persist, so tool registration and these overlays survive
// View Transitions. Everything an agent changes on the page is visible to
// the human through the overlays rendered here.
export default function AgentBridge({ data }: Props) {
    const fitReport = useStore($fitReport);
    const tailor = useStore($tailor);
    const resumeSpec = useStore($resumeSpec);
    const [fitDismissed, setFitDismissed] = useState(false);
    const [resumeDismissed, setResumeDismissed] = useState(false);

    useEffect(() => {
        initStoresFromSession();
        registerAll(buildTools(data));
        // Re-apply DOM tailoring after every View Transition swap (fresh HTML)
        // and on initial load — astro:page-load covers both.
        const reapply = () => applyTailor($tailor.get());
        document.addEventListener('astro:page-load', reapply);
        return () => {
            document.removeEventListener('astro:page-load', reapply);
            unregisterAll();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (fitReport) setFitDismissed(false);
    }, [fitReport]);
    useEffect(() => {
        if (resumeSpec) setResumeDismissed(false);
    }, [resumeSpec]);

    return (
        <>
            {/* Tailored-view banner */}
            {tailor && (
                <div className="fixed top-16 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-primary-500/30 bg-white/90 dark:bg-surface-900/90 backdrop-blur-md px-4 py-2 shadow-lg shadow-primary-500/10">
                        <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
                        <span className="text-xs font-medium text-surface-700 dark:text-surface-300">
                            Viewing as: <span className="text-primary-600 dark:text-primary-400">{tailor.roleTitle}</span> — tailored by an AI agent
                        </span>
                        <button
                            onClick={() => {
                                $tailor.set(null);
                                applyTailor(null);
                            }}
                            className="text-xs font-semibold text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            )}

            {/* Fit report panel */}
            {fitReport && !fitDismissed && (
                <aside className="fixed bottom-4 right-4 z-50 w-[min(24rem,calc(100vw-2rem))] max-h-[70vh] overflow-y-auto glass-card p-5 shadow-2xl shadow-primary-500/10">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-surface-400 dark:text-surface-500 font-semibold">
                                Fit report
                            </p>
                            <h3 className="text-sm font-semibold text-surface-900 dark:text-white mt-0.5">
                                {fitReport.roleTitle}
                            </h3>
                        </div>
                        <button
                            onClick={() => setFitDismissed(true)}
                            aria-label="Dismiss fit report"
                            className="text-surface-400 hover:text-surface-900 dark:hover:text-white text-lg leading-none"
                        >
                            ×
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                        <div
                            className="relative w-16 h-16 rounded-full grid place-items-center"
                            style={{
                                background: `conic-gradient(var(--color-primary-500) ${fitReport.score * 3.6}deg, color-mix(in srgb, var(--color-surface-400) 25%, transparent) 0deg)`,
                            }}
                        >
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-surface-900 grid place-items-center">
                                <span className="text-sm font-bold text-surface-900 dark:text-white">{fitReport.score}</span>
                            </div>
                        </div>
                        <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed flex-1">
                            {fitReport.verdict}
                        </p>
                    </div>

                    {fitReport.matched.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 mb-2">
                                Matched skills
                            </p>
                            <ul className="space-y-2">
                                {fitReport.matched.slice(0, 6).map((m) => (
                                    <li key={m.skill} className="text-xs">
                                        <span className="font-medium text-surface-900 dark:text-white">{m.skill}</span>
                                        <span className="text-surface-500 dark:text-surface-400">
                                            {' '}— {m.level}, {m.years} yr{m.years === 1 ? '' : 's'}
                                        </span>
                                        {m.evidence[0] && (
                                            <p className="text-surface-400 dark:text-surface-500 mt-0.5">
                                                {m.evidence[0].source}: {m.evidence[0].detail}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {fitReport.gaps.length > 0 && (
                        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                                Honest gaps
                            </p>
                            <ul className="space-y-1">
                                {fitReport.gaps.map((g) => (
                                    <li key={g.requirement} className="text-xs text-surface-600 dark:text-surface-400">
                                        <span className="font-medium">{g.requirement}</span> — no claimed experience
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </aside>
            )}

            {/* Resume-ready toast */}
            {resumeSpec && !resumeDismissed && (
                <div className="fixed bottom-4 left-4 z-50 glass-card p-4 w-[min(20rem,calc(100vw-2rem))] shadow-2xl">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium text-surface-700 dark:text-surface-300">
                            Resume tailored for{' '}
                            <span className="text-primary-600 dark:text-primary-400">{resumeSpec.roleTitle}</span> is ready.
                        </p>
                        <button
                            onClick={() => setResumeDismissed(true)}
                            aria-label="Dismiss resume notice"
                            className="text-surface-400 hover:text-surface-900 dark:hover:text-white text-lg leading-none"
                        >
                            ×
                        </button>
                    </div>
                    <a
                        href="/resume"
                        className="inline-flex mt-2 items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                    >
                        View &amp; download PDF →
                    </a>
                </div>
            )}
        </>
    );
}
