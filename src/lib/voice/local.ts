import type { WebWorkerMLCEngine } from '@mlc-ai/web-llm';
import manifest from '../../data/voice.json';
import { buildSystemPrompt } from './policy';
import { FALLBACK } from './policy';
import { parseVoiceResponse, type VoicePayload } from './payload';
import { selectVoiceContext, type VoiceKnowledge } from './context';

export type VoiceTurn = { role: 'user' | 'assistant'; content: string };
const languages = { expectedInputs: [{ type: 'text', languages: ['en'] }], expectedOutputs: [{ type: 'text', languages: ['en'] }] };
interface NativeSession { prompt(input: VoiceTurn[], options: { signal: AbortSignal }): Promise<string>; destroy(): void }
interface NativeModel {
  availability(options: unknown): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
  create(options: unknown): Promise<NativeSession>;
}
function nativeModel(): NativeModel | undefined { return (globalThis as unknown as { LanguageModel?: NativeModel }).LanguageModel; }
export interface LocalCapabilities { native: boolean; webgpu: boolean }
export async function localCapabilities(): Promise<LocalCapabilities> {
  let native = false;
  try { native = Boolean(nativeModel() && await nativeModel()!.availability(languages) !== 'unavailable'); } catch { /* unsupported hardware */ }
  return { native, webgpu: Boolean((navigator as Navigator & { gpu?: unknown }).gpu) };
}
export interface LocalVoiceEngine {
  answer(turns: VoiceTurn[], knowledge: VoiceKnowledge, signal: AbortSignal): Promise<VoicePayload>;
  dispose(): void;
}
export function validateLocalAnswer(raw: string): VoicePayload {
  const payload = parseVoiceResponse(raw);
  const sentences = payload.spokenText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  if (!payload.spokenText || sentences.length > 3 || payload.spokenText.length > 700) return parseVoiceResponse(FALLBACK);
  return payload;
}
function prompts(turns: VoiceTurn[], knowledge: VoiceKnowledge) {
  const history = turns.slice(-5).map(t => ({ ...t, content: t.content.slice(0, 600) }));
  const query = [...history].reverse().filter(t => t.role === 'user').map(t => t.content).join(' ');
  return { system: buildSystemPrompt(selectVoiceContext(knowledge, query)), history };
}

export async function createLocalVoiceEngine(mode: 'native' | 'webllm', progress: (text: string) => void, signal: AbortSignal): Promise<LocalVoiceEngine> {
  if (mode === 'native') {
    const api = nativeModel();
    if (!api) throw new Error('Browser AI is unavailable. Try the downloadable model.');
    // Called only from the explicit user click: downloading requires user activation.
    const warm = await api.create({ ...languages, signal, monitor: (monitor: EventTarget) => {
      monitor.addEventListener('downloadprogress', event => progress(`Downloading browser AI: ${Math.round((event as Event & { loaded: number }).loaded * 100)}%`));
    } });
    warm.destroy();
    let session: NativeSession | null = null;
    return {
      async answer(turns, knowledge, requestSignal) {
        const { system, history } = prompts(turns, knowledge);
        session = await api.create({ ...languages, signal: requestSignal, initialPrompts: [{ role: 'system', content: system }] });
        const active = session;
        try { return validateLocalAnswer(await active.prompt(history, { signal: requestSignal })); }
        finally { active.destroy(); if (session === active) session = null; }
      },
      dispose() { session?.destroy(); session = null; },
    };
  }
  const webllm = await import('@mlc-ai/web-llm');
  signal.throwIfAborted();
  const record = webllm.prebuiltAppConfig.model_list.find(m => m.model_id === manifest.modelId);
  if (!record) throw new Error('Local model configuration is unavailable.');
  const model = { ...record, model: `${record.model}/resolve/${manifest.modelRevision}/` };
  const appConfig = { model_list: [model], cacheBackend: 'cache' as const };
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const abort = () => worker.terminate();
  signal.addEventListener('abort', abort, { once: true });
  let engine: WebWorkerMLCEngine;
  try {
    engine = await Promise.race([
      webllm.CreateWebWorkerMLCEngine(worker, manifest.modelId, { appConfig, initProgressCallback: report => progress(report.text) }, { context_window_size: 4096 }),
      new Promise<never>((_, reject) => signal.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true })),
    ]);
  } catch (error) { worker.terminate(); throw error; }
  finally { signal.removeEventListener('abort', abort); }
  let queue: Promise<unknown> = Promise.resolve();
  return {
    answer(turns, knowledge, requestSignal) {
      const task = queue.then(async () => {
      requestSignal.throwIfAborted();
      const { system, history } = prompts(turns, knowledge);
      const cancel = () => engine.interruptGenerate();
      requestSignal.addEventListener('abort', cancel, { once: true });
      try {
        const completion = await engine.chat.completions.create({
          messages: [{ role: 'system', content: system }, ...history], max_tokens: 160, temperature: .2,
        });
        requestSignal.throwIfAborted();
        return validateLocalAnswer(completion.choices[0]?.message.content || '');
      } finally { requestSignal.removeEventListener('abort', cancel); }
      });
      queue = task.catch(() => undefined);
      return task;
    },
    dispose() { worker.terminate(); },
  };
}

export async function clearDownloadedVoiceModel(): Promise<void> {
  const webllm = await import('@mlc-ai/web-llm');
  const record = webllm.prebuiltAppConfig.model_list.find(m => m.model_id === manifest.modelId);
  if (!record) return;
  await webllm.deleteModelAllInfoInCache(manifest.modelId, { cacheBackend: 'cache', model_list: [{ ...record, model: `${record.model}/resolve/${manifest.modelRevision}/` }] });
}
