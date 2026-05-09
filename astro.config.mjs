import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, './.env') });

// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [tailwindcss(), '@tailwindcss/forms'], // Ajout du plugin forms de Tailwind
	},
	site: process.env.SITE_URL || '',
	integrations: [sitemap()],
});