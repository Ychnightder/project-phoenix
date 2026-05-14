import { db } from '../../lib/db'
import nodemailer from 'nodemailer';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter'; 

async function phoenixAgent() {
	console.log('🚀 Agent Phénix : Démarrage de la diffusion...');

	// 1. Récupérer les abonnés
	const result = await db.execute("SELECT email FROM subscribers WHERE status = 'active'");
	const subscribers = result.rows;

	if (subscribers.length === 0) {
		console.log('ℹ️ Aucun abonné actif trouvé.');
		return;
	}

	// 2. Récupérer le dernier article (trié par date dans le dossier content)
	const blogDir = path.resolve('./src/content/blog');
	const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

	// On prend le fichier le plus récent (basé sur la date de modification pour l'exemple)
	const latestFile = files
		.map(f => ({
			name: f,
			time: fs.statSync(path.join(blogDir, f)).mtime.getTime(),
		}))
		.sort((a, b) => b.time - a.time)[0];

	const fileContent = fs.readFileSync(path.join(blogDir, latestFile.name), 'utf-8');
	const { data: frontmatter } = matter(fileContent);

	// 3. Configuration SMTP
	const transporter = nodemailer.createTransport({
		host: process.env.HOST_EMAIL,
		port: 465,
		secure: true,
		auth: {
			user: process.env.USER_EMAIL,
			pass: process.env.PASS_EMAIL,
		},
	});

	console.log(`📧 Envoi de l'article : "${frontmatter.title}" à ${subscribers.length} abonnés.`);

	// 4. Boucle d'envoi (avec délai pour éviter le spam)
	for (const sub of subscribers) {
		try {
			await transporter.sendMail({
				from: `"Phénix Veille IA" <${process.env.USER_EMAIL}>`,
				to: sub.email as string,
				subject: `🔥 Nouveau sur le blog : ${frontmatter.title}`,
				html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                        <h1 style="color: #4f46e5;">${frontmatter.title}</h1>
                        <p style="color: #666; line-height: 1.6;">${frontmatter.description || 'Découvrez notre dernier article de veille technologique.'}</p>
                        <a href="https://phenix-blog.vercel.app/blog/${latestFile.name.replace(/\.mdx?$/, '')}" 
                           style="display: inline-block; background: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
                           Lire l'article complet
                        </a>
                        <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;">
                        <p style="font-size: 11px; color: #aaa; text-align: center;">
                            Vous recevez ce mail car vous êtes abonné à Phénix. <br>
                            <a href="https://phenix-blog.vercel.app">Se désabonner</a>
                        </p>
                    </div>
                `,
			});
			console.log(`✅ Mail envoyé à : ${sub.email}`);
			// Pause de 1 seconde entre chaque mail (sécurité Alwaysdata)
			await new Promise(resolve => setTimeout(resolve, 1000));
		} catch (err) {
			console.error(`❌ Échec pour ${sub.email}:`, err);
		}
	}

	console.log('🏁 Diffusion terminée.');
}

phoenixAgent();
