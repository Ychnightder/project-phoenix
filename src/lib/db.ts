import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// On initialise dotenv seulement si on est dans un environnement Node (process.env présent)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// SOLUTION : Utiliser l'optional chaining (?.) pour éviter le crash
// On vérifie d'abord si process.env existe, sinon on regarde import.meta.env
const url = process.env.TURSO_DATABASE_URL || (typeof import.meta.env !== 'undefined' ? import.meta.env.TURSO_DATABASE_URL : undefined);
const authToken = process.env.TURSO_AUTH_TOKEN || (typeof import.meta.env !== 'undefined' ? import.meta.env.TURSO_AUTH_TOKEN : undefined);


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
