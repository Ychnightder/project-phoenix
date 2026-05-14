export const prerender = false;
import type { APIRoute } from 'astro';
import { db } from '../../lib/db';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const GET: APIRoute = async ({ url }) => {
	const token = url.searchParams.get('token');

	if (!token) return new Response('Lien invalide', { status: 400 });

	try {
		const email = atob(token); // On décode l'email

		await db.execute({
			sql: 'DELETE FROM subscribers WHERE email = ?',
			args: [email],
		});

		// Rediriger vers une page de succès sur ton blog
		return new Response(
			`
            <html>
            <head>
                <title>Désabonnement réussi</title>
                <meta charset="UTF-8" />
		        <meta name="viewport" content="width=device-width" />
		        <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico" />
            </head>
                <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                    <h1>Désabonnement réussi</h1>
                    <p>Votre adresse ${email} a été supprimée de nos listes.</p>
                    <a href="/">Retour au blog</a>
                </body>
            </html>
        `,
			{ headers: { 'Content-Type': 'text/html' } }
		);
	} catch (e) {
		return new Response('Erreur lors de la suppression', { status: 500 });
	}
};
