import { useSyncExternalStore } from 'react';

function getSnapshot(): boolean {
    return document.documentElement.dataset.motion === 'off' || matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function subscribe(update: () => void) {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
        let saved = document.documentElement.dataset.motionPreference === 'off';
        try { saved = localStorage.getItem('portfolio-motion') === 'off'; } catch { /* In-page preferences still work. */ }
        document.documentElement.dataset.motion = saved || media.matches ? 'off' : 'on';
        update();
    };
    document.addEventListener('portfolio:motion-change', sync);
    document.addEventListener('astro:after-swap', sync);
    media.addEventListener('change', sync);
    return () => {
        document.removeEventListener('portfolio:motion-change', sync);
        document.removeEventListener('astro:after-swap', sync);
        media.removeEventListener('change', sync);
    };
}

export function useMotionDisabled(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, () => true);
}

export function setMotionDisabled(disabled: boolean): void {
    try { localStorage.setItem('portfolio-motion', disabled ? 'off' : 'on'); } catch { /* In-page preferences still work. */ }
    document.documentElement.dataset.motionPreference = disabled ? 'off' : 'on';
    document.documentElement.dataset.motion = disabled || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'off' : 'on';
    document.dispatchEvent(new Event('portfolio:motion-change'));
}
