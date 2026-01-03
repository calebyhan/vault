-- Transactions table: stores all imported transactions
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  merchant TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'purchase',
  raw_description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Merchant mappings table: caches merchant-to-category mappings
CREATE TABLE IF NOT EXISTS merchant_mappings (
  merchant TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'purchase',
  last_updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_date_category ON transactions(date, category);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant);
