// src/agents/imager.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export async function generateHeroImage(keywords) {
	try {
		console.log(`📸 Recherche d'une image Unsplash pour : ${keywords}...`);

		// On nettoie les mots-clés (on prend les 3 premiers pour plus de précision)
		const query = encodeURIComponent(keywords);
		const url = `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${process.env.UNSPLASH_ACCESS_KEY}`;

		const response = await fetch(url);
		const data = await response.json();

		if (data.urls && data.urls.regular) {
			// regular est parfait pour le web (haute def mais optimisé)
			return data.urls.regular;
		}

		throw new Error('Format de réponse Unsplash inconnu');
	} catch (error) {
		console.error('❌ Erreur API Unsplash :', error.message);
		// Fallback sur une image tech générique si l'API échoue ou quota atteint
		return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1080&q=80';
	}
}
