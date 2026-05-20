import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateArticle(newsData) {
	const { title, content, url, category } = newsData;
	// Augmentation de la taille de la source brute (45 000 caractères) pour donner de la matière
	const truncatedContent = content ? content.substring(0, 45000) : 'Pas de contenu source disponible.';
	console.log(`🧠 Génération de l'article pour : ${title}...`);

	const prompt = `
        Tu es un rédacteur senior pour un grand média tech. 
        Sujet : ${title}
        Source : ${truncatedContent}

        MISSION : Rédige un dossier de fond de minimum 1000 mots au total en complétant rigoureusement chaque section du JSON demandé.
        
        RÈGLES D'OR :
        - Fais des paragraphes d'au moins 8 à 10 phrases pour densifier le contenu.
        - Utilise un vocabulaire complexe, analytique et technique.
        - INTERDICTION absolue d'utiliser des listes à puces ou d'insérer des titres de parties. Rédige uniquement en texte fluide et rédigé.
        - Si tu manques d'informations factuelles, analyse les implications logiques et macroéconomiques du sujet.
        - Si le total cumulé de tes sections fait moins de 950 mots, tu échoues à ta mission. Écris de longs développements.

        IMPORTANT : Ta réponse doit être UNIQUEMENT un objet JSON valide, sans aucune fioriture ni bloc de code Markdown (\`\`\`json).
        Les retours à la ligne à l'intérieur des chaînes de caractères doivent être échappés avec "\\n".

        FORMAT JSON À RESPECTER STRICTEMENT :
        {
          "title": "Titre accrocheur de max 10 mots",
          "slug": "3-5-mots-cles-en-minuscules-separes-par-des-tirets",
          "introduction": "Introduction stratégique analysant l'importance immédiate de cette news (minimum 150 mots).",
          "contexte": "Développement du contexte historique et faits antérieurs (minimum 250 mots).",
          "analyse_technique": "Décorticage technique complet du 'Comment' et du 'Pourquoi' (minimum 300 mots).",
          "enjeux": "Analyse des impacts profonds pour l'industrie et les consommateurs à l'horizon 2028 (minimum 250 mots).",
          "conclusion": "Conclusion synthétique avec ouverture prospective sur l'avenir du secteur (minimum 100 mots).",
          "keywords": "3 keywords in english for unsplash"
        }
    `;

	try {
		const chatCompletion = await groq.chat.completions.create({
			messages: [
				{
					role: 'system',
					content:
						'Tu es un assistant IA programmé pour répondre UNIQUEMENT par un objet JSON valide respectant les contraintes de tailles demandées.',
				},
				{
					role: 'user',
					content: prompt,
				},
			],
			model: process.env.MODEL_IA || 'llama-3.3-70b-versatile',
			temperature: 0.5, // Température stable pour maximiser le respect des consignes de longueur
			max_tokens: 4096, // Robinet grand ouvert pour laisser l'IA écrire plus de 1000 mots
			response_format: { type: 'json_object' }, // Force le mode JSON de l'API Groq
		});

		const rawResponse = chatCompletion.choices[0]?.message?.content || '';

		// --- EXTRACTION JSON SÉCURISÉE ---
		let data;
		try {
			const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
			const cleanJson = jsonMatch ? jsonMatch[0] : rawResponse;
			data = JSON.parse(cleanJson);
		} catch (e) {
			console.warn('⚠️ Échec du parsing JSON, bascule sur la structure de secours...');
			return {
				title: title,
				body: rawResponse, // Renvoie le brut sans balise Markdown si le formatage JSON a cassé
				keywords: 'technology',
				slug: title
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, '-')
					.replace(/(^-|-$)/g, '')
					.substring(0, 50),
				category: category || '',
			};
		}

		// --- RECOMPOSITION DU CORPS DE L'ARTICLE (TEXTE FLUIDE SANS TITRES) ---
		// Fusion des paragraphes avec un double retour à la ligne, sans aucune balise H2
		const fullBody = [data.introduction || '', data.contexte || '', data.analyse_technique || '', data.enjeux || '', data.conclusion || '']
			.filter(Boolean)
			.join('\n\n');

		// --- NETTOYAGE DU SLUG ---
		const finalSlug = (data.slug || title)
			.toLowerCase()
			.replace(/[^\w ]+/g, '') // Retire la ponctuation
			.trim()
			.replace(/ +/g, '-') // Remplace les espaces par des tirets
			.substring(0, 60);

		// --- LOG DE VÉRIFICATION ---
		const wordCount = fullBody.split(/\s+/).filter(Boolean).length;
		console.log(`✅ Article extrait avec succès : ${wordCount} mots.`);

		return {
			title: data.title || title,
			body: fullBody,
			keywords: data.keywords || 'news',
			slug: finalSlug,
			category: category || '',
		};
	} catch (error) {
		console.error('⏳ Erreur API ou Quota Groq atteint...', error.message);
		return null;
	}
}
