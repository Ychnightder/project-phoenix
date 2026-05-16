export const prerender = false;
import nodemailer from 'nodemailer';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
	// 1. On récupère les variables soit via import.meta.env, soit via process.env
	const SMTP_USER = import.meta.env.USER_EMAIL || process.env.USER_EMAIL;
	const SMTP_PASS = import.meta.env.PASS_EMAIL || process.env.PASS_EMAIL;
	const SMTP_HOST = import.meta.env.HOST_EMAIL || process.env.HOST_EMAIL || 'smtp.alwaysdata.com';

	try {
		const data = await request.formData();
		const name = data.get('name');
		const email = data.get('email');
		const message = data.get('message');

		// Vérification critique avant d'envoyer
		if (!SMTP_USER || !SMTP_PASS) {
			throw new Error('Configuration SMTP manquante (USER ou PASS est undefined)');
		}

		const transporter = nodemailer.createTransport({
			host: SMTP_HOST,
			port: 465,
			secure: true,
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASS,
			},
		});

		await transporter.sendMail({
			from: `"Phénix Contact" <${SMTP_USER}>`, // C'est ici que c'était undefined
			to: 'u7320991664@gmail.com',
			replyTo: email as string,
			subject: `🔥 Nouveau message de ${name}`,
			text: `De: ${email}\n\nMessage: ${message}`,
		});

		return new Response(JSON.stringify({ message: 'Envoyé !' }), { status: 200 });
	} catch (error: any) {
		console.error('Erreur SMTP détaillée:', error.message);
		return new Response(JSON.stringify({ message: error.message }), { status: 500 });
	}
};
