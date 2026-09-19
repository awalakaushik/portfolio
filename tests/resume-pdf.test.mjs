import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createResumePdf } from '../src/lib/resume/pdf.ts';

const spec = {
    name: 'Test Engineer', roleTitle: 'Tailored Coding Agent Engineer',
    contact: { email: 'test@example.com', location: 'Houston, TX', website: 'https://example.com', github: 'github.com/example', linkedin: 'linkedin.com/in/example' },
    summary: 'Automation and API reliability experience.',
    skills: [{ category: 'Languages', items: ['TypeScript', 'C#'] }],
    experience: [{ company: 'Example', role: 'Engineer', period: '2023 - Present', highlights: ['Built reliable systems.'] }],
    selectedProjects: [{ title: 'Automation', line: 'Integrated evaluation workflows.' }],
    education: [{ school: 'Example University', degree: 'Master degree', years: '2016-2018' }],
    certifications: ['Azure Fundamentals'], generatedAt: '2026-09-19',
};

test('exports the active tailored resume as a selectable-text PDF', () => {
    const pdf = createResumePdf(spec);
    const output = pdf.output();
    assert.ok(output.startsWith('%PDF-'));
    for (const text of [spec.roleTitle, spec.contact.email, spec.summary, 'Built reliable systems.', 'Integrated evaluation workflows.', 'Azure Fundamentals']) {
        assert.ok(output.includes(text), `Missing PDF content: ${text}`);
    }
    assert.equal(pdf.getNumberOfPages(), 1);
});

test('paginates long experience while preserving the final sections', () => {
    const long = { ...spec, experience: Array.from({ length: 30 }, (_, i) => ({
        ...spec.experience[0], company: `Company ${i}`,
        highlights: ['A long achievement describing reliable cloud applications and automated workflows. '.repeat(8)],
    })) };
    const pdf = createResumePdf(long);
    assert.ok(pdf.getNumberOfPages() > 1);
    assert.ok(pdf.output().includes('Company 29'));
    assert.ok(pdf.output().includes('Azure Fundamentals'));
});

test('supports resumes without optional projects, certifications, or job location', () => {
    const pdf = createResumePdf({ ...spec, selectedProjects: [], certifications: [] });
    assert.ok(!pdf.output().includes('SELECTED PROJECTS'));
    assert.ok(!pdf.output().includes('undefined'));
});

 test('renders project migration arrows with standard PDF fonts', () => {
    const pdf = createResumePdf({ ...spec, selectedProjects: [{ title: 'Migration', line: 'Legacy → Modern' }] });
    assert.ok(pdf.output().includes('Legacy -> Modern'));
});
