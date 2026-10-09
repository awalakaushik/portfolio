# On-device portfolio conversations

The “Talk with my AI” panel runs language-model inference in the visitor’s browser. It uses no API key, paid inference service, server conversation endpoint, or cloud fallback. It represents Kaushik in first person and visibly identifies itself as an AI representative with a synthetic voice.

## Local model choices

The panel checks device capabilities without downloading model weights. Visitors explicitly choose one of the available options:

| Option | Execution | Model ownership and updates | Requirements |
| --- | --- | --- | --- |
| Use browser AI | Native LanguageModel Prompt API, Gemini Nano in Chrome | Browser vendor controls the model and updates | Supported desktop browser, hardware and storage; may require an initial model download |
| Download local model | WebLLM in a dedicated Web Worker | Portfolio controls the pinned SmolLM2 model revision | WebGPU, enough memory and storage, initial download |

The default downloadable model is `SmolLM2-360M-Instruct-q4f32_1-MLC`, a small four-bit model which does not require the optional shader-f16 feature. WebLLM’s registry estimates around 580 MB of GPU memory, which differs from network download size. The pinned model’s tensor-cache manifest lists approximately 204 MB of shard bytes (and 226 MB of parameter bytes in its metadata); tokenizer, configuration, compiled model library and runtime add overhead. The UI therefore describes the download as hundreds of megabytes rather than promising an exact total. Browser-managed Gemini Nano can be substantially larger and has more restrictive requirements.

The WebLLM runtime and worker are separate deferred bundles (approximately six MB uncompressed each with the installed runtime). They load only after choosing the downloaded model, not on ordinary visits or native-model use. Model weights, tokenizer/config, and WASM library use WebLLM’s persistent Cache API backend. Cached inference can work without internet after initialization; initial downloads need internet and browsers can evict cached storage. The portfolio does not currently install a service worker to guarantee the whole website reopens offline. Keep the loaded page open for offline conversations.

## Source of truth and updates

`BaseLayout.astro` passes `src/data/bio.json` and the existing `getPortfolioData()` snapshot into the client. A local lexical selector supplies the most relevant project/experience records, identity, expertise, and project index within the small model’s context budget. It includes recent visitor questions for follow-ups. No embeddings or retrieval service run remotely. Owner config changes take effect on rebuild/deploy without retraining or replacing model weights. The prompt treats TODO-marked fields as unverified and skill levels as self-assessments.

To update the downloadable model, edit `src/data/voice.json` with a compatible WebLLM model ID and pinned Hugging Face commit revision, verify its behavior, then rebuild/deploy. Update the runtime dependency if the compiled model library requires it. Model URLs include the revision to avoid silently changing the cached weights. The worker’s compiled library comes from the versioned WebLLM registry in the locked dependency. Browser AI updates remain under the browser vendor’s control; use the downloadable option when model selection matters. “Remove downloaded model” deletes that configured model’s WebLLM cache and releases its worker; it does not remove browser-managed Gemini Nano or previously configured revisions. Browser site-storage controls can clear all site caches.

## Fully local speech

Microphone input is available only when the browser exposes on-device recognition through `processLocally`, `available()`, and `install()`. Start mic explicitly checks or installs the English language pack and forces `processLocally = true`. The panel never falls back to remote browser speech recognition. Browser-owned language pack installation may continue after Stop because that API does not expose cancellation, but no recognition starts after cancellation.

Speech output uses only an English SpeechSynthesisVoice with `localService = true`. If none exists, the transcript remains readable and the panel explains the missing offline voice. Typed input remains the fallback on devices without on-device microphone support. No questions or audio go to a cloud inference/transcription service. Model hosts receive file-download requests; hosting still carries ordinary site delivery costs. Conversations stay in memory; Reset clears displayed turns.

## Interaction behavior

Answers use one to three natural sentences and phonetic technology names. The parser strips reaction tags and markdown before synthesis, retains only the first approved cue, and never emits reactions for routine factual answers unless the model incorrectly supplies one. Invalid or overlong model output returns the portfolio-specific fallback. Reactions float near the controls and respect reduced motion. Stop, close, reset, and unmount cancel stale work and stop speech; initialization cancellation terminates the worker. WebLLM generations serialize to avoid overlap after cancellation.

A small model can hallucinate or miss instructions. Prompt grounding and output-format validation do not verify every fact. This implementation does not claim cloud-model quality or universal browser support. Test real model answers and actual microphone/audio on supported target devices before merging to production.

## Verification

Run:

```sh
node --test tests/voice.test.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

The optional production-asset browser check requires Playwright and Chromium:

```sh
node tests/voice-browser.mjs
```

Set `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` when your environment keeps those outside the project. The browser check mocks the native model and local voice; it verifies integration, not model quality. It checks no eager model downloads, opt-in initialization, portfolio context, routine/no-reaction and action/reaction turns, tag-free synthesis, mobile bounds, cancellation, reset, focus, and page errors.

On real devices, test native and downloadable paths, missing/denied GPU, cold download, warm cache, offline inference, storage eviction, model deletion, interrupted loading, denied mic access, English speech-pack installation, no local voice, and keyboard/reduced-motion behavior. Ask about backend stack, HungerRush, Status, unavailable facts, conversational follow-ups, and attempts to override grounding. Hardware-backed real inference remains necessary to assess the tiny model’s reliability.

## Primary references

- [Chrome Prompt API](https://developer.chrome.com/docs/ai/prompt-api)
- [WebLLM](https://webllm.mlc.ai/docs/)
- [WebLLM worker usage](https://webllm.mlc.ai/docs/user/advanced_usage.html)
- [SmolLM2 model](https://huggingface.co/mlc-ai/SmolLM2-360M-Instruct-q4f32_1-MLC)
- [On-device speech recognition](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)
