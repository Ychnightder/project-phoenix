export const prerender = false;
import type { APIRoute } from 'astro';
import { db } from '../../lib/db';
import nodemailer from 'nodemailer';


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

	// 2. Générer un lien de vérification dynamique
	// On extrait l'origine (ex: http://localhost:4321 ou https://project-phoenix.com) depuis la requête reçue
	const urlObj = new URL(request.url);
	const origin = urlObj.origin;

	const token = btoa(email);
	const confirmLink = `${origin}/api/confirm-unsubscribe?token=${token}`;

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
            <p><a href="${confirmLink}" style="color: #ef4444; font-weight: bold;">Confirmer la désinscription</a></p>
            <p>Si vous n'êtes pas à l'origine de cette demande, ignorez ce mail.</p>
        `,
	});

	return new Response(JSON.stringify({ message: 'Mail de confirmation envoyé !' }), { status: 200 });
};
