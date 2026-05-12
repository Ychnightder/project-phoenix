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
	const truncatedContent = content ? content.substring(0, 7000) : 'Pas de contenu source disponible.';
	console.log(`🧠 Génération de l'article pour : ${title}...`);

	const prompt = `
        Tu es un rédacteur senior pour un grand média tech. 
        Sujet : ${title}
        Source : ${truncatedContent}

        MISSION : Rédige un dossier de fond de minimum 1000 mots.
        
        STRUCTURE OBLIGATOIRE (Développe chaque partie longuement) :
        1. Introduction stratégique : Analyse l'importance de cette news (150 mots).
        2. Contexte et Historique : Rappelle les faits qui ont mené à cette situation (250 mots).
        3. Analyse Technique Détaillée : Décortique le "Comment" et le "Pourquoi" (300 mots).
        4. Enjeux et Conséquences : Quel impact pour l'industrie et les consommateurs d'ici 2028 ? (250 mots).
        5. Conclusion avec ouverture (100 mots).

        RÈGLES D'OR :
        - Fais des paragraphes de 8 à 10 phrases minimum.
        - Utilise un vocabulaire complexe et technique.
        - INTERDICTION de faire des listes à puces. Rédige tout en texte fluide.
        - Si tu manques d'infos, analyse les implications logiques du sujet.

        IMPORTANT : Ta réponse doit être UNIQUEMENT un objet JSON valide. 
        Ne fournis aucune explication avant ou après le JSON.
        Les retours à la ligne dans le corps de l'article doivent être écrits comme des "\\n".

        FORMAT JSON À RESPECTER :
        {
          "title": "Titre de max 10 mots",
          "slug": "3-5-mots-cles-en-minuscules",
          "body": "Le texte intégral de l'article (1000 mots min)",
          "keywords": "3 keywords in english for unsplash"
        }
    `;

	try {
		const chatCompletion = await groq.chat.completions.create({
			messages: [{ role: 'user', content: prompt }],
			model: process.env.MODEL_IA || 'llama-3.3-70b-versatile',
			temperature: 0.6,
		});

		const rawResponse = chatCompletion.choices[0]?.message?.content || '';

		// --- EXTRACTION JSON SÉCURISÉE ---
		let data;
		try {
			// On cherche le bloc JSON entre les premières et dernières accolades
			const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
			const cleanJson = jsonMatch ? jsonMatch[0] : rawResponse;
			data = JSON.parse(cleanJson);
		} catch (e) {
			console.warn('⚠️ Échec du parsing JSON, tentative de secours par texte brut...');
			// Si le JSON échoue, on renvoie une structure minimale pour ne pas tout casser
			return {
				title: title,
				body: rawResponse.substring(0, 500), // On met un bout de la réponse pour voir
				keywords: 'technology',
				slug: title.toLowerCase().replace(/ +/g, '-').substring(0, 50),
				category: category || '',
			};
		}

		// --- NETTOYAGE DU SLUG ---
		const finalSlug = (data.slug || title)
			.toLowerCase()
			.replace(/[^\w ]+/g, '')
			.replace(/ +/g, '-')
			.substring(0, 60);

		// --- LOG DE VÉRIFICATION ---
		const wordCount = (data.body || '').split(/\s+/).length;
		console.log(`✅ Article extrait : ${wordCount} mots.`);

		return {
			title: data.title || title,
			body: data.body || '',
			keywords: data.keywords || 'news',
			slug: finalSlug,
			category: category || '',
		};
	} catch (error) {
		console.error('❌ Erreur Groq :', error.message);
		return null;
	}
}