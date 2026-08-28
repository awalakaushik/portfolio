import { getModelContext, type ModelContextSurface } from './context';
import type { ToolDef } from './types';

let controller: AbortController | null = null;

function logToolCall(tool: string, ok: boolean, ms: number) {
    window.posthog?.capture('webmcp_tool_call', {
        tool,
        ok,
        duration_ms: ms,
        page: location.pathname,
    });
    // Fire-and-forget; the aggregate feeds the public /agent-traffic dashboard.
    fetch('/api/agent-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, ok, ms: Math.round(ms) }),
    }).catch(() => {});
}

function wrap(tool: ToolDef): ToolDef {
    return {
        ...tool,
        execute: async (inputs, options) => {
            const start = performance.now();
            try {
                const result = await tool.execute(inputs, options);
                logToolCall(tool.name, true, performance.now() - start);
                return result;
            } catch (err) {
                logToolCall(tool.name, false, performance.now() - start);
                return `The ${tool.name} tool hit an error: ${err instanceof Error ? err.message : 'unknown error'}. The rest of the site's tools still work.`;
            }
        },
    };
}

export function registerAll(tools: ToolDef[]): ModelContextSurface {
    // Debug/demo handle: lets anyone exercise the tools from DevTools even
    // without a WebMCP-capable browser, e.g.
    //   __webmcpTools.match_role({ job_description: '...' })
    (window as any).__webmcpTools = Object.fromEntries(
        tools.map((t) => [t.name, (inputs: unknown = {}) => wrap(t).execute(inputs)])
    );

    const found = getModelContext();
    if (!found) {
        window.posthog?.capture('webmcp_unavailable', { ua: navigator.userAgent });
        return 'none';
    }
    unregisterAll();
    controller = new AbortController();
    for (const tool of tools) {
        try {
            found.ctx.registerTool(wrap(tool), { signal: controller.signal });
        } catch (err) {
            console.warn(`[webmcp] failed to register ${tool.name}`, err);
        }
    }
    window.posthog?.capture('webmcp_registered', {
        surface: found.surface,
        tool_count: tools.length,
    });
    return found.surface;
}

export function unregisterAll() {
    controller?.abort();
    controller = null;
}
