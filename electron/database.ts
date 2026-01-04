import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export async function initializeDatabase(): Promise<void> {
  try {
    // Get database path
    const userDataPath = app.getPath('userData');
    const dbPath = process.env.DATABASE_PATH || path.join(userDataPath, 'transactions.db');

    // Ensure directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Open database
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    // Read and execute schema
    // __dirname is dist/electron/electron, schema is at dist/electron/src/db/schema/schema.sql
    // So we go up one level (to dist/electron) then into src/db/schema
    const schemaPath = path.join(__dirname, '../src/db/schema/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Execute schema
    db.exec(schema);

    // Run migrations
    const { runMigrations } = await import('../src/db/migrations/migration-runner');
    runMigrations(db);

    console.log('Database initialized successfully at:', dbPath);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
