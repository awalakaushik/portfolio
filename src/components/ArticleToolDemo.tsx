import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import type { ToolDef } from '../lib/webmcp/types';

const topics = ['All', 'Angular', 'JavaScript'] as const;
type Topic = typeof topics[number];
const articles = [
    { title: 'Angular signals in practice', topic: 'Angular' },
    { title: 'Accessible Angular forms', topic: 'Angular' },
    { title: 'JavaScript module basics', topic: 'JavaScript' },
];
function validate(input: unknown): Topic {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Expected an object.');
    const value = input as Record<string, unknown>;
    if (Object.keys(value).some(key => key !== 'topic')) throw new Error('Only topic is supported.');
    if (value.topic === 'All' || value.topic === 'Angular' || value.topic === 'JavaScript') return value.topic;
    throw new Error('Choose All, Angular, or JavaScript.');
}

export default function ArticleToolDemo() {
    const [topic, setTopic] = useState<Topic>('All');
    const [selection, setSelection] = useState<Topic>('All');
    const [input, setInput] = useState('{ "topic": "Angular" }');
    const [output, setOutput] = useState('Choose an input and run the tool.');
    const [status, setStatus] = useState('Local simulator: no browser agent required.');
    const [registered, setRegistered] = useState(false);
    const [registering, setRegistering] = useState(false);
    const lifecycle = useRef<AbortController | null>(null);
    const mounted = useRef(true);
    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; lifecycle.current?.abort(); };
    }, []);

    const tool: ToolDef = {
        name: 'blog_demo_filter_articles',
        description: 'Filter only the WebMCP tutorial demo article list by topic. Does not change real blog content.',
        inputSchema: { type: 'object', properties: { topic: { type: 'string', enum: topics } }, required: ['topic'], additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        async execute(value: unknown) {
            if (!mounted.current) throw new Error('Demo is no longer active.');
            const next = validate(value);
            const matches = articles.filter(article => next === 'All' || article.topic === next);
            const result = JSON.stringify({ topic: next, count: matches.length, articles: matches }, null, 2);
            flushSync(() => { setTopic(next); setSelection(next); setOutput(result); });
            return result;
        },
    };
    const run = async (value: unknown) => {
        try { await tool.execute(value); }
        catch (error) { setOutput(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`); }
    };
    const register = async () => {
        if (!document.modelContext?.registerTool) { setStatus('This browser does not expose document.modelContext.registerTool. The local simulator still works.'); return; }
        setRegistering(true);
        const controller = new AbortController(); lifecycle.current?.abort(); lifecycle.current = controller;
        try {
            await document.modelContext.registerTool(tool, { signal: controller.signal });
            if (!mounted.current || controller.signal.aborted) return;
            setRegistered(true); setStatus('Registered blog_demo_filter_articles. A compatible browser agent can now call it.');
        } catch (error) {
            controller.abort();
            if (mounted.current) setStatus(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally { if (mounted.current) setRegistering(false); }
    };
    const buttonClass = 'px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 text-sm font-medium text-surface-800 dark:text-surface-100 hover:bg-primary-50 dark:hover:bg-surface-800 disabled:opacity-50';
    return (
        <section id="webmcp-demo" className="glass-card my-10 p-6 scroll-mt-24" aria-labelledby="webmcp-demo-title">
            <h2 id="webmcp-demo-title" className="text-xl font-semibold text-surface-900 dark:text-white">Try it: One action, two entry points</h2>
            <p className="mt-3 text-sm text-surface-600 dark:text-surface-300">Use the website filter or pass JSON arguments to the same handler. This simulator does not emulate browser-agent discovery.</p>
            <div className="mt-5 flex flex-wrap gap-3 items-end">
                <label className="text-sm text-surface-700 dark:text-surface-200">Website filter
                    <select id="demo-topic" value={selection} onChange={event => setSelection(event.target.value as Topic)} className="block mt-2 p-2 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-600">{topics.map(item => <option key={item}>{item}</option>)}</select>
                </label>
                <button id="demo-apply" type="button" className={buttonClass} onClick={() => { void run({ topic: selection }); }}>Apply filter</button>
            </div>
            <ul id="demo-articles" className="my-5 space-y-2 text-sm text-surface-700 dark:text-surface-200" aria-live="polite">{articles.filter(article => topic === 'All' || article.topic === topic).map(article => <li key={article.title}>{article.title} — {article.topic}</li>)}</ul>
            <label htmlFor="demo-input" className="block text-sm font-medium text-surface-700 dark:text-surface-200">Tool arguments (JSON)</label>
            <textarea id="demo-input" rows={3} spellCheck={false} value={input} onChange={event => setInput(event.target.value)} className="mt-2 w-full rounded-lg border border-surface-300 dark:border-surface-600 p-3 bg-surface-50 dark:bg-surface-950 text-surface-800 dark:text-surface-100 font-mono text-sm" />
            <div className="mt-3 flex flex-wrap gap-2">
                <button id="demo-run" type="button" className={buttonClass} onClick={() => { try { void run(JSON.parse(input)); } catch (error) { setOutput(`JSON error: ${error instanceof Error ? error.message : 'Unknown error'}`); } }}>Run simulated tool</button>
                <button id="demo-register" type="button" className={buttonClass} disabled={registered || registering} onClick={() => { void register(); }}>{registering ? 'Registering…' : 'Register browser tool'}</button>
                <button id="demo-reset" type="button" className={buttonClass} onClick={() => { lifecycle.current?.abort(); setRegistered(false); setTopic('All'); setSelection('All'); setOutput('Demo reset. Tool unregistered.'); setStatus('Local simulator: no browser agent required.'); }}>Reset and unregister</button>
            </div>
            <pre id="demo-output" className="mt-5 p-4 rounded-lg bg-surface-950 text-surface-100 font-mono text-xs overflow-auto max-h-72" aria-live="polite">{output}</pre>
            <p id="demo-status" role="status" className="mt-3 text-xs text-surface-600 dark:text-surface-300">{status}</p>
        </section>
    );
}
