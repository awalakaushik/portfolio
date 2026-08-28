import { useEffect, useState } from 'react';
import type { PortfolioData } from '../lib/portfolio-data';
import { buildResume, type ResumeSpec } from '../lib/resume/build';
import { readSession } from '../lib/stores';

interface Props {
    data: PortfolioData;
}

// Renders either the agent-tailored resume (from sessionStorage, written by
// the generate_resume WebMCP tool) or the default full resume. Print
// stylesheet in global.css turns the browser's print dialog into the PDF export.
export default function ResumeView({ data }: Props) {
    const [spec, setSpec] = useState<ResumeSpec | null>(null);

    useEffect(() => {
        setSpec(readSession<ResumeSpec>('resume') ?? buildResume(data));
    }, [data]);

    if (!spec) return null;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="no-print flex items-center justify-between gap-4 mb-6">
                <p className="text-sm text-surface-500 dark:text-surface-400">
                    {spec.roleTitle !== 'Software Engineer' ? (
                        <>
                            Tailored for <span className="font-semibold text-primary-600 dark:text-primary-400">{spec.roleTitle}</span> by an AI agent from{' '}
                            <a href="/agents" className="underline">structured portfolio data</a>.
                        </>
                    ) : (
                        <>Generated from this site's structured data — agents can tailor it via the <a href="/agents" className="underline">generate_resume tool</a>.</>
                    )}
                </p>
                <button
                    onClick={() => window.print()}
                    className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-all"
                >
                    Download PDF
                </button>
            </div>

            <article className="resume-sheet glass-card p-8 md:p-12 print:bg-white">
                <header className="border-b border-surface-200 dark:border-surface-700 pb-5 mb-6">
                    <h1 className="text-2xl font-bold text-surface-900 dark:text-white print:text-black">{spec.name}</h1>
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mt-1">{spec.roleTitle}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-2">
                        {spec.contact.email} · {spec.contact.location} · {spec.contact.website} · {spec.contact.github} · {spec.contact.linkedin}
                    </p>
                </header>

                <section className="mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500 mb-2">Summary</h2>
                    <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">{spec.summary}</p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500 mb-2">Skills</h2>
                    <div className="space-y-1">
                        {spec.skills.map((group) => (
                            <p key={group.category} className="text-sm text-surface-700 dark:text-surface-300">
                                <span className="font-semibold">{group.category}:</span> {group.items.join(', ')}
                            </p>
                        ))}
                    </div>
                </section>

                <section className="mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500 mb-3">Experience</h2>
                    <div className="space-y-5">
                        {spec.experience.map((e) => (
                            <div key={`${e.company}-${e.period}`}>
                                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                                    <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
                                        {e.role} · {e.company}
                                    </h3>
                                    <p className="text-xs text-surface-500 dark:text-surface-400">
                                        {e.period}
                                        {e.location ? ` · ${e.location}` : ''}
                                    </p>
                                </div>
                                <ul className="mt-1.5 space-y-1 list-disc list-inside">
                                    {e.highlights.map((h) => (
                                        <li key={h} className="text-sm text-surface-600 dark:text-surface-400">{h}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {spec.selectedProjects.length > 0 && (
                    <section className="mb-6">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500 mb-3">Selected Projects</h2>
                        <div className="space-y-3">
                            {spec.selectedProjects.map((p) => (
                                <div key={p.title}>
                                    <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
                                        {p.title}
                                        {p.company ? ` · ${p.company}` : ''}
                                    </h3>
                                    <p className="text-sm text-surface-600 dark:text-surface-400 mt-0.5">{p.line}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500 mb-2">Education</h2>
                        {spec.education.map((ed) => (
                            <p key={ed.school} className="text-sm text-surface-700 dark:text-surface-300">
                                {ed.degree}, {ed.school} ({ed.years})
                            </p>
                        ))}
                    </div>
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500 mb-2">Certifications</h2>
                        {spec.certifications.map((c) => (
                            <p key={c} className="text-sm text-surface-700 dark:text-surface-300">{c}</p>
                        ))}
                    </div>
                </section>
            </article>
        </div>
    );
}
