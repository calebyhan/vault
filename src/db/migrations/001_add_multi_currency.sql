-- Add currency support to transactions table
-- Migration: 001_add_multi_currency.sql

-- Add new columns for multi-currency support
ALTER TABLE transactions ADD COLUMN original_currency TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE transactions ADD COLUMN original_amount REAL;
ALTER TABLE transactions ADD COLUMN exchange_rate REAL;
ALTER TABLE transactions ADD COLUMN usd_amount REAL;

-- Create exchange_rates cache table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate REAL NOT NULL,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(from_currency, to_currency, date)
);

-- Create index for fast exchange rate lookups
CREATE INDEX IF NOT EXISTS idx_exchange_rates_lookup
  ON exchange_rates(from_currency, to_currency, date);

-- Backfill existing transactions with USD defaults
UPDATE transactions
SET
  original_currency = 'USD',
  original_amount = amount,
  exchange_rate = 1.0,
  usd_amount = amount
WHERE original_amount IS NULL;
