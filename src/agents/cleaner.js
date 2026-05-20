import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });


const CONTENT_DIR = '../content/blog'; 


function cleanSlugs() {
	const files = fs.readdirSync(CONTENT_DIR);
	let fixedCount = 0;

	files.forEach(file => {
		if (!file.endsWith('.md')) return;

		let newName = file;

		// 1. Enlever les tirets ou caractères bizarres au début
		newName = newName.replace(/^[-_]+/, '');

		let nameWithoutExt = newName.replace('.md', '');
		if (nameWithoutExt.length > 50) {
			nameWithoutExt = nameWithoutExt.substring(0, 50);
			// Éviter de couper un mot en deux
			const lastDash = nameWithoutExt.lastIndexOf('-');
			if (lastDash > 30) {
				nameWithoutExt = nameWithoutExt.substring(0, lastDash);
			}
			newName = `${nameWithoutExt}.md`;
		}

		if (file !== newName) {
			fs.renameSync(path.join(CONTENT_DIR, file), path.join(CONTENT_DIR, newName));
			console.log(`🔄 Renommé : ${file} ➡️ ${newName}`);
			fixedCount++;
		}
	});

	console.log(`\n✅ Nettoyage terminé. ${fixedCount} fichiers corrigés !`);
}

cleanSlugs();
