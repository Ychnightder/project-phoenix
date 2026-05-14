import { createClient } from '@libsql/client';
import 'dotenv/config';

const url = import.meta.env.TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL;
const authToken = import.meta.env.TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
	url: url ?? 'file:local.db', // Utilise un fichier local si l'URL Turso est absente
	authToken: authToken,
});

// Fonction pour initialiser la table (à appeler une fois ou au début de tes routes)
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
