import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import { getModelContext } from '../lib/webmcp/context';
import type { ToolDef } from '../lib/webmcp/types';
import './EngineeringCore.css';

type View = 'front' | 'architecture' | 'stack';
const views: Record<View, { x: number; y: number }> = {
    front: { x: -16, y: 28 }, architecture: { x: -30, y: 118 }, stack: { x: 22, y: -58 },
};

export default function EngineeringCore() {
    const [view, setView] = useState<View>('front');
    const [playing, setPlaying] = useState(false);
    const [reduced, setReduced] = useState(false);
    const [visible, setVisible] = useState(true);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const root = useRef<HTMLElement>(null);
    const preference = useRef(false);

    useEffect(() => {
        const media = matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => { preference.current = media.matches; setReduced(media.matches); if (media.matches) setPlaying(false); };
        update(); media.addEventListener('change', update);
        const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
        if (root.current) observer.observe(root.current);
        const visibility = () => setVisible(!document.hidden && Boolean(root.current?.getBoundingClientRect().bottom && root.current.getBoundingClientRect().top < innerHeight && root.current.getBoundingClientRect().bottom > 0));
        document.addEventListener('visibilitychange', visibility);
        return () => { observer.disconnect(); media.removeEventListener('change', update); document.removeEventListener('visibilitychange', visibility); };
    }, []);

    useEffect(() => {
        const found = getModelContext();
        if (!found?.ctx.registerTool) return;
        const lifecycle = new AbortController();
        const tool: ToolDef = {
            name: 'set_portfolio_visual',
            description: 'Set the homepage 3D illustration orientation and motion. Changes presentation only, not portfolio content. Available on the homepage.',
            inputSchema: { type: 'object', properties: { view: { type: 'string', enum: ['front', 'architecture', 'stack'] }, animate: { type: 'boolean' } }, required: ['view'], additionalProperties: false },
            annotations: { readOnlyHint: false },
            async execute(input: unknown) {
                if (lifecycle.signal.aborted) throw new Error('Homepage visual is no longer active.');
                if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Expected an object.');
                const value = input as Record<string, unknown>;
                if (Object.keys(value).some(key => key !== 'view' && key !== 'animate')) throw new Error('Only view and animate are supported.');
                if (value.view !== 'front' && value.view !== 'architecture' && value.view !== 'stack') throw new Error('Choose front, architecture, or stack.');
                if (value.animate !== undefined && typeof value.animate !== 'boolean') throw new Error('animate must be boolean.');
                const nextView = value.view;
                const animate = value.animate === true && !preference.current;
                flushSync(() => { setView(nextView); setPlaying(animate); setTilt({ x: 0, y: 0 }); });
                return JSON.stringify({ view: nextView, animate, reducedMotion: preference.current });
            },
        };
        try { void Promise.resolve(found.ctx.registerTool(tool, { signal: lifecycle.signal })).catch(error => console.warn('Visual tool registration failed', error)); }
        catch (error) { console.warn('Visual tool registration failed', error); }
        return () => lifecycle.abort();
    }, []);

    const angle = views[view];
    const style = { '--core-x': `${angle.x + tilt.x}deg`, '--core-y': `${angle.y + tilt.y}deg` } as CSSProperties;
    return (
        <section ref={root} className="engineering-core" aria-label="Interactive 3D engineering illustration" data-view={view} data-playing={playing && visible && !reduced} style={style}>
            <div className="core-caption"><span className="core-dot" /> Interactive engineering core <span className="core-index">0{Object.keys(views).indexOf(view) + 1} / 03</span></div>
            <div className="core-stage" onPointerMove={event => {
                if (reduced || event.pointerType !== 'mouse') return;
                const bounds = event.currentTarget.getBoundingClientRect();
                setTilt({ x: -(event.clientY - bounds.top - bounds.height / 2) / 24, y: (event.clientX - bounds.left - bounds.width / 2) / 24 });
            }} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
                <div className="core-grid" aria-hidden="true" />
                <div className="core-orbit core-orbit-one" aria-hidden="true" />
                <div className="core-orbit core-orbit-two" aria-hidden="true" />
                <div className="core-position" aria-hidden="true"><div className="core-spin"><div className="core-cube">
                    {['front', 'back', 'left', 'right', 'top', 'bottom'].map((face, i) => <div key={face} className={`core-face core-face-${face}`}><span className="core-face-number">0{i + 1}</span><span className="core-glyph">{i % 2 ? '{ }' : '</>'}</span><span className="core-trace" /></div>)}
                </div></div></div>
                <a className="core-node core-node-one" href="/projects">Projects <span>↗</span></a>
                <a className="core-node core-node-two" href="/about">Experience <span>↗</span></a>
                <a className="core-node core-node-three" href="/agents">Agent interface <span>↗</span></a>
            </div>
            <div className="core-controls" role="group" aria-label="3D view controls">
                {(Object.keys(views) as View[]).map(option => <button type="button" key={option} aria-pressed={view === option} onClick={() => { setView(option); setTilt({ x: 0, y: 0 }); }}>{option}</button>)}
                <button type="button" aria-pressed={playing} disabled={reduced} onClick={() => setPlaying(value => !value)}>{playing ? 'Pause motion' : 'Play motion'}</button>
            </div>
            <p className="core-help" role="status">{reduced ? 'Reduced motion: static view.' : `View: ${view}. Motion ${playing ? 'on' : 'off'}.`} Use the buttons or move your pointer to explore.</p>
        </section>
    );
}
