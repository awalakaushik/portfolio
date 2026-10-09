interface Props { phrases: string[]; className?: string; }

// Keep the primary role steady and readable, with no perpetual text changes.
export default function TypewriterText({ phrases, className = '' }: Props) {
    return <span>
        <span className={className}>{phrases[0]}</span>
        <span className="block mt-2 text-sm leading-relaxed text-surface-600 dark:text-surface-300">
            {phrases.slice(1).join(' · ')}
        </span>
    </span>;
}
