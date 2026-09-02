import type { PortfolioData, SkillEntry, ProjectEntry } from '../portfolio-data';

// Deterministic job-description matcher. No LLM involved: the visiting agent
// brings the reasoning, this site brings verifiable facts. Unmatched
// requirements are reported honestly as gaps.

export interface MatchedSkill {
    skill: string;
    level: string;
    years: number;
    mentions: number;
    evidence: { source: string; detail: string }[];
}

export interface Gap {
    requirement: string;
    note: string;
}

export interface FitReport {
    roleTitle: string;
    score: number; // 0-100
    verdict: string;
    matched: MatchedSkill[];
    gaps: Gap[];
    generatedAt: string;
}

const LEVEL_WEIGHT: Record<string, number> = {
    expert: 1.0,
    advanced: 0.85,
    intermediate: 0.6,
    beginner: 0.4,
};

function normalize(text: string): string {
    return ' ' + text.toLowerCase().replace(/[^a-z0-9.#+]+/g, ' ') + ' ';
}

function skillTerms(skill: SkillEntry): string[] {
    return [skill.name, ...skill.aliases].map((t) => t.toLowerCase());
}

function countMentions(jd: string, terms: string[]): number {
    let count = 0;
    for (const term of terms) {
        // whole-word-ish match; terms may contain dots/# (".net", "c#")
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'g');
        count += (jd.match(re) ?? []).length;
    }
    return count;
}

function evidenceFor(skillName: string, data: PortfolioData): { source: string; detail: string }[] {
    const out: { source: string; detail: string }[] = [];
    for (const p of data.projects) {
        if (p.skills.includes(skillName) || p.tags.some((t) => t.toLowerCase() === skillName.toLowerCase())) {
            const best = p.outcomes[0];
            out.push({
                source: `${p.title}${p.company ? ` (${p.company})` : ''}`,
                detail: best ? `${best.metric}: ${best.value}` : p.description,
            });
        }
    }
    for (const e of data.experience) {
        if (e.skills.includes(skillName)) {
            out.push({ source: `${e.role} @ ${e.company}`, detail: e.highlights[0] ?? e.description });
        }
    }
    return out.slice(0, 3);
}

// Common JD requirement terms that aren't in the skill dictionary — used to
// surface honest gaps rather than silently ignoring them.
const KNOWN_TECH_TERMS = [
    'python', 'java', 'go', 'golang', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala',
    'django', 'flask', 'rails', 'spring', 'laravel', 'graphql', 'grpc',
    'postgres', 'postgresql', 'mysql', 'mongodb', 'redis', 'kafka', 'elasticsearch', 'dynamodb',
    'gcp', 'google cloud', 'terraform', 'ansible', 'jenkins',
    'next.js', 'nextjs', 'nuxt', 'svelte', 'ember', 'flutter', 'react native',
    'machine learning', 'data science', 'pytorch', 'tensorflow', 'llm',
];

export function scoreRole(
    jobDescription: string,
    roleTitle: string | undefined,
    data: PortfolioData
): FitReport {
    const jd = normalize(jobDescription);

    const matched: MatchedSkill[] = [];
    for (const skill of data.skills) {
        const mentions = countMentions(jd, skillTerms(skill));
        if (mentions > 0) {
            matched.push({
                skill: skill.name,
                level: skill.level,
                years: skill.years,
                mentions,
                evidence: evidenceFor(skill.name, data),
            });
        }
    }
    matched.sort(
        (a, b) => b.mentions * (LEVEL_WEIGHT[b.level] ?? 0.5) - a.mentions * (LEVEL_WEIGHT[a.level] ?? 0.5)
    );

    const gaps: Gap[] = [];
    for (const term of KNOWN_TECH_TERMS) {
        if (countMentions(jd, [term]) > 0) {
            gaps.push({
                requirement: term,
                note: `Mentioned in the job description but not in Kaushik's stated skill set — no claimed experience.`,
            });
        }
    }

    // Score: how much of the JD's detected tech surface is covered, weighted by
    // proficiency. Requirements we can't detect at all don't count against or
    // for — the verdict says so.
    const coveredWeight = matched.reduce((sum, m) => sum + (LEVEL_WEIGHT[m.level] ?? 0.5), 0);
    const totalDetected = matched.length + gaps.length;
    const score =
        totalDetected === 0 ? 0 : Math.round(Math.min(100, (coveredWeight / totalDetected) * 100));

    let verdict: string;
    if (totalDetected === 0) {
        verdict =
            'No recognizable technical requirements detected in this description — the score is not meaningful. Try pasting the full job description.';
    } else if (score >= 75) {
        verdict = `Strong fit: ${matched.length} of ${totalDetected} detected requirements match, most at advanced/expert level.`;
    } else if (score >= 45) {
        verdict = `Partial fit: solid overlap on ${matched.length} requirements, with ${gaps.length} stated gap${gaps.length === 1 ? '' : 's'}.`;
    } else {
        verdict = `Weak fit: only ${matched.length} of ${totalDetected} detected requirements match. The gaps listed are real — this is probably not the right role.`;
    }

    return {
        roleTitle: roleTitle ?? 'Unspecified role',
        score,
        verdict,
        matched,
        gaps,
        generatedAt: new Date().toISOString(),
    };
}

// Relevance ranking for tailor_view: reuse the same matching machinery.
export function rankProjects(
    data: PortfolioData,
    emphasizeSkills: string[],
    jobDescription?: string
): { rankedSlugs: string[]; dimmedSlugs: string[] } {
    const jd = jobDescription ? normalize(jobDescription) : '';
    const wanted = emphasizeSkills.map((s) => s.toLowerCase());

    const scored = data.projects.map((p: ProjectEntry) => {
        let s = 0;
        const projectTerms = [...p.skills, ...p.tags].map((t) => t.toLowerCase());
        for (const term of projectTerms) {
            if (wanted.some((w) => term.includes(w) || w.includes(term))) s += 3;
            if (jd && countMentions(jd, [term]) > 0) s += 1;
        }
        return { slug: p.slug, s };
    });
    scored.sort((a, b) => b.s - a.s);
    const rankedSlugs = scored.map((x) => x.slug);
    const dimmedSlugs = scored.filter((x) => x.s === 0).map((x) => x.slug);
    return { rankedSlugs, dimmedSlugs };
}
