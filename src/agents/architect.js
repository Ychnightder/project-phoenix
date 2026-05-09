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
        ### RÔLE
			Tu es un rédacteur SEO Senior et un stratège de contenu. Ta mission est de transformer une actualité brute en un article de fond faisant autorité, optimisé pour le positionnement Google et l'engagement utilisateur.

		### DONNÉES D'ENTRÉE
			- **Sujet (News)** : ${title}
			- **Contenu de référence** : ${content}
			- **Source** : ${url}
			- **Catégorie** : ${category}

		### 1. STRUCTURE ET FORMATAGE STRICT
			- **TITRE (H1)** : Maximum 10 mots. Il doit être humain, percutant et inclure le mot-clé principal. Pas de clickbait vulgaire, mais une promesse forte.
			- **SLUG** : Génère un slug court (3 à 6 mots) séparés par des tirets. Supprime TOUS les stop-words (le, la, de, et, un, pour, dans). Ex: "impact-ia-secteur-immobilier-2026".
			- **HIÉRARCHIE** : Utilise exclusivement des balises H2 et H3 pour structurer le récit.
			- **PARAGRAPHES** : Rédige des paragraphes denses (4 à 6 lignes). Interdiction d'utiliser des listes à puces. Le texte doit être fluide et narratif.
			- **SCANNABILITÉ** : Applique du gras (**bold**) sur les termes techniques, chiffres clés ou concepts essentiels pour faciliter la lecture rapide.

		### 2. STRATÉGIE RÉDACTIONNELLE (E-E-A-T)
			- **ACCROCHE (Hook)** : Entre directement dans le vif du sujet. La première phrase doit captiver ou poser un constat fort. Ne commence JAMAIS par "Voici un article" ou "Dans cet article".
			- **MÉTHODE PYRAMIDE INVERSÉE** : Place l'information la plus importante (Qui, Quoi, Où, Quand, Pourquoi) dans les deux premiers paragraphes.
			- **ANALYSE D'IMPACT** : Ne te contente pas de résumer. Analyse les conséquences de cette news pour le secteur (${category}) et projette-toi sur les évolutions futures.
			- **VOCABULAIRE** : Utilise un champ sémantique riche et varié. Évite les répétitions. Utilise des verbes d'action et la voix active pour dynamiser le texte.

		### 3. OPTIMISATION SEO
			- **DENSITÉ** : Intègre le mot-clé principal naturellement dans le premier paragraphe et dans au moins un H2.
			- **COHÉRENCE** : Assure-toi que le ton correspond parfaitement à la catégorie "${category}".
			- **ZÉRO IA-FOOTPRINT** : Évite les expressions clichés d'IA comme "il est important de noter", "en conclusion", "dans le monde d'aujourd'hui" ou "explorez les possibilités".

		### 4. SORTIE ATTENDUE
			[Titre H1]
			[Slug]
			---
			[Corps de l'article structuré avec H2 et H3]
			---
			KEYWORDS: [keyword1, keyword2, keyword3] (En anglais, séparés par des virgules)`;

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
