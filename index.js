import { searchNews } from './src/agents/scout.js';
import { generateArticle } from './src/agents/architect.js';
import { generateHeroImage } from './src/agents/imager.js';
import { deploy } from './src/agents/publisher.js';
//import { phoenixAgent } from './src/pages/api/mailer.ts';
import fs from 'fs';
import path from 'path';
import { topics } from './src/config.js';
// // import { runMailer } from './src/pages/api/mailer.js';

async function main() {
	try {
		const randomTopic = topics[Math.floor(Math.random() * topics.length)];
		const news = await searchNews(randomTopic);

		if (!news || news.length === 0) {
			console.log('Empty news, stopping...');
			return;
		}

		for (const item of news) {
			try {
				const article = await generateArticle(item);

				if (!article) {
					console.log(`⏭️ News suivante...`);
					continue; // Passe à l'item suivant dans newsList
				}

				// console.log('🖋️ Article généré :', article);

				// --- AJOUT : GÉNÉRATION DE L'IMAGE ---
				// On utilise les keywords générés par Groq pour Unsplash
				const imageUrl = await generateHeroImage(article.keywords);

				const blogDir = './src/content/blog';

				if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });

				const fileName = `${article.slug}.md`;
				const filePath = path.join(blogDir, fileName);

				// --- CORRECTION : AJOUT DE heroImage DANS LE FRONTMATTER ---
				const content = `---
title: "${article.title.replace(/"/g, "'")}"
pubDate: "${new Date().toISOString()}"
description: "Analyse sur ${article.title.replace(/"/g, "'")}"
category: "${article.category}"
heroImage: "${imageUrl}"
---
${article.body}

*Source: ${item.url}*`;

				fs.writeFileSync(filePath, content);
				console.log(`📝 Article sauvegardé avec image : ${fileName}`);

				break; // On arrête après le premier article réussi pour éviter de surcharger l'API et le processus
			} catch (error) {
				console.error(`⚠️ Erreur sur cet item mais on continue :`, itemError.message);
				continue;
			}
		}

		// --- AJOUT : DÉPLOIEMENT APRÈS LA GÉNÉRATION ---
		await deploy();

		if(Math.random() < 0.5) {
			console.log('📧 Lancement de la diffusion newsletter...');

			//await phoenixAgent();
		}
	} catch (error) {
		await deploy();
		console.error('💀 Pipeline crash:', error);
	}
}

main();
