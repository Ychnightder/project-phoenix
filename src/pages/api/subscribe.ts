export const prerender = false;
import type { APIRoute } from 'astro';
import { db, initNewsletterTable } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
	try {
		const data = await request.formData();
		const email = data.get('email') as string;

		if (!email || !email.includes('@')) {
			return new Response(JSON.stringify({ message: 'Email invalide' }), { status: 400 });
		}

		// On s'assure que la table existe
		await initNewsletterTable();

		try {
			await db.execute({
				sql: 'INSERT INTO subscribers (email) VALUES (?)',
				args: [email],
			});
			return new Response(JSON.stringify({ message: 'Inscription réussie !' }), { status: 200 });
		} catch (e: any) {
			if (e.message.includes('UNIQUE')) {
				return new Response(JSON.stringify({ message: 'Déjà inscrit !' }), { status: 400 });
			}
			throw e;
		}
	} catch (error: any) {
		console.error('Erreur Turso:', error.message);
		return new Response(JSON.stringify({ message: 'Erreur serveur' }), { status: 500 });
	}
};
