import dotenv from 'dotenv';
import { tavily } from '@tavily/core';
import path from 'path';
import { fileURLToPath } from 'url';
import { ca } from 'zod/locales';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

export async function searchNews(query) {
	console.log(`🔎 Recherche de news pour : ${query}...`);

	try {
		// Validation de la clé
		if (!TAVILY_API_KEY) throw new Error('Clé API Tavily manquante dans le .env');

		const client = tavily({ apiKey: TAVILY_API_KEY });

		// Appel API (correction du .then qui bloquait la variable)
		const response = await client.search(query, {
			includeAnswer: 'advanced',
			searchDepth: 'advanced',
			maxResults: 5,
			timeRange: 'day',
		});

		// Mapping sécurisé
		const news = response.results.map(result => ({
			title: result.title,
			url: result.url,
			content: result.content,
			score: result.score,
			category: query,
		}));

		console.log(`✅ ${news.length} opportunités trouvées.`);
		return news;
	} catch (error) {
		console.error('❌ Erreur lors du sourcing :', error.message);
		return [];
	}
}
// Test rapide
// searchNews('Dernières innovations IA 2026').then(console.log);
