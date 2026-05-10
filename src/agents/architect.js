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
    Tu es un rédacteur senior pour un grand média tech. 
    Sujet : ${title}
    Source : ${content}

    MISSION : Rédige un dossier de fond de minimum 1000 mots.
    
    STRUCTURE OBLIGATOIRE (Développe chaque partie longuement) :
    1. Introduction stratégique : Analyse l'importance de cette news (150 mots).
    2. Contexte et Historique : Rappelle les faits qui ont mené à cette situation (250 mots).
    3. Analyse Technique Détaillée : Décortique le "Comment" et le "Pourquoi" (300 mots).
    4. Enjeux et Conséquences : Quel impact pour l'industrie et les consommateurs d'ici 2028 ? (250 mots).
    5. Conclusion avec ouverture (100 mots).

    RÈGLES D'OR :
    - Fais des paragraphes de 6 à 8 phrases minimum.
    - Utilise un vocabulaire complexe et technique.
    - INTERDICTION de faire des listes à puces. Rédige tout en texte fluide.
    - Si tu manques d'infos, analyse les implications logiques du sujet.

    FORMAT DE RÉPONSE :
    TITRE: [Max 10 mots]
    SLUG: [3-5 mots clés]
    CONTENU: [L'article]
    KEYWORDS: [3 mots clés]
`;

	try {
		const chatCompletion = await groq.chat.completions.create({
			messages: [{ role: 'user', content: prompt }],
			model: 'llama-3.3-70b-versatile',
			temperature: 0.6, 
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
