import type { APIRoute } from 'astro';
import { getPortfolioData } from '../lib/portfolio-data';

// Machine-readable profile for agents that don't speak WebMCP.
// Linked from /llms.txt and the /agents page.
export const GET: APIRoute = async () => {
    const data = await getPortfolioData();
    return new Response(JSON.stringify(data, null, 2), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
};
