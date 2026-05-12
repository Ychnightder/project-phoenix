/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdoc,svelte,ts,tsx,vue}'],
	darkMode: 'class', 
	theme: {
		extend: {},
	},
	plugins: [require('@tailwindcss/typography')],
};
