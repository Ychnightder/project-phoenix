export const prerender = false;
import dotenv from 'dotenv';
import type { APIRoute } from 'astro';
import { db } from '../../lib/db';
import path from 'path';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const POST: APIRoute = async ({ request }) => {
	const data = await request.formData();
	const email = data.get('email') as string;

	// 1. Vérifier si l'utilisateur existe
	const user = await db.execute({
		sql: 'SELECT * FROM subscribers WHERE email = ?',
		args: [email],
	});

	if (user.rows.length === 0) {
		return new Response(JSON.stringify({ message: 'Email non trouvé' }), { status: 404 });
	}

	// 2. Générer un lien de vérification (on utilise l'email encodé pour faire simple)
	const token = btoa(email);
	const confirmLink = `${import.meta.env.SITE_URL}/api/confirm-unsubscribe?token=${token}`;

	// 3. Envoyer le mail de vérification
	const transporter = nodemailer.createTransport({
		host: import.meta.env.HOST_EMAIL,
		port: 465,
		secure: true,
		auth: { user: import.meta.env.USER_EMAIL, pass: import.meta.env.PASS_EMAIL },
	});

	await transporter.sendMail({
		from: `"Phénix Blog" <${import.meta.env.USER_EMAIL}>`,
		to: email,
		subject: 'Confirmation de désabonnement',
		html: `
			
            <p>Vous avez demandé à ne plus recevoir la newsletter Phénix.</p>
            <p>Pour confirmer cette action, veuillez cliquer sur le lien ci-dessous :</p>
            <a href="${confirmLink}" style="color: #ef4444;">Confirmer la désinscription</a>
            <p>Si vous n'êtes pas à l'origine de cette demande, ignorez ce mail.</p>
        `,
	});

	return new Response(JSON.stringify({ message: 'Mail de confirmation envoyé !' }), { status: 200 });
};
