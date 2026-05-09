import Groq from 'groq-sdk';
import dotenv from 'dotenv';
// import { affiliateMap } from '../config.js'; // Garde-le au cas où

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateArticle(newsData) {
	const { title, content, url, category } = newsData;
	console.log(`🧠 Génération de l'article pour : ${title}...`);

	// On demande à l'IA de renvoyer un bloc JSON structuré pour être sûr de bien séparer le titre, le slug et le contenu
const prompt = `
        Tu es un rédacteur SEO expert spécialisé dans les articles de fond (long-form content).
        Sujet : ${title}
        Contenu de référence : ${content}
        
        OBJECTIF : Rédiger un article complet de minimum 800 mots.
        
        STRUCTURE DE L'ARTICLE :
        1. Introduction captivante (100 mots) : Présente l'enjeu et pourquoi c'est important aujourd'hui.
        2. Analyse contextuelle (200 mots) : Explique le contexte technologique ou économique lié à cette news.
        3. Détails de l'annonce/sujet (250 mots) : Décortique les informations de la source de manière approfondie.
        4. Perspectives et Impact (200 mots) : Quelles sont les conséquences pour le futur, les entreprises ou les utilisateurs ?
        5. Conclusion (50 mots) : Un résumé avec une ouverture.

        CONSIGNES :
        - Style : Journalistique, riche, vocabulaire varié.
        - INTERDICTION de faire des listes à puces trop longues. Privilégie des paragraphes de 5 à 6 phrases.
        - Utilise des transitions fluides entre les parties.
        
        FORMAT DE RÉPONSE :
        TITRE: [Titre de moins de 10 mots]
        SLUG: [Slug de 3 à 6 mots]
        CONTENU: [Le corps de l'article avec balises H2 et H3. Minimum 800 mots.]
        KEYWORDS: [keyword1, keyword2, keyword3]
    `;

	try {
		const chatCompletion = await groq.chat.completions.create({
			messages: [{ role: 'user', content: prompt }],
			model: 'llama-3.3-70b-versatile',
			temperature: 0.6, // Un peu plus bas pour plus de sérieux
		});

		const rawResponse = chatCompletion.choices[0]?.message?.content || '';

		// --- EXTRACTION INTELLIGENTE ---
		const finalTitle = rawResponse.split('TITRE:')[1]?.split('SLUG:')[0]?.trim() || title;
		const finalSlug =
			rawResponse
				.split('SLUG:')[1]
				?.split('CONTENU:')[0]
				?.trim()
				.toLowerCase()
				.replace(/[^\w ]+/g, '')
				.replace(/ +/g, '-') || title.toLowerCase().replace(/ +/g, '-');

		const articleBody = rawResponse.split('CONTENU:')[1]?.split('KEYWORDS:')[0]?.trim() || '';
		const keywords =
			rawResponse
				.split('KEYWORDS:')[1]
				?.trim()
				.replace(/[\[\]]/g, '') || 'tech,news';

		return {
			title: finalTitle, // Le nouveau titre court
			body: articleBody,
			keywords: keywords,
			slug: finalSlug, // L'URL propre demandée par Google
			category: category || 'Tech',
		};
	} catch (error) {
		console.error('❌ Erreur Groq :', error.message);
		return null;
	}
}
