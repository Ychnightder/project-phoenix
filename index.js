import { searchNews } from './src/agents/scout.js';
import { generateArticle } from './src/agents/architect.js';
import fs from 'fs';

async function runPipeline() {
	// 1. On cherche
	const newsList = await searchNews('Dernières innovations IA 2026');

	if (newsList.length === 0) return;

	// 2. On prend la meilleure news (ou on boucle sur la liste)
	const bestNews = newsList[0];
	const finalArticle = await generateArticle(bestNews);

	if (finalArticle) {
		// 3. On sauvegarde en Markdown pour Astro
		const fileName = `./src/content/blog/${finalArticle.slug}.md`;

		const fileContent = `---
title: "${finalArticle.title}"
pubDate: ${finalArticle.date}
description: "Analyse sur : ${finalArticle.title}"
---

${finalArticle.body}

---
*Source originale : [Consulter l'article](${bestNews.url})*
`;

		fs.writeFileSync(fileName, fileContent);
		console.log(`🚀 Article généré avec succès : ${fileName}`);
	}
}

runPipeline();





//kjk
