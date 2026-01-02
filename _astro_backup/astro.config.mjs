// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://beez.ly',
  output: 'static',
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      langs: ['javascript', 'typescript', 'bash', 'sh', 'yaml', 'hcl', 'go', 'python', 'ruby'],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});