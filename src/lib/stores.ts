import { atom } from 'nanostores';
import type { FitReport } from './matching/score';
import type { ResumeSpec } from './resume/build';

export interface TailorState {
    roleTitle: string;
    emphasizeSkills: string[];
    // slugs ranked most→least relevant; low-relevance slugs get dimmed
    rankedSlugs: string[];
    dimmedSlugs: string[];
    headline: string;
    subhead: string;
}

export interface InquiryDraft {
    senderName: string;
    senderEmail: string;
    company?: string;
    message: string;
}

export const $fitReport = atom<FitReport | null>(null);
export const $tailor = atom<TailorState | null>(null);
export const $inquiryDraft = atom<InquiryDraft | null>(null);
export const $resumeSpec = atom<ResumeSpec | null>(null);

// sessionStorage mirrors let state survive a hard reload within the visit and
// let /contact and /resume pick up drafts created on other pages.
const KEYS = {
    tailor: 'agent-tailor',
    inquiry: 'agent-inquiry',
    resume: 'agent-resume',
} as const;

function persist(key: string, value: unknown) {
    try {
        if (value === null) sessionStorage.removeItem(key);
        else sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* storage unavailable — overlays still work in-memory */
    }
}

export function readSession<T>(key: keyof typeof KEYS): T | null {
    try {
        const raw = sessionStorage.getItem(KEYS[key]);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

export function initStoresFromSession() {
    const tailor = readSession<TailorState>('tailor');
    if (tailor) $tailor.set(tailor);
    const resume = readSession<ResumeSpec>('resume');
    if (resume) $resumeSpec.set(resume);
    const inquiry = readSession<InquiryDraft>('inquiry');
    if (inquiry) $inquiryDraft.set(inquiry);
}

// listen (not subscribe): subscribe fires immediately with the initial null,
// which would wipe the sessionStorage mirror on every fresh page load before
// initStoresFromSession / ResumeView can read it.
$tailor.listen((v) => persist(KEYS.tailor, v));
$inquiryDraft.listen((v) => persist(KEYS.inquiry, v));
$resumeSpec.listen((v) => persist(KEYS.resume, v));
