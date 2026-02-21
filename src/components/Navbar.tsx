import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [season, setSeason] = useState('winter');
    const [currentPath, setCurrentPath] = useState('/');

    const seasonEmojis: Record<string, string> = {
        spring: '🌸',
        summer: '☀️',
        autumn: '🍂',
        winter: '❄️',
    };

    const seasonOrder = ['spring', 'summer', 'autumn', 'winter'];

    useEffect(() => {
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(stored ? stored === 'dark' : prefersDark);

        // Read current season from DOM (set by inline script)
        const currentSeason = document.documentElement.getAttribute('data-season') || 'winter';
        setSeason(currentSeason);

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

    const cycleSeason = () => {
        const currentIndex = seasonOrder.indexOf(season);
        const next = seasonOrder[(currentIndex + 1) % seasonOrder.length];
        setSeason(next);
        document.documentElement.setAttribute('data-season', next);
        localStorage.setItem('season', next);
    };

    const isActive = (href: string) => {
        if (href === '/') return currentPath === '/';
        return currentPath.startsWith(href);
    };

    return (
        <motion.header
            initial={{ y: -80 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
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
                    {/* Season Toggle */}
                    <button
                        onClick={cycleSeason}
                        aria-label={`Current season: ${season}. Click to change.`}
                        title={`${season.charAt(0).toUpperCase() + season.slice(1)} theme`}
                        className="p-2 rounded-xl text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-all text-base"
                    >
                        {seasonEmojis[season]}
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle dark mode"
                        className="p-2 rounded-xl text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-all"
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
                        className="md:hidden p-2 rounded-xl text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-all"
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
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="md:hidden overflow-hidden bg-white/95 dark:bg-surface-950/95 backdrop-blur-xl border-t border-surface-200 dark:border-surface-800"
                    >
                        <ul className="px-6 py-4 space-y-1">
                            {navLinks.map((link, i) => (
                                <motion.li
                                    key={link.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
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
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
