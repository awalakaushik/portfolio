import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface TimelineItemProps {
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description: string;
    index: number;
}

export default function TimelineItem({
    company,
    role,
    startDate,
    endDate,
    description,
    index,
}: TimelineItemProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative pl-8 md:pl-12 pb-12 last:pb-0 group"
        >
            {/* Timeline line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-surface-200 dark:bg-surface-800 group-last:bg-gradient-to-b group-last:from-surface-200 group-last:to-transparent dark:group-last:from-surface-800" />

            {/* Timeline dot */}
            <div className="absolute left-0 top-1 -translate-x-1/2 w-3 h-3 rounded-full bg-primary-500 ring-4 ring-white dark:ring-surface-950 shadow-lg shadow-primary-500/30" />

            {/* Content */}
            <div className="glass-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                        {role}
                    </h3>
                    <span className="text-xs font-mono text-surface-400 dark:text-surface-500">
                        {startDate} — {endDate || 'Present'}
                    </span>
                </div>
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-3">
                    {company}
                </p>
                <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                    {description}
                </p>
            </div>
        </motion.div>
    );
}
