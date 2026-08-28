import type { APIRoute } from 'astro';
import { getPortfolioData } from '../lib/portfolio-data';
import { TOOL_NAMES } from '../lib/webmcp/tool-names';

export const GET: APIRoute = async () => {
    const data = await getPortfolioData();
    const body = `# ${data.name} — Agent-Native Portfolio

> ${data.pitch}

This site exposes ${TOOL_NAMES.length} typed WebMCP tools to browser AI agents
(document.modelContext / navigator.modelContext). Open it in an agentic browser
and the tools register automatically.

## Tools
${TOOL_NAMES.map((t) => `- ${t}`).join('\n')}

## Machine-readable data
- ${data.website}/profile.json — full structured profile (skills, projects with outcomes, experience)
- ${data.website}/agents — human-readable tool catalog and instructions
- ${data.website}/agent-traffic — live public analytics of agent tool usage

## Contact
- Email: ${data.email}
- GitHub: https://github.com/${data.social.github}
- LinkedIn: https://linkedin.com/in/${data.social.linkedin}
`;
    return new Response(body, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
};
