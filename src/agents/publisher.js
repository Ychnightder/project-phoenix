import { simpleGit } from 'simple-git';

const git = simpleGit();

export async function deploy() {
    try {
        console.log("📤 Préparation du déploiement...");
        await git.add('./*');
        await git.commit(`🤖 Auto-update: ${new Date().toISOString()}`);
        await git.push('origin', 'main');
        console.log("✅ Déploiement envoyé sur GitHub/Vercel !");
    } catch (error) {
        console.error("❌ Erreur Git :", error.message);
    }
}