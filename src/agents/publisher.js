 

import { simpleGit } from 'simple-git';

const git = simpleGit();

export async function deploy() {
	try {
		console.log("📤 Configuration de l'identité Git...");
		// Obligatoire pour que GitHub puisse signer le commit
		await git.addConfig('user.name', 'Ychnightder');
		await git.addConfig('user.email', 'pierreychnightder561@gmail.com');

		await git.pull('origin', 'main'); // On s'assure d'être à jour avec la branche principale

		console.log('📤 Préparation du commit...');
		await git.add('./*');

		// On vérifie s'il y a vraiment des changements (nouveaux articles)
		const status = await git.status();
		if (status.staged.length === 0) {
			console.log('ℹ️ Aucun nouvel article à publier.');
			return;
		}

		await git.commit(`Auto-update: ${new Date().toISOString().replace('T', ' ').substring(0, 19)}`);

		console.log('🚀 Envoi vers la branche main...');
		await git.push('origin', 'main');

		console.log('✅ Déploiement réussi !');
	} catch (error) {
		console.error('❌ Erreur lors du déploiement :', error.message);
		throw error; // On propage l'erreur pour que GitHub Action nous alerte
	}
}
