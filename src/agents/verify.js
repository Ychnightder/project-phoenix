import fs from 'fs';
import path from 'path';

// Chemin vers ton dossier d'articles (à adapter si besoin)
const articlesDir = '../content/blog';

function checkArticles() {
	console.log('🔍 Analyse de la qualité des articles pour AdSense...\n');

	if (!fs.existsSync(articlesDir)) {
		console.error('❌ Dossier introuvable :', articlesDir);
		return;
	}

	const files = fs.readdirSync(articlesDir).filter(file => file.endsWith('.md') || file.endsWith('.mdoc'));
	let validCount = 0;
	let shortCount = 0;
	let badSlugCount = 0;

	files.forEach(file => {
		const filePath = path.join(articlesDir, file);
		const content = fs.readFileSync(filePath, 'utf-8');

		// Comptage des mots (approximation)
		const wordCount = content.split(/\s+/).length;

		// Vérification du Slug (nom du fichier)
		const isLongSlug = file.length > 60;

		console.log(`-----------------------------------`);
		console.log(`📄 Fichier : ${file}`);
		console.log(`📊 Mots : ${wordCount} ${wordCount < 800 ? '⚠️ TROP COURT' : '✅ OK'}`);

		if (isLongSlug) {
			console.log(`🔗 Slug : ⚠️ TROP LONG (${file.length} caractères)`);
			badSlugCount++;
		} else {
			console.log(`🔗 Slug : ✅ PROPRE`);
		}

		if (wordCount < 800) {
			shortCount++;
		} else {
			validCount++;
		}
	});

	console.log(`\n===================================`);
	console.log(`📊 RAPPORT FINAL :`);
	console.log(`✅ Articles conformes (800+ mots) : ${validCount}`);
	console.log(`⚠️ Articles trop courts : ${shortCount}`);
	console.log(`🔗 Slugs trop longs à corriger : ${badSlugCount}`);
	console.log(`Total analysé : ${files.length}`);

	if (shortCount > 0) {
		console.log(
			`\n💡 Conseil : Si trop d'articles sont courts, augmente la température ou précise "DÉVELOPPE DAVANTAGE" dans le prompt de l'Architecte.`
		);
	}
}

checkArticles();
