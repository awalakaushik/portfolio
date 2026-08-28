// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://awalakaushik.dev',
  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: netlify()
});