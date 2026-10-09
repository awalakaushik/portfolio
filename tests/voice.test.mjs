import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Execute the actual TypeScript helpers without adding a test-runner dependency.
async function load(path) {
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}
const { parseVoiceResponse, handleModelStream } = await load('../src/lib/voice/payload.ts');
const { buildSystemPrompt } = await load('../src/lib/voice/policy.ts');

test('routine backend answer carries no reaction', () => {
  assert.deepEqual(parseVoiceResponse('My backend stack includes C-sharp and dot NET Core.'), {
    emojiType: null, spokenText: 'My backend stack includes C-sharp and dot NET Core.',
  });
});
test('inline, repeated, case-insensitive and unknown tags never reach TTS', async () => {
  const events = [];
  await handleModelStream('On it! [emoji:THUMBSUP] I migrated VB .NET to Angular. [EMOJI:sparkle] [EMOJI:unknown] [EMOJI:bad-tag]',
    { spawn: (...args) => events.push(args) }, { speak: async text => events.push(text) }, { x: 10, y: 20 });
  assert.deepEqual(events, [['thumbsup', 10, 20], 'On it! I migrated VB dot NET to Angular.']);
});
test('pronunciation and empty-tag-only payloads', async () => {
  assert.equal(parseVoiceResponse('C# .NET Core D3.js').spokenText, 'C-sharp dot NET Core D-three dot js');
  let spoken = false;
  await handleModelStream('[EMOJI:unknown]', { spawn() { assert.fail(); } }, { async speak() { spoken = true; } }, { x: 0, y: 0 });
  assert.equal(spoken, false);
});
test('prompt reflects updated owner config and rejects unverified facts', () => {
  const prompt = buildSystemPrompt({ name: 'Kaushik', projects: [{ title: 'Status' }] });
  assert.ok(prompt.includes('Status'));
  assert.ok(prompt.includes('fields flagged TODO'));
  assert.ok(prompt.includes('Routine factual answers have NO emoji tags'));
});

const { selectVoiceContext } = await load('../src/lib/voice/context.ts');
const fixture = {
  config: { techStack: { Backend: ['C#', '.NET Core'] }, availability: { note: 'TODO confirm' } },
  portfolio: { name: 'Kaushik', bio: [], interests: [], projects: [
    { title: 'Status', description: 'Task tracker', company: 'Independent' },
    { title: 'Angular SPA migration', company: 'HungerRush', description: 'Migrated VB.NET to Angular' },
  ], experience: [{ company: 'HungerRush', description: 'Angular migration' }] },
};
test('local retrieval selects matching owner records, including follow-up context', () => {
  const result = selectVoiceContext(fixture, 'Show HungerRush. Explain that migration.');
  assert.equal(result.selected[0].data.company, 'HungerRush');
  assert.ok(result.projectIndex.some(p => p.title === 'Status'));
  assert.equal(result.identity.availability.note, 'TODO confirm');
});
test('unrelated questions add no unrelated project evidence', () => {
  assert.equal(selectVoiceContext(fixture, 'What is the weather today?').selected.length, 0);
});

test('browser-native local inference receives owner context without network calls', async () => {
  const encode = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
  const dependency = path => encode(ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText);
  let source = ts.transpileModule(readFileSync(new URL('../src/lib/voice/local.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const replacements = {
    '../../data/voice.json': encode('export default {};'),
    './policy': dependency('../src/lib/voice/policy.ts'),
    './payload': dependency('../src/lib/voice/payload.ts'),
    './context': dependency('../src/lib/voice/context.ts'),
  };
  for (const [from, to] of Object.entries(replacements)) source = source.replaceAll(`'${from}'`, `'${to}'`);
  const module = await import(encode(source));
  const oldFetch = globalThis.fetch;
  const oldNative = globalThis.LanguageModel;
  let destroyed = 0;
  globalThis.fetch = () => { assert.fail('No network inference is allowed'); };
  globalThis.LanguageModel = {
    async availability() { return 'available'; },
    async create(options) {
      return {
        async prompt(history, request) {
          assert.ok(options.initialPrompts[0].content.includes('Status'));
          assert.ok(history.at(-1).content.includes('Status'));
          request.signal.throwIfAborted();
          return 'On it! [EMOJI:thumbsup] I built Status.';
        },
        destroy() { destroyed += 1; },
      };
    },
  };
  try {
    const engine = await module.createLocalVoiceEngine('native', () => {}, new AbortController().signal);
    const payload = await engine.answer([{ role: 'user', content: 'Explain Status' }], fixture, new AbortController().signal);
    assert.deepEqual(payload, { emojiType: 'thumbsup', spokenText: 'On it! I built Status.' });
    assert.equal(destroyed, 2);
    assert.ok(module.validateLocalAnswer('One. Two. Three. Four.').spokenText.startsWith('I do not have'));
    engine.dispose();
  } finally { globalThis.fetch = oldFetch; if (oldNative === undefined) delete globalThis.LanguageModel; else globalThis.LanguageModel = oldNative; }
});
