// Generate an offline review copy; no public route imports these files.
import { readFile, writeFile } from 'node:fs/promises';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
const markdown = await readFile('docs/drafts/add-webmcp-to-your-website.md', 'utf8');
const rendered = String(await unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeStringify).process(markdown));
const demo = await readFile('docs/drafts/webmcp-demo.html', 'utf8');
const body = rendered.replace('<h2>Build the tool around your application action</h2>', demo + '<h2>Build the tool around your application action</h2>');
await writeFile('docs/drafts/webmcp-review.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Add WebMCP to Your Website — Review Draft</title><style>
:root{--color-primary-600:#2563eb;--color-surface-900:#0f172a;--color-surface-100:#f1f5f9;--color-surface-300:#cbd5e1;color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#f8fafc;color:var(--color-surface-900);font:1.0625rem/1.8 system-ui}main{max-width:54rem;margin:auto;padding:3rem 1.5rem}h1,h2,h3{line-height:1.2;letter-spacing:-.025em}h1{font-size:2.5rem}h2{margin-top:3rem}a{color:#1d4ed8}pre{background:var(--color-surface-900);color:var(--color-surface-100);padding:1.25rem;border-radius:.75rem;overflow:auto;font-size:.875rem}code{font-family:ui-monospace,monospace}table{display:block;overflow:auto;border-collapse:collapse}td,th{padding:.75rem;border:1px solid var(--color-surface-300);text-align:left}.demo-webmcp{padding:1.5rem;background:white;border:1px solid var(--color-surface-300);border-radius:1rem}.demo-webmcp textarea{display:block;width:100%;margin:.75rem 0;padding:.75rem;font:1rem/1.5 monospace}.demo-webmcp button,.demo-webmcp select{font:inherit;padding:.5rem .75rem;margin:.25rem 0;border:1px solid var(--color-surface-300);border-radius:.5rem;background:var(--color-surface-100);color:var(--color-surface-900)}.demo-webmcp button{cursor:pointer}button:disabled{opacity:.6} :focus-visible{outline:3px solid var(--color-primary-600);outline-offset:3px}@media(max-width:35rem){h1{font-size:2rem}main{padding:2rem 1rem}}@media(prefers-color-scheme:dark){:root{color-scheme:dark}body{background:#0f172a;color:#e2e8f0}a{color:#93c5fd}.demo-webmcp{background:#1e293b;border-color:#475569}.demo-webmcp button,.demo-webmcp select{background:#334155;color:#f1f5f9;border-color:#64748b}.demo-webmcp textarea{background:#0f172a;color:#f1f5f9}td,th{border-color:#475569}}
</style></head><body><main><article>${body}</article></main></body></html>`);
