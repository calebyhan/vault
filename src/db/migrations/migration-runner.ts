import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export interface Migration {
  version: number;
  name: string;
  filename: string;
}

export function runMigrations(db: Database.Database): void {
  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Define all migrations in order
  const migrations: Migration[] = [
    {
      version: 1,
      name: '001_add_multi_currency',
      filename: '001_add_multi_currency.sql'
    },
    {
      version: 2,
      name: '002_normalize_dates',
      filename: '002_normalize_dates.sql'
    },
    {
      version: 3,
      name: '003_add_settings_table',
      filename: '003_add_settings_table.sql'
    },
  ];

  const migrationsDir = path.join(__dirname, '.');

  for (const migration of migrations) {
    // Check if migration already applied
    const applied = db.prepare(
      'SELECT version FROM schema_migrations WHERE version = ?'
    ).get(migration.version);

    if (!applied) {
      console.log(`Applying migration ${migration.version}: ${migration.name}`);

      try {
        const migrationPath = path.join(migrationsDir, migration.filename);
        const sql = fs.readFileSync(migrationPath, 'utf-8');

        // Execute migration
        db.exec(sql);

        // Record migration as applied
        db.prepare(
          'INSERT INTO schema_migrations (version, name) VALUES (?, ?)'
        ).run(migration.version, migration.name);

        console.log(`Migration ${migration.version} applied successfully`);
      } catch (error) {
        console.error(`Migration ${migration.version} failed:`, error);
        throw error;
      }
    } else {
      console.log(`Migration ${migration.version} already applied, skipping`);
    }
  }
}
