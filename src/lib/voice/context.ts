import type { PortfolioData } from '../portfolio-data';

export interface VoiceKnowledge { config: Record<string, unknown>; portfolio: PortfolioData }
const ignored = new Set('the a an is are was were me my your you his her he she it can could would tell show explain about work projects experience what how with and for at to of in on does did have'.split(' '));
function words(value: string) { return value.toLowerCase().match(/[a-z0-9]+/g)?.filter(w => w.length > 1 && !ignored.has(w)) ?? []; }

// Small models have small context windows. Select owner content locally; never
// download embeddings or send questions to a retrieval service.
export function selectVoiceContext(knowledge: VoiceKnowledge, query: string): unknown {
  const { config, portfolio } = knowledge;
  const identity = { name: portfolio.name, titles: portfolio.titles, pitch: portfolio.pitch,
    location: portfolio.location, bio: portfolio.bio, interests: portfolio.interests,
    contact: portfolio.email, certifications: portfolio.certifications,
    education: config.education, availability: config.availability, currentlyLearning: config.currentlyLearning };
  const documents = [
    { kind: 'skills', data: config.techStack },
    ...portfolio.projects.map(data => ({ kind: 'project', data })),
    ...portfolio.experience.map(data => ({ kind: 'experience', data })),
  ];
  const tokens = new Set(words(query));
  const ranked = documents.map((document, index) => {
    const text = JSON.stringify(document);
    const terms = new Set(words(text));
    const score = [...tokens].reduce((sum, token) => sum + (terms.has(token) ? 1 : 0), 0);
    return { document, score, index };
  }).sort((a, b) => b.score - a.score || a.index - b.index);
  const selected = [];
  let size = JSON.stringify(identity).length;
  for (const item of ranked) {
    if (!item.score || selected.length >= 3) continue;
    const length = JSON.stringify(item.document).length;
    if (size + length > 5800) continue;
    selected.push(item.document); size += length;
  }
  return { identity, expertise: config.techStack, projectIndex: portfolio.projects.map(p => ({ title: p.title, company: p.company })), selected };
}
