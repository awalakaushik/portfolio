---
title: "Add WebMCP to Your Website: JavaScript and Angular"
description: "Learn how to add WebMCP tools to your website with interactive examples, JavaScript validation, Angular integration, and lifecycle cleanup."
pubDate: 2026-10-09
tags: ["WebMCP", "JavaScript", "Angular", "Accessibility"]
draft: false
---

## Give agents a clear way to use your app

Imagine a reader asking an assistant to show beginner Angular articles. Your website already knows how to filter its articles. WebMCP lets you expose that action as a named tool with structured inputs.

The browser agent can request `filter_articles` with `{ "topic": "Angular" }`. Your application validates the input, applies its normal filter, and returns the matching titles. The reader sees the same updated list.

WebMCP runs in the page and shares its browser context. A remote MCP server needs a separate integration. Registering page tools does not automatically connect every agent SDK to your website.

The API remains a draft community proposal, rather than a W3C standard. Browser and agent support varies. Check your target environment and feature-detect the API. This article targets the imperative `document.modelContext.registerTool` interface reviewed on October 9, 2026.

## Start with one useful action

Choose a small action that your website already supports. Search a catalog, filter articles, select a dashboard range, or prepare a booking.

| Action | Tool name | What completion means |
| --- | --- | --- |
| Read articles | `list_articles` | Return article data |
| Change the visible filter | `filter_articles` | Update the list and return matches |
| Prepare a booking | `prepare_booking` | Stage details without buying anything |
| Confirm a booking | `confirm_booking` | Complete the authorized transaction |

A filter changes page state, so it should not claim `readOnlyHint: true`. Annotations describe behavior; they do not grant permissions.

## Try it: Run a tool locally

Use the interactive demo above. Change the JSON input and run the tool. Try `Angular`, `JavaScript`, an unsupported topic, and malformed JSON. Notice how validation errors preserve the current list.

The demo calls the exact same handler from a form and from its simulated tool runner. The simulator works without WebMCP. A separate button registers the tool with the real browser API when available. Registration proves only API availability; an external compatible agent must still discover and call it.

## Build the tool around your application action

Keep business logic outside the adapter. The following plain JavaScript module accepts your existing `applyFilter` action. That action must update the visible list before resolving and return JSON-serializable article summaries.

```javascript
export function validateFilter(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Expected an object.');
  }
  if (Object.keys(input).some(key => key !== 'topic')) {
    throw new Error('Only topic is supported.');
  }
  if (!['All', 'Angular', 'JavaScript'].includes(input.topic)) {
    throw new Error('Choose All, Angular, or JavaScript.');
  }
  return input.topic;
}

export function createFilterTool(applyFilter) {
  return {
    name: 'filter_articles',
    description: 'Filter the visible article list by topic and return matching titles.',
    inputSchema: {
      type: 'object',
      properties: { topic: { type: 'string', enum: ['All', 'Angular', 'JavaScript'] } },
      required: ['topic'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    async execute(input) {
      const topic = validateFilter(input);
      const articles = await applyFilter(topic);
      return { topic, count: articles.length, articles };
    },
  };
}

export async function registerArticleTool(applyFilter) {
  if (typeof document === 'undefined' || !document.modelContext?.registerTool) {
    return { supported: false, cleanup() {} };
  }
  const lifecycle = new AbortController();
  try {
    await document.modelContext.registerTool(
      createFilterTool(applyFilter),
      { signal: lifecycle.signal },
    );
    return { supported: true, cleanup: () => lifecycle.abort() };
  } catch (error) {
    lifecycle.abort();
    throw error;
  }
}
```

Call registration once after the client interface initializes. Retain its cleanup function and call it when the owning view disappears. Handle rejection without breaking the normal UI. In a single-page app, scope route-specific tools to the route lifecycle. Do not register another copy after every render.

The JSON schema helps an agent select inputs. Your runtime validator still checks them. For a large application, use your established validation library and keep its schema aligned with the advertised input schema.

## Add Angular support

For a modern Angular application, use dependency injection, a shared facade, and browser-only render hooks. This adapter belongs beside the feature's data-access or integration layer. Components should keep using the same facade.

The sample assumes Angular 20+ for stable `afterNextRender`. It uses a small local interface rather than depending on a specific third-party WebMCP type package.

```typescript
import { DOCUMENT } from '@angular/common';
import {
  afterNextRender, ApplicationRef, DestroyRef, Injectable, inject,
} from '@angular/core';
import { ArticlesFacade } from './articles.facade';

type Topic = 'All' | 'Angular' | 'JavaScript';
interface ModelContext {
  registerTool(tool: {
    name: string;
    description: string;
    inputSchema: object;
    annotations: { readOnlyHint: boolean };
    execute(input: unknown): Promise<unknown>;
  }, options: { signal: AbortSignal }): void | Promise<void>;
}

function readTopic(input: unknown): Topic {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Expected an object.');
  }
  const record = input as Record<string, unknown>;
  if (Object.keys(record).some(key => key !== 'topic')) {
    throw new Error('Only topic is supported.');
  }
  const topic = record['topic'];
  if (topic === 'All' || topic === 'Angular' || topic === 'JavaScript') return topic;
  throw new Error('Choose All, Angular, or JavaScript.');
}

@Injectable() // Provide once in the owning feature component.
export class ArticlesAgentBridge {
  private readonly doc = inject(DOCUMENT);
  private readonly facade = inject(ArticlesFacade);
  private readonly app = inject(ApplicationRef);
  private readonly destroy = inject(DestroyRef);
  private readonly lifecycle = new AbortController();

  constructor() {
    this.destroy.onDestroy(() => this.lifecycle.abort());
    afterNextRender(() => { void this.register(); });
  }

  private async register(): Promise<void> {
    const context = (this.doc as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool || this.lifecycle.signal.aborted) return;
    try {
      await context.registerTool({
        name: 'filter_articles',
        description: 'Filter the visible article list by topic and return matching titles.',
        inputSchema: {
          type: 'object',
          properties: { topic: { type: 'string', enum: ['All', 'Angular', 'JavaScript'] } },
          required: ['topic'], additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        execute: async (input: unknown) => {
          if (this.lifecycle.signal.aborted) throw new Error('Feature closed.');
          const topic = readTopic(input);
          // Contract: await backend/store completion; return safe article summaries.
          const articles = await this.facade.filterByTopic(topic);
          await this.app.whenStable();
          return { topic, count: articles.length, articles };
        },
      }, { signal: this.lifecycle.signal });
    } catch (error) {
      this.lifecycle.abort();
      console.error('Article tool registration failed', error);
    }
  }
}
```

Add `providers: [ArticlesAgentBridge]` to the standalone feature component and instantiate it with `private readonly agentBridge = inject(ArticlesAgentBridge)`. Merely listing a provider does not instantiate it.

`ArticlesFacade` remains application-specific. Implement `filterByTopic(topic): Promise<Array<{ title: string; topic: string }>>` using your existing action and completion flow. With NgRx, dispatch an action and await its matching success or failure, using a request identifier. Do not return immediately after dispatch. Signals can update the UI directly; `whenStable()` waits for Angular stability after your action finishes. Long-running pending work can delay that promise, so verify this choice against your app's rendering and pending-task behavior.

Keep global tools in an application-wide adapter. Keep feature tools in a feature-scoped provider. After a route exits, abort registration and ensure pending operations respect route destruction. For cancellable requests, pass an operation signal into your facade; registration cleanup alone does not cancel all business work.

Angular's current documentation also lists experimental WebMCP helpers. Verify their availability and browser compatibility against your installed Angular version before adopting them. The adapter above teaches the underlying browser integration and avoids tying the article to those evolving helpers.

## Keep permissions in your application

Reuse normal authentication and authorization. The backend must reject unauthorized operations even if an agent supplies plausible inputs. Do not expose secrets, access tokens, or unrestricted account data in results.

For purchases, publishing, or destructive operations, stage the request and show the user its concrete effect. Complete it only through your application's confirmation flow. A browser approval prompt or an annotation cannot replace that flow.

Treat tool results containing user-generated text as untrusted content. Keep descriptions factual. Bound input lengths and result sizes, and prevent repeated calls from creating duplicate writes through your existing idempotency controls.

## Verify the integration

Test the handler first, then registration, then the full browser-agent interaction:

- Valid input updates the same list as the normal form.
- Invalid input returns a useful error without changing state.
- Missing browser support leaves the website fully usable.
- Registration failure leaves the normal UI working.
- Route exit removes the tool; re-entry registers one fresh instance.
- Async actions return after completion and visible state settles.
- Backend permission checks reject unauthorized changes.
- Keyboard users can operate the ordinary UI and demo controls.

A mock registry tests your adapter. It does not establish real browser support. Use a compatible browser and agent to verify discovery and execution before claiming an end-to-end integration.

## What to build next

Expose one useful action, observe how agents use it, and improve its inputs and results. Add more tools only when each completes a clear task. The same approach works for a static content site, an Angular dashboard, or a full-stack product.

## References

- [WebMCP draft and API](https://webmachinelearning.github.io/webmcp/)
- [WebMCP source and implementation discussion](https://github.com/webmachinelearning/webmcp)
- [Angular afterNextRender](https://angular.dev/api/core/afterNextRender)
- [Angular DestroyRef](https://angular.dev/api/core/DestroyRef)
- [Angular ApplicationRef](https://angular.dev/api/core/ApplicationRef)
