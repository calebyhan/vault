-- Transactions table: stores all imported transactions
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  merchant TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'purchase',
  raw_description TEXT,
  original_currency TEXT DEFAULT 'USD',
  original_amount REAL,
  exchange_rate REAL DEFAULT 1.0,
  usd_amount REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Merchant mappings table: caches merchant-to-category mappings
CREATE TABLE IF NOT EXISTS merchant_mappings (
  merchant TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'purchase',
  last_updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Exchange rates table: caches currency exchange rates
CREATE TABLE IF NOT EXISTS exchange_rates (
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate REAL NOT NULL,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (from_currency, to_currency, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_date_category ON transactions(date, category);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON exchange_rates(date);
