import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMotionDisabled } from '../lib/motion-preference';
import type { EmojiCue } from '../lib/voice/payload';
import type { LocalVoiceEngine, LocalCapabilities } from '../lib/voice/local';
import type { VoiceKnowledge } from '../lib/voice/context';
import manifest from '../data/voice.json';
import './PortfolioVoice.css';

type Turn = { role: 'user' | 'assistant'; content: string };
interface Recognition {
  lang: string; continuous: boolean; interimResults: boolean; processLocally?: boolean;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null; start(): void; abort(): void;
}
interface RecognitionConstructor { new (): Recognition; available?: (options: { langs: string[]; processLocally: boolean }) => Promise<string>; install?: (options: { langs: string[] }) => Promise<boolean> }
type SpeechWindow = Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
const cues: Record<EmojiCue, string> = { thumbsup: '👍', handshake: '🤝', lightbulb: '💡', briefcase: '💼', sparkle: '✨' };

export default function PortfolioVoice({ knowledge }: { knowledge: VoiceKnowledge }) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('Ready');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [audio, setAudio] = useState(true);
  const [capabilities, setCapabilities] = useState<LocalCapabilities>({ native: false, webgpu: false });
  const [checked, setChecked] = useState(false);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadChosen, setDownloadChosen] = useState(false);
  const engine = useRef<LocalVoiceEngine | null>(null);
  const [reaction, setReaction] = useState<{ type: EmojiCue; id: number } | null>(null);
  const recognition = useRef<Recognition | null>(null);
  const pending = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const lock = useRef(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const reducedMotion = useMotionDisabled();

  function stop() {
    generation.current += 1;
    recognition.current?.abort();
    pending.current?.abort();
    window.speechSynthesis?.cancel();
    if (loading && !ready) { engine.current?.dispose(); engine.current = null; setReady(false); }
    setLoading(false);
    lock.current = false;
    setListening(false); setBusy(false); setStatus('Ready');
  }
  function close() { stop(); setOpen(false); launcher.current?.focus(); }
  useEffect(() => {
    const w = window as SpeechWindow;
    const Constructor = w.SpeechRecognition || w.webkitSpeechRecognition;
    setSupported(Boolean(Constructor && 'processLocally' in Constructor.prototype && Constructor.available));
    let active = true;
    import('../lib/voice/local').then(module => module.localCapabilities()).then(result => { if (active) { setCapabilities(result); setChecked(true); } }).catch(() => { if (active) setChecked(true); });
    return () => { active = false; engine.current?.dispose(); generation.current += 1; recognition.current?.abort(); pending.current?.abort(); window.speechSynthesis?.cancel(); };
  }, []);
  useEffect(() => { if (open) field.current?.focus(); }, [open]);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }); }, [turns]);
  useEffect(() => {
    if (!reaction) return;
    const timer = window.setTimeout(() => setReaction(current => current?.id === reaction.id ? null : current), 2000);
    return () => window.clearTimeout(timer);
  }, [reaction]);

  async function initialize(mode: 'native' | 'webllm') {
    if (mode === 'webllm') setDownloadChosen(true);
    stop(); engine.current?.dispose(); engine.current = null; setReady(false);
    const ticket = generation.current;
    const controller = new AbortController(); pending.current = controller;
    setLoading(true); setError(''); setStatus('Preparing local AI');
    try {
      const { createLocalVoiceEngine } = await import('../lib/voice/local');
      const local = await createLocalVoiceEngine(mode, text => { if (ticket === generation.current) setStatus(text); }, controller.signal);
      if (ticket !== generation.current) { local.dispose(); return; }
      engine.current = local; setReady(true); setStatus('Ready · on-device AI');
    } catch { if (ticket === generation.current) { setError('Local AI could not load. Check browser support, storage, and your connection for the initial download.'); setStatus('Ready'); } }
    finally { if (ticket === generation.current) setLoading(false); }
  }

  async function ask(question: string) {
    if (!question.trim() || lock.current || !engine.current || !ready) return;
    stop();
    const ticket = generation.current;
    const next = [...turns, { role: 'user' as const, content: question.trim() }];
    setTurns(next); setInput(''); setError(''); setBusy(true); setStatus('Thinking'); lock.current = true;
    const controller = new AbortController(); pending.current = controller;
    try {
      const payload = await engine.current.answer(next.slice(-5), knowledge, controller.signal);
      if (ticket !== generation.current) return;
      setTurns([...next, { role: 'assistant', content: payload.spokenText }]);
      if (payload.emojiType && payload.emojiType in cues) setReaction({ type: payload.emojiType, id: Date.now() });
      if (audio && window.speechSynthesis) {
        setStatus('Speaking');
        const utterance = new SpeechSynthesisUtterance(payload.spokenText);
        const voice = window.speechSynthesis.getVoices().find(v => v.localService && v.lang.startsWith('en'));
        if (!voice) { setStatus('Ready'); setError('No offline English voice is available. You can read the answer above.'); return; }
        utterance.voice = voice; utterance.lang = voice.lang; utterance.rate = 1;
        utterance.onend = () => { if (ticket === generation.current) setStatus('Ready'); };
        utterance.onerror = () => { if (ticket === generation.current) { setStatus('Ready'); setError('Audio is unavailable. You can read the answer above.'); } };
        window.speechSynthesis.speak(utterance);
      } else setStatus('Ready');
    } catch (e) {
      if (ticket === generation.current && !controller.signal.aborted) { setError(e instanceof Error ? e.message : 'Please try again.'); setStatus('Ready'); }
    } finally { if (ticket === generation.current) { lock.current = false; setBusy(false); } }
  }
  async function listen() {
    stop(); setError('');
    const w = window as SpeechWindow;
    const Constructor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Constructor?.available || !Constructor.install) return;
    const ticket = generation.current;
    const controller = new AbortController(); pending.current = controller;
    try {
      setStatus('Checking offline speech');
      const availability = await Constructor.available({ langs: ['en-US'], processLocally: true });
      if (ticket !== generation.current) return;
      if (availability !== 'available') {
        if (availability === 'unavailable') throw new Error();
        setStatus('Downloading offline English speech pack'); setLoading(true);
        if (!await Constructor.install({ langs: ['en-US'] })) throw new Error();
      }
      if (ticket !== generation.current) return;
      setLoading(false);
    } catch { if (ticket === generation.current) { setLoading(false); setStatus('Ready'); setError('Offline microphone recognition is unavailable. Please type your question.'); } return; }
    const instance = new Constructor(); recognition.current = instance;
    instance.processLocally = true;
    instance.lang = 'en-US'; instance.continuous = false; instance.interimResults = false;
    instance.onresult = e => { if (ticket === generation.current) void ask(e.results[0][0].transcript); };
    instance.onerror = e => { if (ticket === generation.current) setError(e.error === 'not-allowed' ? 'Please allow microphone access, or type your question.' : 'I couldn’t hear that. Please try again or type your question.'); };
    instance.onend = () => { if (ticket === generation.current) { setListening(false); setStatus('Ready'); } };
    try { instance.start(); setListening(true); setStatus('Listening'); }
    catch { setError('Microphone is unavailable. Please type your question.'); }
  }

  return <div className="portfolio-voice">
    <button ref={launcher} type="button" className="voice-launcher" aria-expanded={open} aria-controls="portfolio-voice-panel" onClick={() => open ? close() : setOpen(true)}>Talk with my AI</button>
    {open && <section id="portfolio-voice-panel" className="voice-panel" aria-label="Kaushik’s AI portfolio representative" onKeyDown={e => { if (e.key === 'Escape') close(); }}>
      <div className="voice-heading"><strong>Let’s talk about my work</strong><button type="button" onClick={close} aria-label="Close conversation">×</button></div>
      <p className="voice-disclosure">Kaushik’s AI representative · synthetic voice</p>
      <p className="voice-disclosure">Answers run on your device. Your questions stay in this browser. Offline microphone input and a local English voice depend on browser support.</p>
      {!ready && <div className="voice-model-setup">
        {capabilities.webgpu && <p className="voice-disclosure">Optional downloaded model: {manifest.downloadNotice}</p>}
        {capabilities.native && <p className="voice-disclosure">Browser AI may need a large initial download. Your browser manages that model and its updates.</p>}
        {!checked && <p role="status">Checking local AI support…</p>}
        {capabilities.native && <button type="button" disabled={loading} onClick={() => void initialize('native')}>Use browser AI</button>}
        {capabilities.webgpu && <button type="button" disabled={loading} onClick={() => void initialize('webllm')}>Download local model</button>}
        {checked && !capabilities.native && !capabilities.webgpu && <p>This device cannot run local AI here. Explore my projects or contact me below.</p>}
      </div>}
      <div className="voice-transcript" ref={log} role="log" aria-live="polite" aria-relevant="additions">
        {!turns.length && <p>Hi! Ask about my projects, engineering background, or interests.</p>}
        {turns.map((turn, i) => <p className={`voice-turn voice-${turn.role}`} key={i}><span>{turn.role === 'user' ? 'You' : 'AI representative'}</span>{turn.content}</p>)}
      </div>
      <div className="voice-reactions" aria-hidden="true"><AnimatePresence>{reaction && <motion.span key={reaction.id} className="voice-particle" initial={reducedMotion ? false : { opacity: 0, y: 0, rotateY: 0, scale: .7 }} animate={reducedMotion ? { opacity: 1, y: 0, rotateY: 0, scale: 1 } : { opacity: [0, 1, 1, 0], y: -90, rotateY: 25, scale: 1.3 }} transition={{ duration: reducedMotion ? 0 : 2 }}>{cues[reaction.type]}</motion.span>}</AnimatePresence></div>
      <p role="status" className="voice-status">{status}</p>
      {error && <p role="alert" className="voice-error">{error}</p>}
      <form onSubmit={e => { e.preventDefault(); void ask(input); }} className="voice-form"><label htmlFor="voice-question" className="sr-only">Your portfolio question</label><input id="voice-question" ref={field} maxLength={600} value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about my work…" /><button type="submit" disabled={busy || loading || listening || !ready || !input.trim()}>Send</button></form>
      <div className="voice-controls">
        {supported && <button type="button" disabled={busy || loading || !ready} onClick={() => listening ? stop() : void listen()}>{listening ? 'Stop mic' : 'Start mic'}</button>}
        <button type="button" onClick={stop}>Stop</button>
        <button type="button" aria-pressed={audio} onClick={() => { window.speechSynthesis?.cancel(); setAudio(!audio); setStatus('Ready'); }}>{audio ? 'Mute voice' : 'Enable voice'}</button>
        <button type="button" onClick={() => { stop(); setTurns([]); setError(''); }}>Reset</button>
      </div>
      {!supported && <p className="voice-disclosure">Offline microphone input is unavailable here. Type your question; spoken answers need a local English voice.</p>}
      {downloadChosen && <button type="button" className="voice-clear" disabled={busy || loading} onClick={() => {
        stop(); engine.current?.dispose(); engine.current = null; setReady(false);
        void import('../lib/voice/local').then(m => m.clearDownloadedVoiceModel()).then(() => setStatus('Downloaded model removed')).catch(() => setError('Could not clear the downloaded model. Use browser site-storage settings.'));
      }}>Remove downloaded model</button>}
      <nav className="voice-links" aria-label="Explore portfolio"><a href="/projects" onClick={close}>Projects</a><a href="/contact" onClick={close}>Get in touch</a></nav>
    </section>}
  </div>;
}
