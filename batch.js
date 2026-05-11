import { execSync } from 'child_process';

const TOTAL_ARTICLES = 50;

async function runBatch() {
	console.log(`🚀 Début de la génération massive : ${TOTAL_ARTICLES} articles.`);

	for (let i = 1; i <= TOTAL_ARTICLES; i++) {
		try {
			console.log(`\n-----------------------------------`);
			console.log(`📝 Génération article n°${i} / ${TOTAL_ARTICLES}...`);

			// On lance node index.js et on affiche la sortie dans la console
			execSync('node index.js', { stdio: 'inherit' });

			console.log(`✅ Article ${i} terminé avec succès.`);
		} catch (error) {
			console.error(`❌ Erreur lors de l'article ${i}:`, error.message);
			// On continue quand même la boucle même s'il y a une erreur sur un article
		}
	}

	console.log(`\n===================================`);
	console.log(`🎉 Mission accomplie : ${TOTAL_ARTICLES} tentatives terminées.`);
}

runBatch();
