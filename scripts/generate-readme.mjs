#!/usr/bin/env node
/**
 * Generates a GitHub profile README.md from the shared bio.json data.
 * 
 * Usage:
 *   node scripts/generate-readme.mjs
 *   # Outputs to stdout by default, or pass --out to write to file:
 *   node scripts/generate-readme.mjs --out README.md
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bio = JSON.parse(readFileSync(resolve(__dirname, '../src/data/bio.json'), 'utf-8'));

const techBadges = Object.entries(bio.techStack)
    .flatMap(([, techs]) => techs)
    .map((tech) => {
        const slug = tech.toLowerCase().replace(/[^a-z0-9]/g, '');
        return `![${tech}](https://img.shields.io/badge/${encodeURIComponent(tech)}-333?style=flat-square&logo=${slug}&logoColor=white)`;
    })
    .join(' ');

const readme = `# ${bio.greeting}

${bio.bio.join('\n\n')}

## 🛠️ Tech Stack

${techBadges}

## 🌱 Currently Learning

${bio.currentlyLearning.map((item) => `- ${item}`).join('\n')}

## 🎯 Interests

${bio.interests.map((item) => `- ${item}`).join('\n')}

## 🏅 Certifications

${bio.certifications.map((cert) => `- ${cert}`).join('\n')}

## 📫 Connect

- 🌐 [${bio.website}](${bio.website})
- 💼 [LinkedIn](https://linkedin.com/in/${bio.social.linkedin})
- 🐦 [X / Twitter](https://x.com/${bio.social.twitter})
- 📧 [${bio.email}](mailto:${bio.email})

---

*This README is auto-generated from my [portfolio site](${bio.website}). ✨*
`;

const outFlag = process.argv.indexOf('--out');
if (outFlag !== -1 && process.argv[outFlag + 1]) {
    const outPath = resolve(process.cwd(), process.argv[outFlag + 1]);
    writeFileSync(outPath, readme);
    console.log(`✅ README written to ${outPath}`);
} else {
    process.stdout.write(readme);
}
