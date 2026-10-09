import { useState, useEffect, useRef } from 'react';
import { useMotionDisabled, setMotionDisabled } from '../lib/motion-preference';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/projects', label: 'Projects' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isDark, setIsDark] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const [currentPath, setCurrentPath] = useState('/');
    const motionDisabled = useMotionDisabled();
    const menuButton = useRef<HTMLButtonElement>(null);
    const [systemReduced, setSystemReduced] = useState(false);

    useEffect(() => {
        const media = matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setSystemReduced(media.matches);
        update(); media.addEventListener('change', update);
        const escape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape' || !isOpen) return;
            setIsOpen(false); menuButton.current?.focus();
        };
        document.addEventListener('keydown', escape);
        return () => { media.removeEventListener('change', update); document.removeEventListener('keydown', escape); };
    }, [isOpen]);

    useEffect(() => {
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(stored ? stored === 'dark' : prefersDark);

        // Detect current page
        setCurrentPath(window.location.pathname);

        // Update path after View Transitions swap
        const onSwap = () => {
            setCurrentPath(window.location.pathname);
            setIsOpen(false);
        };
        document.addEventListener('astro:after-swap', onSwap);

        return () => document.removeEventListener('astro:after-swap', onSwap);
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
    };

    const isActive = (href: string) => {
        if (href === '/') return currentPath === '/';
        return currentPath.startsWith(href);
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl shadow-lg shadow-surface-900/5 dark:shadow-surface-950/30'
                : 'bg-transparent'
                }`}
        >
            <nav className="max-w-6xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
                {/* Logo */}
                <a href="/" className="text-xl font-bold tracking-tight group">
                    <span className="text-gradient">AK</span>
                    <span className="text-surface-400 dark:text-surface-500 group-hover:text-surface-600 dark:group-hover:text-surface-300 transition-colors">
                        .dev
                    </span>
                </a>

                {/* Desktop Links */}
                <ul className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <a
                                href={link.href}
                                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive(link.href)
                                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10'
                                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800/50'
                                    }`}
                                aria-current={isActive(link.href) ? 'page' : undefined}
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* Right controls */}
                <div className="flex items-center gap-1">
                    <button type="button" aria-pressed={motionDisabled} disabled={systemReduced}
                        title={systemReduced ? 'Your device requests reduced motion' : 'Turn off nonessential animations'}
                        onClick={() => setMotionDisabled(!motionDisabled)}
                        className="motion-toggle rounded-lg px-2 text-xs font-medium text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-70">
                        Reduce motion
                    </button>
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle dark mode"
                        type="button"
                        aria-pressed={isDark}
                        className="min-h-11 min-w-11 flex items-center justify-center p-2 rounded-xl text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-all"
                    >
                        {isDark ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle navigation menu"
                        ref={menuButton}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls="mobile-navigation"
                        className="md:hidden min-h-11 min-w-11 flex items-center justify-center p-2 rounded-xl text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
                    <div id="mobile-navigation" hidden={!isOpen}
                        className="mobile-navigation md:hidden bg-white/95 dark:bg-surface-950/95 backdrop-blur-xl border-t border-surface-200 dark:border-surface-800"
                    >
                        <ul className="px-6 py-4 space-y-1">
                            {navLinks.map((link) => (
                                <li
                                    key={link.href}
                                >
                                    <a
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive(link.href)
                                            ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10'
                                            : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800/50'
                                            }`}
                                        aria-current={isActive(link.href) ? 'page' : undefined}
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
        </header>
    );
}
