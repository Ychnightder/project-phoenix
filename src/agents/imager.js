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
		const query = encodeURIComponent(`${keywords} technology`);
		// const url = `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${process.env.UNSPLASH_ACCESS_KEY}`;
		const url = `https://api.unsplash.com/search/photos?query=${query}&orientation=landscape&per_page=1&client_id=${process.env.UNSPLASH_ACCESS_KEY}`;
		const response = await fetch(url);
		const data = await response.json();

		if (data.results && data.results.length > 0) {
			const image = data.results[0];
			const imageUrl = image.urls.regular || image.urls.full;

			if (imageUrl) {
				// console.log(`✅ Image trouvée : ${imageUrl}`);
				return imageUrl;
			}
		}
		console.warn(`⚠️ Aucun résultat pour "${keywords}", tentative avec un mot-clé générique...`);

		return '/1920x1080.svg'; // Image tech pro par défaut
	} catch (error) {
		console.error('❌ Erreur API Unsplash :', error.message);
		// Fallback sur une image tech générique si l'API échoue ou quota atteint
				return '/1920x1080.svg';
	}
}
