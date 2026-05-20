export const prerender = false;
import type { APIRoute } from 'astro';
import { db, initNewsletterTable } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
	const jsonHeader = { headers: { 'Content-Type': 'application/json' } };

	try {
		const data = await request.formData();
		const email = data.get('email') as string;

		if (!email || !email.includes('@')) {
			return new Response(JSON.stringify({ message: 'Email invalide' }), { status: 400, ...jsonHeader });
		}

		// On s'assure que la table existe
		await initNewsletterTable();

		try {
			await db.execute({
				sql: 'INSERT INTO subscribers (email) VALUES (?)',
				args: [email],
			});
			return new Response(JSON.stringify({ message: 'Inscription réussie !' }), { status: 200, ...jsonHeader });
		} catch (e: any) {
			const errorMessage = e?.message || '';
			if (errorMessage.includes('UNIQUE')) {
				return new Response(JSON.stringify({ message: 'Déjà inscrit !' }), { status: 400, ...jsonHeader });
			}
			throw e; // Propagé vers le catch global en cas d'autre problème de BDD
		}
	} catch (error: any) {
		console.error('Erreur Turso globale:', error?.message || error);
		return new Response(JSON.stringify({ message: 'Erreur serveur' }), { status: 500, ...jsonHeader });
	}
};
