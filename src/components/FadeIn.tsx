import { useRef, type ReactNode } from 'react';
import { useScrollReveal } from '../lib/use-scroll-reveal';

interface FadeInProps {
    children: ReactNode;
    direction?: 'up' | 'down' | 'left' | 'right';
    delay?: number;
    duration?: number;
    className?: string;
}

export default function FadeIn({ children, delay = 0, duration = 0.65, className = '' }: FadeInProps) {
    const ref = useRef<HTMLDivElement>(null);
    useScrollReveal(ref, delay, duration);
    return <div ref={ref} className={className} data-scroll-reveal>{children}</div>;
}
