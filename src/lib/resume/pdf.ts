import { jsPDF } from 'jspdf';
import type { ResumeSpec } from './build';

// Generate selectable text directly, independent of browser print support and theme.
export function createResumePdf(spec: ResumeSpec): jsPDF {
    const pdf = new jsPDF({ unit: 'pt', format: 'letter' });
    const margin = 44;
    const width = pdf.internal.pageSize.getWidth() - margin * 2;
    const bottom = pdf.internal.pageSize.getHeight() - margin;
    let y = margin;

    pdf.setProperties({ title: `${spec.name} - ${spec.roleTitle}`, author: spec.name });

    function ensureSpace(height: number) {
        if (y + height > bottom) {
            pdf.addPage();
            y = margin;
        }
    }

    function text(value: string, size = 10, bold = false, indent = 0) {
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        pdf.setFontSize(size);
        pdf.setTextColor(25, 35, 45);
        const lines = pdf.splitTextToSize(value.replace(/→/g, '->').replace(/←/g, '<-'), width - indent) as string[];
        for (const line of lines) {
            ensureSpace(size * 1.35);
            pdf.text(line, margin + indent, y + size);
            y += size * 1.35;
        }
        y += 3;
    }

    function section(title: string) {
        ensureSpace(65);
        y += 9;
        text(title.toUpperCase(), 11, true);
        y += 2;
    }

    function entry(title: string, detail?: string) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        const headingLines = pdf.splitTextToSize(title, width).length;
        ensureSpace(headingLines * 13.5 + (detail ? 16 : 0) + 30);
        text(title, 10, true);
        if (detail) text(detail, 9);
    }

    text(spec.name, 22, true);
    text(spec.roleTitle, 12);
    text([spec.contact.email, spec.contact.location, spec.contact.website].filter(Boolean).join(' | '), 9);
    text([spec.contact.github, spec.contact.linkedin].filter(Boolean).join(' | '), 9);

    section('Summary');
    text(spec.summary);
    section('Skills');
    for (const group of spec.skills) text(`${group.category}: ${group.items.join(', ')}`);
    section('Experience');
    for (const experience of spec.experience) {
        // Keep an ordinary job entry together; oversized entries can still paginate.
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const detailLines = pdf.splitTextToSize(
            [experience.period, experience.location].filter(Boolean).join(' | '), width
        ).length;
        const bulletHeight = experience.highlights.reduce((height, highlight) =>
            height + pdf.splitTextToSize(highlight, width - 10).length * 13.5 + 3, 0);
        pdf.setFont('helvetica', 'bold');
        const titleLines = pdf.splitTextToSize(`${experience.role} | ${experience.company}`, width).length;
        const height = titleLines * 13.5 + detailLines * 13.5 + bulletHeight + 11;
        if (height <= bottom - margin) ensureSpace(height);
        entry(`${experience.role} | ${experience.company}`,
            [experience.period, experience.location].filter(Boolean).join(' | '));
        for (const highlight of experience.highlights) {
            // Hanging indent keeps wrapped lines aligned with the bullet text.
            ensureSpace(13.5);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.text('•', margin, y + 10);
            text(highlight, 10, false, 10);
        }
        y += 5;
    }
    if (spec.selectedProjects.length) {
        section('Selected Projects');
        for (const project of spec.selectedProjects) {
            entry([project.title, project.company].filter(Boolean).join(' | '));
            text(project.line);
            y += 4;
        }
    }
    section('Education');
    for (const education of spec.education) {
        text(`${education.degree}, ${education.school} (${education.years})`);
    }
    if (spec.certifications.length) {
        section('Certifications');
        for (const certification of spec.certifications) text(certification);
    }
    return pdf;
}

export async function downloadResumePdf(spec: ResumeSpec): Promise<void> {
    const filename = `${spec.name}-Resume`.replace(/[^a-z0-9-]+/gi, '-');
    await createResumePdf(spec).save(`${filename}.pdf`, { returnPromise: true });
}
