import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders'; // Nouvelle méthode pour v6

const blog = defineCollection({
	// Le loader va chercher tous les fichiers .md dans src/content/blog/
	loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		category: z.string().default('Général'),
	}),
});

export const collections = { blog };
