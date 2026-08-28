// Local WebMCP typings — the browser API surface is still an origin-trial
// draft (document.modelContext in current Chrome, navigator.modelContext in
// older builds and some agentic browsers), so we type only what we rely on.

export interface ToolExecuteOptions {
    signal?: AbortSignal;
}

export interface ToolAnnotations {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
}

export interface ToolDef {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    annotations?: ToolAnnotations;
    execute: (inputs: any, options?: ToolExecuteOptions) => Promise<string>;
}

export interface ModelContext {
    registerTool(tool: ToolDef, options?: { signal?: AbortSignal }): unknown;
    unregisterTool?(name: string): unknown;
}

declare global {
    interface Document {
        modelContext?: ModelContext;
    }
    interface Navigator {
        modelContext?: ModelContext;
    }
    interface Window {
        posthog?: { capture: (event: string, props?: Record<string, unknown>) => void };
    }
}
