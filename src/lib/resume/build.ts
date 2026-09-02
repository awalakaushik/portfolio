import type { PortfolioData } from '../portfolio-data';
import { rankProjects } from '../matching/score';

// Assembles a role-targeted resume purely from the structured portfolio data.
// Rendered by /resume (ResumeView island) with a print stylesheet for PDF.

export interface ResumeSpec {
    roleTitle: string;
    name: string;
    contact: { email: string; location: string; website: string; github: string; linkedin: string };
    summary: string;
    skills: { category: string; items: string[] }[];
    experience: {
        company: string;
        role: string;
        period: string;
        location?: string;
        highlights: string[];
    }[];
    selectedProjects: { title: string; company?: string; line: string }[];
    education: { school: string; degree: string; years: string }[];
    certifications: string[];
    generatedAt: string;
}

function pickSummary(roleTitle: string, data: PortfolioData): string {
    const t = roleTitle.toLowerCase();
    if (/front\s*-?end|ui|react|angular/.test(t)) return data.resumeSummaries['frontend'];
    if (/full\s*-?stack|backend|\.net/.test(t)) return data.resumeSummaries['fullstack'];
    return data.resumeSummaries['default'];
}

function formatPeriod(start: string, end?: string): string {
    const fmt = (ym: string) => {
        const [y, m] = ym.split('-').map(Number);
        return new Date(y, (m ?? 1) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };
    return `${fmt(start)} – ${end ? fmt(end) : 'Present'}`;
}

export function buildResume(
    data: PortfolioData,
    roleTitle = 'Software Engineer',
    jobDescription?: string
): ResumeSpec {
    const { rankedSlugs } = rankProjects(
        data,
        roleTitle.split(/\s+/),
        jobDescription
    );
    const bySlug = new Map(data.projects.map((p) => [p.slug, p]));
    const selectedProjects = rankedSlugs
        .slice(0, 3)
        .map((slug) => bySlug.get(slug)!)
        .filter(Boolean)
        .map((p) => ({
            title: p.title,
            company: p.company,
            line: p.outcomes[0]
                ? `${p.description} Key outcome — ${p.outcomes[0].metric}: ${p.outcomes[0].value}.`
                : p.description,
        }));

    const categories = [...new Set(data.skills.map((s) => s.category))];

    return {
        roleTitle,
        name: data.name,
        contact: {
            email: data.email,
            location: data.location,
            website: data.website,
            github: `github.com/${data.social.github}`,
            linkedin: `linkedin.com/in/${data.social.linkedin}`,
        },
        summary: pickSummary(roleTitle, data),
        skills: categories.map((category) => ({
            category,
            items: data.skills.filter((s) => s.category === category).map((s) => s.name),
        })),
        experience: data.experience.map((e) => ({
            company: e.company,
            role: e.role,
            period: formatPeriod(e.startDate, e.endDate),
            location: e.location,
            highlights: e.highlights.length ? e.highlights : [e.description],
        })),
        selectedProjects,
        education: data.education,
        certifications: data.certifications,
        generatedAt: new Date().toISOString(),
    };
}
