import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { affiliateMap } from '../config.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateArticle(newsData) {
	const { title, content, url } = newsData;

	console.log(`🧠 Génération de l'article pour : ${title}...`);

	const prompt = `
        Tu es un expert en technologie et un rédacteur SEO chevronné.
        Sujet de base (News) : ${title}
        Contenu de référence : ${content}
        Source : ${url}

        Instructions :
        1. Rédige un article de blog expert en Français.
        2. Ne fais pas un simple résumé, propose une analyse de l'impact de cette news.
        3. Format : Markdown (utilise des titres H2 et H3).
        4. Inclus une conclusion qui incite à la réflexion.
        5. Ne commence JAMAIS par "Voici un article" ou "En tant qu'IA". Entre directement dans le vif du sujet.
        6. Optimise le texte pour le SEO.
    `;

	try {
		const chatCompletion = await groq.chat.completions.create({
			messages: [{ role: 'user', content: prompt }],
			model: 'llama-3.3-70b-versatile', 
			temperature: 0.7,
		});

		let articleBody = chatCompletion.choices[0]?.message?.content || '';

		// --- INJECTION D'AFFILIATION ---
		// On boucle sur la map pour transformer les mots-clés en liens Markdown
		Object.keys(affiliateMap).forEach(key => {
			const regex = new RegExp(`\\b${key}\\b`, 'gi');
			articleBody = articleBody.replace(regex, `[${key}](${affiliateMap[key]})`);
		});

		return {
			title: title,
			body: articleBody,
			date: new Date().toISOString(),
			slug: title
				.toLowerCase()
				.replace(/[^\w ]+/g, '')
				.replace(/ +/g, '-'),
		};
	} catch (error) {
		console.error('❌ Erreur Groq :', error.message);
		return null;
	}
}