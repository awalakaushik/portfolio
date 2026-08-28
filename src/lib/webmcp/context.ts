import type { ModelContext } from './types';

export type ModelContextSurface = 'document' | 'navigator' | 'none';

// Current Chrome exposes document.modelContext; earlier builds and some
// agentic browsers expose navigator.modelContext. Support both.
export function getModelContext(): { ctx: ModelContext; surface: ModelContextSurface } | null {
    if (typeof document !== 'undefined' && document.modelContext) {
        return { ctx: document.modelContext, surface: 'document' };
    }
    if (typeof navigator !== 'undefined' && navigator.modelContext) {
        return { ctx: navigator.modelContext, surface: 'navigator' };
    }
    return null;
}
