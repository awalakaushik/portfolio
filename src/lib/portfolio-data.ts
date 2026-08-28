import { getCollection } from 'astro:content';
import bio from '../data/bio.json';

// Serializable snapshot of everything the WebMCP tools need. Assembled at
// build time (content collections are server-only) and passed to the
// AgentBridge island as a prop; also served verbatim at /profile.json.

export interface SkillEntry {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    years: number;
    aliases: string[];
    category: string;
}

export interface ProjectEntry {
    slug: string;
    title: string;
    description: string;
    tags: string[];
    company?: string;
    role?: string;
    period?: string;
    skills: string[];
    achievements: string[];
    outcomes: { metric: string; value: string; context?: string; evidenceUrl?: string }[];
    evidenceLinks: { label: string; url: string }[];
    liveUrl?: string;
    githubUrl?: string;
    featured: boolean;
}

export interface ExperienceEntry {
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    location?: string;
    description: string;
    highlights: string[];
    skills: string[];
}

export interface PortfolioData {
    name: string;
    titles: { primary: string; seo: string; variants: string[] };
    pitch: string;
    location: string;
    email: string;
    website: string;
    availability: { status: string; roles: string[]; location: string };
    bio: string[];
    interests: string[];
    certifications: string[];
    education: { school: string; degree: string; years: string }[];
    social: Record<string, string>;
    skills: SkillEntry[];
    resumeSummaries: Record<string, string>;
    projects: ProjectEntry[];
    experience: ExperienceEntry[];
}

export async function getPortfolioData(): Promise<PortfolioData> {
    const [projects, experience] = await Promise.all([
        getCollection('projects'),
        getCollection('experience'),
    ]);

    return {
        name: bio.name,
        titles: bio.titles,
        pitch: bio.pitch,
        location: bio.location,
        email: bio.email,
        website: bio.website,
        availability: {
            status: bio.availability.status,
            roles: bio.availability.roles,
            location: bio.availability.location,
        },
        bio: bio.bio,
        interests: bio.interests,
        certifications: bio.certifications,
        education: bio.education.map(({ school, degree, years }) => ({ school, degree, years })),
        social: bio.social,
        skills: bio.skills as SkillEntry[],
        resumeSummaries: bio.resume.summaryByRole,
        projects: projects
            .sort((a, b) => a.data.order - b.data.order)
            .map((p) => ({
                slug: p.id,
                title: p.data.title,
                description: p.data.description,
                tags: p.data.tags,
                company: p.data.company,
                role: p.data.role,
                period: p.data.period,
                skills: p.data.skills,
                achievements: p.data.achievements,
                outcomes: p.data.outcomes,
                evidenceLinks: p.data.evidenceLinks,
                liveUrl: p.data.liveUrl,
                githubUrl: p.data.githubUrl,
                featured: p.data.featured,
            })),
        experience: experience
            .sort((a, b) => a.data.order - b.data.order)
            .map((e) => ({
                company: e.data.company,
                role: e.data.role,
                startDate: e.data.startDate,
                endDate: e.data.endDate,
                location: e.data.location,
                description: e.data.description,
                highlights: e.data.highlights,
                skills: e.data.skills,
            })),
    };
}
