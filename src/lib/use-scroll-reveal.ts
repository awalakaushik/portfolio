import { useEffect, useRef, type RefObject } from 'react';
import { useMotionDisabled } from './motion-preference';

// Server-rendered content stays visible. Keyboard focus cancels the short
// reveal immediately, and preference changes cancel any running animation.
export function useScrollReveal(ref: RefObject<HTMLElement | null>, delay = 0, duration = 0.65) {
    const disabled = useMotionDisabled();
    const played = useRef(false);
    useEffect(() => {
        const element = ref.current;
        if (!element || disabled || played.current || !element.animate || !('IntersectionObserver' in window)) return;
        let animation: Animation | undefined;
        const cancel = () => animation?.cancel();
        const observer = new IntersectionObserver(entries => {
            if (!entries[0]?.isIntersecting || played.current) return;
            played.current = true;
            observer.disconnect();
            animation = element.animate([
                { opacity: 0.72, transform: 'translateY(0.75rem)' },
                { opacity: 1, transform: 'translateY(0)' },
            ], { duration: Math.min(duration, 0.8) * 1000, delay: Math.min(delay, 0.15) * 1000, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'none' });
            animation.onfinish = () => element.dataset.revealed = 'true';
        }, { threshold: 0.08 });
        element.addEventListener('focusin', cancel);
        observer.observe(element);
        return () => { observer.disconnect(); element.removeEventListener('focusin', cancel); cancel(); };
    }, [disabled, ref, delay, duration]);
}
