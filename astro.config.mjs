import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


import vercel from '@astrojs/vercel';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, './.env') });

export default defineConfig({
  site: process.env.SITE_URL || 'https://phenix-blog.vercel.app',
  vite: {
      plugins: [tailwindcss()],
	},
  integrations: [sitemap()],
  adapter: vercel(),
});