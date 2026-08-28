import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const outcome = z.object({
    metric: z.string(),
    value: z.string(),
    context: z.string().optional(),
    evidenceUrl: z.string().url().optional(),
});

const projects = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        tags: z.array(z.string()),
        image: z.string().optional(),
        liveUrl: z.string().url().optional(),
        githubUrl: z.string().url().optional(),
        featured: z.boolean().default(false),
        order: z.number().default(0),
        achievements: z.array(z.string()).default([]),
        company: z.string().optional(),
        // Structured data consumed by the WebMCP tools (match_role, get_evidence, …)
        outcomes: z.array(outcome).default([]),
        skills: z.array(z.string()).default([]),
        period: z.string().optional(),
        role: z.string().optional(),
        evidenceLinks: z
            .array(z.object({ label: z.string(), url: z.string().url() }))
            .default([]),
    }),
});

const experience = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/experience' }),
    schema: z.object({
        company: z.string(),
        role: z.string(),
        startDate: z.string(),
        endDate: z.string().optional(),
        description: z.string(),
        logo: z.string().optional(),
        order: z.number().default(0),
        // Structured data consumed by the WebMCP tools
        highlights: z.array(z.string()).default([]),
        skills: z.array(z.string()).default([]),
        location: z.string().optional(),
    }),
});

const blogs = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blogs' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().default(false),
    }),
});

const techStack = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tech-stack' }),
    schema: z.object({
        name: z.string(),
        icon: z.string(),
        category: z.string(),
        color: z.string().optional(),
        proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('intermediate'),
    }),
});

export const collections = { projects, experience, blogs, 'tech-stack': techStack };
