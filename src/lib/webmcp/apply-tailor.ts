import type { TailorState } from '../stores';

// Mutates the static Astro-rendered DOM to reflect an agent's tailor_view
// request. Original text is stashed in data-tailor-original so reset_view can
// revert without a reload. Re-run on every astro:page-load because a View
// Transition swaps in fresh static HTML.

export function applyTailor(state: TailorState | null) {
    const targets = document.querySelectorAll<HTMLElement>('[data-tailor]');
    for (const el of targets) {
        if (el.dataset.tailorOriginal === undefined) {
            el.dataset.tailorOriginal = el.textContent ?? '';
        }
        if (state === null) {
            el.textContent = el.dataset.tailorOriginal;
            continue;
        }
        const kind = el.dataset.tailor;
        if (kind === 'headline') el.textContent = state.headline;
        else if (kind === 'subhead') el.textContent = state.subhead;
    }

    // Reorder + dim project cards wherever a grid exists on the current page.
    const grids = document.querySelectorAll<HTMLElement>('[data-project-grid]');
    for (const grid of grids) {
        const cards = [...grid.querySelectorAll<HTMLElement>('[data-slug]')];
        if (state === null) {
            for (const card of cards) card.classList.remove('tailor-dimmed');
            const original = cards.sort(
                (a, b) => Number(a.dataset.originalIndex ?? 0) - Number(b.dataset.originalIndex ?? 0)
            );
            for (const card of original) grid.appendChild(card);
            continue;
        }
        cards.forEach((card, i) => {
            if (card.dataset.originalIndex === undefined) card.dataset.originalIndex = String(i);
        });
        const rank = new Map(state.rankedSlugs.map((slug, i) => [slug, i]));
        const sorted = cards.sort(
            (a, b) => (rank.get(a.dataset.slug ?? '') ?? 99) - (rank.get(b.dataset.slug ?? '') ?? 99)
        );
        for (const card of sorted) {
            card.classList.toggle('tailor-dimmed', state.dimmedSlugs.includes(card.dataset.slug ?? ''));
            grid.appendChild(card);
        }
    }
}
