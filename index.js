import { searchNews } from './src/agents/scout.js';
import { generateArticle } from './src/agents/architect.js';
import { deploy } from './src/agents/publisher.js';
import fs from 'fs';
import path from 'path';
import { topics } from './src/config.js';
async function main() {
	try {
		// 1. SCAN : Trouver des news
		// On peut varier le sujet dynamiquement
		// const topics = [...topics];

		const randomTopic = topics[Math.floor(Math.random() * topics.length)];

		const news = await searchNews(randomTopic);
		if (!news || news.length === 0) {
			console.log('Empty news, stopping...');
			return;
		}

		// 2. WRITE : Générer l'article (On prend le premier résultat)
		const article = await generateArticle(news[0]);
		if (!article) return;

		// 3. SAVE : Écrire le fichier dans le dossier Astro
		const blogDir = './src/content/blog';
		if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });

		const fileName = `${article.slug}.md`;
		const filePath = path.join(blogDir, fileName);

		const content = `---
title: "${article.title.replace(/"/g, "'")}"
pubDate: "${new Date().toISOString()}"
description: "Analyse sur ${article.title.replace(/"/g, "'")}"
category: "${article.category}" 
---
${article.body}

*Source: ${news[0].url}*
`;

		fs.writeFileSync(filePath, content);
		console.log(`📝 Article sauvegardé : ${fileName}`);

		// 4. DEPLOY : Envoyer sur GitHub
		 await deploy();
	} catch (error) {
		console.error('💀 Pipeline crash:', error);
	}
}

main();
