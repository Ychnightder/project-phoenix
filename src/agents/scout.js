import dotenv from 'dotenv';
import { tavily } from '@tavily/core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

export async function searchNews(query) {
	console.log(`🔎 Scout en mission pour : ${query}...`);

	try {
		if (!TAVILY_API_KEY) throw new Error('Clé API Tavily manquante dans le .env');

		const client = tavily({ apiKey: TAVILY_API_KEY });

		const response = await client.search(query, {
			searchDepth: 'advanced', // Analyse profonde
			includeRawContent: true, // RÉCUPÈRE LE TEXTE COMPLET (crucial pour les 1000 mots)
			topic: 'news', // Force le mode actualités
			timeRange: 'day', // Fraîcheur absolue
		});

		const news = response.results
			// .filter(result => result.score > 0.5) // On élimine les résultats peu pertinents
			.sort((a, b) => b.score - a.score) // On met les meilleurs en premier
			.map(result => ({
				title: result.title,
				url: result.url,
				content: result.rawContent || result.content,
				score: result.score,
				category: query,
			}));

		return news.slice(0, 5);
	} catch (error) {
		console.error('❌ Erreur Scout :', error.message);
		return [];
	}
}
// searchNews('Dernières innovations IA 2026').then(console.log);
