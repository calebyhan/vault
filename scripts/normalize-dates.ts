#!/usr/bin/env node
/**
 * Manual script to run the date normalization migration on the database
 * This can be run independently to fix existing dates in the database
 * 
 * Usage: node scripts/normalize-dates.js
 */

import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';

// Get database path (macOS)
const userDataPath = path.join(os.homedir(), 'Library/Application Support/vault');
const dbPath = path.join(userDataPath, 'transactions.db');

console.log(`Opening database at: ${dbPath}`);

try {
  const db = new Database(dbPath);

  // Check for dates with slash format
  const slashDates = db.prepare(`
    SELECT id, date FROM transactions WHERE date LIKE '%/%' LIMIT 10
  `).all();

  console.log('\nFound dates with slash format:');
  if (slashDates.length > 0) {
    slashDates.forEach((row: any) => console.log(`  ID ${row.id}: ${row.date}`));
  } else {
    console.log('  None found!');
  }

  if (slashDates.length > 0) {
    console.log('\nNormalizing dates...');
    
    const result = db.prepare(`
      UPDATE transactions
      SET date = REPLACE(date, '/', '-')
      WHERE date LIKE '%/%'
    `).run();

    console.log(`✅ Updated ${result.changes} dates from YYYY/MM/DD to YYYY-MM-DD format`);
  } else {
    console.log('\n✅ No dates need to be normalized!');
  }

  // Verify all dates are now in correct format
  const invalidDates = db.prepare(`
    SELECT id, date FROM transactions WHERE date LIKE '%/%'
  `).all();

  if (invalidDates.length === 0) {
    console.log('\n✅ All dates are now in YYYY-MM-DD format!');
  } else {
    console.log('\n⚠️ Warning: Some dates still have slash format:');
    invalidDates.forEach((row: any) => console.log(`  ID ${row.id}: ${row.date}`));
  }

  db.close();
} catch (error) {
  console.error('❌ Error running migration:', error);
  process.exit(1);
}
