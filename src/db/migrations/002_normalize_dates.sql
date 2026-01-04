-- Migration: Normalize all dates to YYYY-MM-DD format
-- Converts dates in YYYY/MM/DD format to YYYY-MM-DD

-- Update dates with YYYY/MM/DD format (e.g., 2024/10/19 -> 2024-10-19)
UPDATE transactions
SET date = REPLACE(date, '/', '-')
WHERE date LIKE '%/%';
