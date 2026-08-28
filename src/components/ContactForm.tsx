import { useState, useEffect, type FormEvent } from 'react';
import { $inquiryDraft, readSession, type InquiryDraft } from '../lib/stores';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
    const [status, setStatus] = useState<FormStatus>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    // Draft composed by a visiting agent via the compose_inquiry WebMCP tool.
    // The human always reviews and submits — the tool never sends.
    const [fields, setFields] = useState({ name: '', email: '', company: '', message: '' });
    const [agentComposed, setAgentComposed] = useState(false);

    useEffect(() => {
        const adopt = (draft: InquiryDraft | null) => {
            if (!draft) return;
            setFields({
                name: draft.senderName,
                email: draft.senderEmail,
                company: draft.company ?? '',
                message: draft.message,
            });
            setAgentComposed(true);
        };
        adopt(readSession<InquiryDraft>('inquiry'));
        return $inquiryDraft.subscribe(adopt);
    }, []);

    const setField = (key: keyof typeof fields) => (e: { target: { value: string } }) =>
        setFields((f) => ({ ...f, [key]: e.target.value }));

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus('submitting');
        setErrorMsg('');

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData as any).toString(),
            });

            if (response.ok) {
                setStatus('success');
                form.reset();
                setFields({ name: '', email: '', company: '', message: '' });
                setAgentComposed(false);
                $inquiryDraft.set(null);
            } else {
                throw new Error(`Server responded with ${response.status}`);
            }
        } catch (err) {
            setStatus('error');
            setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        }
    }

    if (status === 'success') {
        return (
            <div className="glass-card p-10 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-surface-900 dark:text-white">
                    Message Sent!
                </h3>
                <p className="text-surface-600 dark:text-surface-400 text-sm">
                    Thank you for reaching out. I'll get back to you as soon as possible.
                </p>
                <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2"
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <form
            name="contact"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {/* Hidden fields for Netlify */}
            <input type="hidden" name="form-name" value="contact" />
            <input type="hidden" name="agent_composed" value={agentComposed ? 'true' : 'false'} />
            <p className="hidden">
                <label>Don't fill this out: <input name="bot-field" /></label>
            </p>

            {agentComposed && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-start justify-between gap-3">
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                        This draft was composed by an AI agent on your behalf. Review it carefully before sending.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setFields({ name: '', email: '', company: '', message: '' });
                            setAgentComposed(false);
                            $inquiryDraft.set(null);
                        }}
                        className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline shrink-0"
                    >
                        Discard
                    </button>
                </div>
            )}

            {/* Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Name <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={fields.name}
                    onChange={setField('name')}
                    disabled={status === 'submitting'}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900/50 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-600 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-all disabled:opacity-50"
                    placeholder="John Doe"
                />
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Email <span className="text-red-400">*</span>
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={fields.email}
                    onChange={setField('email')}
                    disabled={status === 'submitting'}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900/50 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-600 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-all disabled:opacity-50"
                    placeholder="john@company.com"
                />
            </div>

            {/* Company (optional) */}
            <div>
                <label htmlFor="company" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Company <span className="text-surface-400 dark:text-surface-600">(optional)</span>
                </label>
                <input
                    type="text"
                    id="company"
                    name="company"
                    value={fields.company}
                    onChange={setField('company')}
                    disabled={status === 'submitting'}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900/50 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-600 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-all disabled:opacity-50"
                    placeholder="Acme Inc."
                />
            </div>

            {/* Message */}
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Message <span className="text-red-400">*</span>
                </label>
                <textarea
                    id="message"
                    name="message"
                    required
                    value={fields.message}
                    onChange={setField('message')}
                    rows={5}
                    disabled={status === 'submitting'}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900/50 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-600 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 dark:focus:border-primary-500 outline-none transition-all resize-none disabled:opacity-50"
                    placeholder="I'd like to request your resume / discuss a project opportunity..."
                />
            </div>

            {/* Error message */}
            {status === 'error' && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {errorMsg || 'Something went wrong. Please try again or email me directly.'}
                    </p>
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={status === 'submitting'}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-all hover:shadow-lg hover:shadow-primary-500/25 active:scale-[0.98] w-full md:w-auto justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {status === 'submitting' ? (
                    <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending...
                    </>
                ) : (
                    <>
                        Send Message
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </>
                )}
            </button>
        </form>
    );
}
