import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'url';

// 1. On configure le chemin et on charge l'ENV TOUT EN HAUT
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// 2. Maintenant on peut importer la DB et les autres modules
import { db } from '../../lib/db.js'; // Ajoute .js si tu as des erreurs de module
import nodemailer from 'nodemailer';
import fs from 'node:fs';
import matter from 'gray-matter';

export async function phoenixAgent() {
	console.log('🚀 Agent Phénix : Démarrage de la diffusion...');

	// 1. Récupérer les abonnés
	const result = await db.execute("SELECT email FROM subscribers WHERE status = 'active'");
	const subscribers = result.rows;

	if (subscribers.length === 0) {
		console.log('ℹ️ Aucun abonné actif trouvé.');
		return;
	}

	// 2. Récupérer le dernier article
	const blogDir = path.resolve(__dirname, '../../content/blog');
	// console.log(`📂 Lecture des articles dans : ${blogDir}`);

	const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

	if (files.length === 0) {
		console.log('ℹ️ Aucun fichier Markdown trouvé.');
		return;
	}

	const latestFile = files
		.map(f => ({
			name: f,
			time: fs.statSync(path.join(blogDir, f)).mtime.getTime(),
		}))
		.sort((a, b) => b.time - a.time)[0];

	const fileContent = fs.readFileSync(path.join(blogDir, latestFile.name), 'utf-8');

	// CORRECTION LOG : On ne concatène pas un objet avec un string pour éviter [object Object]
	// // console.log('📄 Fichier sélectionné :', latestFile.name);

	const { data: frontmatter } = matter(fileContent);
	// console.log('🔍 Frontmatter extrait :', JSON.stringify(frontmatter, null, 2));

	if (!frontmatter || Object.keys(frontmatter).length === 0) {
		console.error('❌ Erreur : Frontmatter vide. Vérifie les "---" dans le fichier.');
		return;
	}

	console.log(`📑 Titre de l'article : ${frontmatter.title}`);

	// 3. Configuration SMTP
	// On s'assure que process.env.USER_EMAIL est bien défini
	if (!process.env.USER_EMAIL || !process.env.PASS_EMAIL) {
		console.error('❌ Erreur : Variables USER_EMAIL ou PASS_EMAIL manquantes dans le .env');
		return;
	}

	const transporter = nodemailer.createTransport({
		host: process.env.HOST_EMAIL || 'smtp.alwaysdata.net',
		port: 465,
		secure: true,
		auth: {
			user: process.env.USER_EMAIL,
			pass: process.env.PASS_EMAIL,
		},
	});

	console.log(`📧 Envoi de l'article : "${frontmatter.title}" à ${subscribers.length} abonnés.`);

	// 4. Boucle d'envoi
	for (const sub of subscribers) {
		try {
			await transporter.sendMail({
				from: `"Phénix Veille IA" <${process.env.USER_EMAIL}>`,
				to: sub.email as string,
				subject: `🔥 Nouveau sur le blog : ${frontmatter.title}`,
				html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td style="padding: 20px 0 30px 0;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; border: 1px solid #e2e8f0; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 0 30px 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">Phénix</h1>
                            <p style="margin: 5px 0 0 0; color: #e0e7ff; font-size: 14px;">Veille IA & Technologie</p>
                        </td>
                    </tr>
                    ${
											frontmatter.heroImage
												? `
                    <tr>
                        <td align="center">
                            <img src="${frontmatter.heroImage}" alt="Hero Image" width="600" style="display: block; width: 100%; max-width: 600px; height: auto; border-bottom: 1px solid #eee;" />
                        </td>
                    </tr>
                    `
												: ''
										}
                    <tr>
                        <td style="padding: 40px 30px 40px 30px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="color: #1a202c; font-size: 24px; font-weight: bold; line-height: 1.2;">
                                        ${frontmatter.title}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 0 30px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                        ${frontmatter.description || "Une nouvelle analyse vient d'être publiée sur le blog. Restez à la pointe de l'innovation."}
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <a href="${process.env.SITE_URL}/blog/${latestFile.name.replace(/\.mdx?$/, '')}" 
                                           style="background-color: #4f46e5; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; transition: background-color 0.3s;">
                                           Lire l'article complet
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; text-align: center;">
                            <p style="margin: 0;">Vous recevez cet email car vous êtes inscrit à la newsletter Phénix.</p>
                            <p style="margin: 10px 0 0 0;">
                                <a href="${process.env.SITE_URL}" style="color: #4f46e5; text-decoration: none;">Visiter le blog</a> | 
                                <a href="${process.env.SITE_URL}/api/confirm-unsubscribe?token=${btoa(sub.email as string)}" style="color: #94a3b8; text-decoration: none;">Se désabonner</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`,
			});
			console.log(`✅ Mail envoyé à : ${sub.email}`); // Pause de 1 seconde entre chaque mail (sécurité Alwaysdata)
			await new Promise(resolve => setTimeout(resolve, 1000));
		} catch (err) {
			console.error(`❌ Échec pour ${sub.email}:`, err);
		}
	}

	console.log('🏁 Diffusion terminée.');
}

phoenixAgent();
