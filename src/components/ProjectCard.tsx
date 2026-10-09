
interface ProjectCardProps {
    title: string;
    description: string;
    tags: string[];
    image?: string;
    liveUrl?: string;
    githubUrl?: string;
    slug: string;
    achievements?: string[];
    company?: string;
}

export default function ProjectCard({
    title,
    description,
    tags,
    image,
    liveUrl,
    githubUrl,
    slug,
    achievements = [],
    company,
}: ProjectCardProps) {

    return (
        <article
            className="project-surface group relative flex flex-col overflow-hidden rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900/50"
        >
            {/* Image */}
            {image && (
                <div className="relative h-48 overflow-hidden bg-surface-100 dark:bg-surface-800">
                    <img
                        src={image}
                        alt={title}
                        loading="lazy"
                        width={800}
                        height={450}
                        className="project-image h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-900/20 to-transparent" />

                    {/* Company badge */}
                    {company && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-surface-900/70 backdrop-blur-sm text-xs font-medium text-white">
                            {company}
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="flex flex-1 flex-col p-6 relative">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                    {title}
                </h3>
                <p className="mt-2 text-sm text-surface-500 dark:text-surface-400 line-clamp-3 flex-1">
                    {description}
                </p>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {tags.slice(0, 4).map((tag) => (
                        <span
                            key={tag}
                            className="inline-block rounded-full bg-primary-50 dark:bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400"
                        >
                            {tag}
                        </span>
                    ))}
                    {tags.length > 4 && (
                        <span className="inline-block rounded-full bg-surface-100 dark:bg-surface-800 px-3 py-1 text-xs font-medium text-surface-500 dark:text-surface-400">
                            +{tags.length - 4}
                        </span>
                    )}
                </div>

                {/* Links */}
                <div className="mt-4 flex items-center gap-3 pt-4 border-t border-surface-100 dark:border-surface-800">
                    {liveUrl && (
                        <a
                            href={liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Live
                        </a>
                    )}
                    {githubUrl && (
                        <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            Code
                        </a>
                    )}
                </div>

                <details className="mt-4 text-sm text-surface-600 dark:text-surface-300">
                    <summary className="cursor-pointer font-medium text-primary-700 dark:text-primary-300">Key Achievements</summary>
                    <ul className="mt-3 space-y-2">{achievements.map(item => <li key={item}>{item}</li>)}</ul>
                </details>
            </div>

            {/* Hover glow effect */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5" />
        </article>
    );
}
