import { createClient } from '@libsql/client';

// if (typeof process !== 'undefined' && process.env && !process.env.VERCEL) {
//     try {
//         const dotenv = await import('dotenv');
//         const path = await import('path');
//         const { fileURLToPath } = await import('url');
        
//         const __dirname = path.dirname(fileURLToPath(import.meta.url));
//         dotenv.config({ path: path.resolve(__dirname, '../../.env') });
//     } catch (e) {
//         console.log("Mode local : dotenv n'a pas pu être chargé (normal si build statique)");
//     }
// }

const url = process.env.TURSO_DATABASE_URL || (typeof import.meta.env !== 'undefined' ? import.meta.env.TURSO_DATABASE_URL : undefined);
const authToken = process.env.TURSO_AUTH_TOKEN || (typeof import.meta.env !== 'undefined' ? import.meta.env.TURSO_AUTH_TOKEN : undefined);

if (!url) {
	console.error('❌ ATTENTION: TURSO_DATABASE_URL est manquante !');
}

export const db = createClient({
	url: url ?? 'file:local.db', // Utilise un fichier local si l'URL Turso est absente
	authToken: authToken,
});

export async function initNewsletterTable() {
	await db.execute(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
