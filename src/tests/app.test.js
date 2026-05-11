// import { searchNews } from './src/agents/scout.js';
// import { generateArticle } from './src/agents/architect.js';
// import { generateHeroImage } from './src/agents/imager.js';
// import { deploy } from './src/agents/publisher.js';
// import fs from 'fs';
// import path from 'path';
// import { topics } from './src/config.js';





const rawResponseTest = `
    **TITRE:** Révolution plastique biodégradable
**SLUG:** plastique biodegradable
**CONTENU:**

L'importance de la création d'un plastique biodégradable par une adolescente de 18 ans ne peut être sous-estimée. En effet, cette innovation a le potentiel de révolutionner l'industrie du plastique et de contribuer à réduire les déchets plastiques qui polluent notre planète. L'utilisation de plastiques non biodégradables a des conséquences désastreuses sur l'environnement, notamment la pollution des océans, la destruction des écosystèmes et la menace pour la santé humaine. La création d'un plastique biodégradable est donc une étape cruciale vers un avenir plus durable.

Le contexte historique de cette innovation est marqué par une prise de conscience croissante de l'impact environnemental des plastiques non biodégradables. Les gouvernements, les entreprises et les individus ont commencé à chercher des solutions pour réduire les déchets plastiques et promouvoir des pratiques plus durables. La création de plastiques biodégradables est l'un des domaines de recherche les plus prometteurs, car il offre une alternative aux plastiques traditionnels qui peuvent prendre des siècles à se décomposer. Les scientifiques et les ingénieurs ont travaillé dur pour développer des matériaux qui peuvent se décomposer naturellement, sans nuire à l'environnement. La création d'Eco Purge, un plastique biodégradable qui peut se décomposer en quelques mois, est un exemple de ce progrès.

L'analyse technique détaillée de cette innovation révèle que le processus de création d'Eco Purge implique l'utilisation de bactéries génétiquement modifiées pour produire des enzymes qui décomposent les plastiques. Ce processus est complexe et nécessite une compréhension approfondie de la biologie moléculaire et de la chimie des polymères. La création d'Eco Purge est le résultat de plusieurs années de recherche et de développement, et elle représente un pas important vers la création de plastiques biodégradables qui peuvent être utilisés dans une variété d'applications, notamment les emballages, les sacs à ordures et les produits de consommation. La capacité d'Eco Purge à se décomposer en quelques mois est due à la présence d'enzymes qui décomposent les chaînes polymères qui composent le plastique. Ce processus est naturel et ne nécessite pas de conditions extrêmes, ce qui en fait une solution plus durable et plus respectueuse de l'environnement que les plastiques traditionnels.

Les enjeux et les conséquences de cette innovation sont importants, car elles ont le potentiel de révolutionner l'industrie du plastique et de contribuer à réduire les déchets plastiques qui polluent notre planète. L'utilisation de plastiques biodégradables comme Eco Purge peut réduire la quantité de déchets plastiques qui se retrouvent dans les océans et les écosystèmes, et contribuer à protéger la biodiversité. De plus, la création de plastiques biodégradables peut également contribuer à réduire les émissions de gaz à effet de serre qui sont associées à la production de plastiques traditionnels. Les consommateurs peuvent également bénéficier de cette innovation, car les plastiques biodégradables peuvent offrir une alternative plus durable et plus respectueuse de l'environnement aux plastiques traditionnels. Cependant, il est important de noter que la création de plastiques biodégradables est seulement l'un des pas vers un avenir plus durable, et qu'il est nécessaire de continuer à rechercher des solutions pour réduire les déchets plastiques et promouvoir des pratiques plus durables.

En conclusion, la création d'un plastique biodégradable par une adolescente de 18 ans est une innovation importante qui a le potentiel de révolutionner l'industrie du plastique et de contribuer à réduire les déchets plastiques qui polluent notre planète. La création d'Eco Purge est le résultat de plusieurs années de recherche et de développement, et elle représente un pas important vers la création de plastiques biodégradables qui peuvent être utilisés dans une variété d'applications. Les enjeux et les conséquences de cette innovation sont importants, car elles ont le potentiel de contribuer à réduire les déchets plastiques et à promouvoir des pratiques plus durables. Il est donc important de continuer à rechercher des solutions pour réduire les déchets plastiques et de promouvoir des pratiques plus durables, afin de créer un avenir plus durable pour les générations futures.

**KEYWORDS:** biodegradable plastic, sustainable future, environmental protection

`;

async function generateArticleContent(rawResponse = rawResponseTest) {
	try {

		// --- EXTRACTION INTELLIGENTE ---
		const finalTitle = rawResponse.split('TITRE:')[1]?.split('SLUG:')[0]?.trim() ;


		const finalSlug =
			rawResponse
				.split('SLUG:')[1]
				?.split('CONTENU:')[0]
				?.trim()
				.toLowerCase()
				.replace(/[^\w ]+/g, '')
				.replace(/ +/g, '-') ;


		const articleBody = rawResponse.split('CONTENU:')[1]?.split('KEYWORDS:')[0]?.trim() || '';

		const keywords =
			rawResponse
				.split('KEYWORDS:')[1]
				?.trim()
				.replace(/[\[\]]/g, '');


		return {
			title: finalTitle, // Le nouveau titre court
			body: articleBody,
			keywords: keywords,
			slug: finalSlug, // L'URL propre demandée par Google
			category:  'Tech',
		};
        
	} catch (error) {
		console.error('❌ Erreur Groq :', error.message);
		return null;
	}
}

// Test rapide
generateArticleContent();