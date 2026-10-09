import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

interface FadeInProps {
    children: ReactNode;
    direction?: 'up' | 'down' | 'left' | 'right';
    delay?: number;
    duration?: number;
    className?: string;
}

const directionOffsets = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
};

export default function FadeIn({
    children,
    direction = 'up',
    delay = 0,
    duration = 0.6,
    className = '',
}: FadeInProps) {
    const ref = useRef<HTMLDivElement>(null);
    const reduceMotion = useReducedMotion();
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    const offset = directionOffsets[direction];

    return (
        <motion.div
            ref={ref}
            initial={false}
            animate={{ opacity: 1, x: 0, y: isInView || reduceMotion ? 0 : 8 }}
            transition={{ duration: reduceMotion ? 0 : duration, delay: reduceMotion ? 0 : delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
