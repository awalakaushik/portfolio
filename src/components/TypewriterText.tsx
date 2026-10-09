import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface TypewriterTextProps {
    phrases: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseDuration?: number;
    className?: string;
}

export default function TypewriterText({
    phrases,
    typingSpeed = 80,
    deletingSpeed = 40,
    pauseDuration = 2000,
    className = '',
}: TypewriterTextProps) {
    const [displayText, setDisplayText] = useState(phrases[0] ?? '');
    const reducedMotion = useReducedMotion();
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        if (reducedMotion) return;
        const currentPhrase = phrases[phraseIndex];

        if (!isDeleting && displayText === currentPhrase) {
            // Finished typing — pause, then start deleting
            timeoutRef.current = setTimeout(() => setIsDeleting(true), pauseDuration);
            return;
        }

        if (isDeleting && displayText === '') {
            // Finished deleting — move to next phrase
            setIsDeleting(false);
            setPhraseIndex((prev) => (prev + 1) % phrases.length);
            return;
        }

        const speed = isDeleting ? deletingSpeed : typingSpeed;
        timeoutRef.current = setTimeout(() => {
            setDisplayText((prev) =>
                isDeleting
                    ? currentPhrase.substring(0, prev.length - 1)
                    : currentPhrase.substring(0, prev.length + 1)
            );
        }, speed);

        return () => clearTimeout(timeoutRef.current);
    }, [displayText, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration, reducedMotion]);

    // Blinking cursor
    useEffect(() => {
        if (reducedMotion) return;
        const cursorInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 530);
        return () => clearInterval(cursorInterval);
    }, [reducedMotion]);

    return (
        <span className={className} aria-label={phrases.join(', ')}>
            <span aria-hidden="true">
                {reducedMotion ? phrases[0] : displayText}
                <motion.span
                    className="inline-block w-[3px] ml-0.5 bg-primary-500 relative -top-[1px]"
                    style={{
                        height: '0.85em',
                        opacity: !reducedMotion && showCursor ? 1 : 0,
                    }}
                />
            </span>
        </span>
    );
}
