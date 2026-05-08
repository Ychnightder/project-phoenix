import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { affiliateMap } from '../config.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


export async function generateArticle(newsData) {
	const { title, content, url, category } = newsData;
	console.log(`🧠 Génération de l'article pour : ${title}...`);

	const prompt = `
        Tu es un expert en technologie et un rédacteur SEO chevronné.
        Sujet de base (News) : ${title}
        Contenu de référence : ${content}
        Source : ${url}
        Catégorie : ${category}

        Instructions :
        1. Rédige un article de blog expert en Français.
        2. Ne fais pas un simple résumé, propose une analyse de l'impact de cette news.
        3. Format : Markdown (utilise des titres H2 et H3).
        4. Inclus une conclusion qui incite à la réflexion.
        5. Ne commence JAMAIS par "Voici un article" ou "En tant qu'IA". Entre directement dans le vif du sujet.
        6. Optimise le texte pour le SEO.
        7. À la toute fin, ajoute EXACTEMENT cette balise avec 3 mots-clés en anglais séparés par des virgules :
           KEYWORDS: [keyword1, keyword2, keyword3]
    `;

	try {
		const chatCompletion = await groq.chat.completions.create({
			messages: [{ role: 'user', content: prompt }],
			model: 'llama-3.3-70b-versatile',
			temperature: 0.7,
		});

		let rawContent = chatCompletion.choices[0]?.message?.content || '';

		// --- CORRECTION : EXTRACTION DES MOTS-CLÉS ---
		// On découpe rawContent d'abord, puis on définit articleBody
		const parts = rawContent.split('KEYWORDS:');
		let articleBody = parts[0].trim();
		const keywords = parts[1] ? parts[1].trim().replace(/[\[\]]/g, '') : 'technology,abstract';

		// // --- INJECTION D'AFFILIATION ---
		// Object.keys(affiliateMap).forEach(key => {
		// 	const regex = new RegExp(`\\b${key}\\b`, 'gi');
		// 	articleBody = articleBody.replace(regex, `[${key}](${affiliateMap[key]})`);
		// });

		return {
			title: title,
			body: articleBody,
			keywords: keywords, // Bien renvoyer les mots-clés pour l'image
			slug: title
				.toLowerCase()
				.replace(/[^\w ]+/g, '')
				.replace(/ +/g, '-'),
			category: category || 'Général',
		};
	} catch (error) {
		console.error('❌ Erreur Groq :', error.message);
		return null;
	}
}