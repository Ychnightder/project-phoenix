import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [tailwindcss(), '@tailwindcss/forms'], // Ajout du plugin forms de Tailwind
	},
});