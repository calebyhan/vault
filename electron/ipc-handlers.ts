import { ipcMain, dialog } from 'electron';
import { getDatabase } from './database';
import type { Transaction, TransactionFilters } from '../src/lib/types/transaction';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildCategorizationPrompt } from '../src/lib/categorization/prompt-builder';
import { normalizeMerchant } from '../src/lib/categorization/merchant-normalizer';
import { categorizeMerchantByPattern } from '../src/lib/categorization/merchant-patterns';
import { CATEGORIES } from '../src/lib/constants/categories';
import { ExchangeRateService } from '../src/lib/services/exchange-rate-service';
import { normalizeDateToISO } from '../src/lib/utils/date-utils';

export function registerIpcHandlers() {
  const db = getDatabase();

  // Initialize exchange rate service
  const exchangeRateService = new ExchangeRateService(db);

  // Get transactions with optional filters
  ipcMain.handle('db:get-transactions', async (_, filters: TransactionFilters = {}) => {
    try {
      let query = 'SELECT * FROM transactions WHERE 1=1';
      const params: any[] = [];

      if (filters.search) {
        query += ' AND (merchant LIKE ? OR raw_description LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      if (filters.category && filters.category !== 'all') {
        query += ' AND category = ?';
        params.push(filters.category);
      }

      if (filters.transactionType && filters.transactionType !== 'all') {
        query += ' AND transaction_type = ?';
        params.push(filters.transactionType);
      }

      if (filters.dateFrom) {
        query += ' AND date >= ?';
        params.push(filters.dateFrom);
      }

      if (filters.dateTo) {
        query += ' AND date <= ?';
        params.push(filters.dateTo);
      }

      query += ' ORDER BY date DESC, id DESC';

      const stmt = db.prepare(query);
      return stmt.all(...params);
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  });

  // Add transaction
  ipcMain.handle('db:add-transaction', async (_, transaction: Omit<Transaction, 'id' | 'created_at'>) => {
    try {
      // Normalize the date to YYYY-MM-DD format
      const normalizedDate = normalizeDateToISO(transaction.date);

      // Get currency and amount
      const originalCurrency = transaction.original_currency || 'USD';
      const originalAmount = transaction.original_amount || transaction.amount;

      // Convert to USD if not already USD
      let usdAmount = originalAmount;
      let exchangeRate = 1.0;

      if (originalCurrency !== 'USD') {
        try {
          const conversion = await exchangeRateService.convertAmount(
            originalAmount,
            originalCurrency,
            'USD',
            normalizedDate
          );
          usdAmount = conversion.usdAmount;
          exchangeRate = conversion.rate;
        } catch (error) {
          console.error('Exchange rate conversion failed:', error);
          // Use original amount as fallback with warning
          console.warn(`Using original amount for ${originalCurrency} transaction (conversion failed)`);
        }
      }

      const stmt = db.prepare(`
        INSERT INTO transactions (
          date, merchant, amount, category, transaction_type, raw_description,
          original_currency, original_amount, exchange_rate, usd_amount
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        normalizedDate,
        transaction.merchant,
        usdAmount, // Store USD amount in 'amount' field for backward compatibility
        transaction.category,
        transaction.transaction_type,
        transaction.raw_description,
        originalCurrency,
        originalAmount,
        exchangeRate,
        usdAmount
      );

      return result.lastInsertRowid;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  });

  // Update transaction
  ipcMain.handle('db:update-transaction', async (_, id: number, updates: Partial<Transaction>) => {
    try {
      const fields = [];
      const values = [];

      // Handle currency change - need to recalculate USD amount
      if (updates.original_currency || updates.original_amount !== undefined) {
        // Get current transaction
        const current = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as Transaction;

        const newCurrency = updates.original_currency || current.original_currency;
        const newOriginalAmount = updates.original_amount !== undefined ? updates.original_amount : current.original_amount;

        // Recalculate USD amount
        if (newCurrency !== 'USD') {
          try {
            const conversion = await exchangeRateService.convertAmount(
              newOriginalAmount,
              newCurrency,
              'USD',
              current.date
            );

            fields.push('original_currency = ?', 'original_amount = ?', 'exchange_rate = ?', 'usd_amount = ?', 'amount = ?');
            values.push(newCurrency, newOriginalAmount, conversion.rate, conversion.usdAmount, conversion.usdAmount);
          } catch (error) {
            console.error('Exchange rate conversion failed during update:', error);
            throw error;
          }
        } else {
          fields.push('original_currency = ?', 'original_amount = ?', 'exchange_rate = ?', 'usd_amount = ?', 'amount = ?');
          values.push('USD', newOriginalAmount, 1.0, newOriginalAmount, newOriginalAmount);
        }
      }

      if (updates.merchant !== undefined) {
        fields.push('merchant = ?');
        values.push(updates.merchant);
      }

      if (updates.amount !== undefined && updates.original_amount === undefined) {
        // Direct amount update (manual override)
        fields.push('amount = ?', 'usd_amount = ?');
        values.push(updates.amount, updates.amount);
      }

      if (updates.category !== undefined) {
        fields.push('category = ?');
        values.push(updates.category);
      }

      if (updates.transaction_type !== undefined) {
        fields.push('transaction_type = ?');
        values.push(updates.transaction_type);
      }

      if (updates.date !== undefined) {
        fields.push('date = ?');
        values.push(normalizeDateToISO(updates.date));
      }

      if (fields.length === 0) return;

      values.push(id);

      const stmt = db.prepare(`
        UPDATE transactions
        SET ${fields.join(', ')}
        WHERE id = ?
      `);

      stmt.run(...values);

      // Update merchant cache if category or transaction_type changed
      if (updates.category || updates.transaction_type) {
        const transaction = db.prepare('SELECT merchant, category, transaction_type FROM transactions WHERE id = ?').get(id) as any;
        if (transaction) {
          const cacheStmt = db.prepare(`
            INSERT INTO merchant_mappings (merchant, category, transaction_type, last_updated)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(merchant) DO UPDATE SET
              category = excluded.category,
              transaction_type = excluded.transaction_type,
              last_updated = CURRENT_TIMESTAMP
          `);
          cacheStmt.run(
            transaction.merchant,
            updates.category !== undefined ? updates.category : transaction.category,
            updates.transaction_type !== undefined ? updates.transaction_type : transaction.transaction_type
          );
        }
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  });

  // Update all transactions from same merchant
  ipcMain.handle('db:update-all-from-merchant', async (_, merchant: string, updates: Partial<Transaction>) => {
    try {
      const fields = [];
      const values = [];

      if (updates.category !== undefined) {
        fields.push('category = ?');
        values.push(updates.category);
      }

      if (updates.transaction_type !== undefined) {
        fields.push('transaction_type = ?');
        values.push(updates.transaction_type);
      }

      if (fields.length === 0) return 0;

      values.push(merchant);

      const stmt = db.prepare(`
        UPDATE transactions
        SET ${fields.join(', ')}
        WHERE merchant = ?
      `);

      const result = stmt.run(...values);

      // Update merchant cache
      if (updates.category || updates.transaction_type) {
        // Get current values for fields not being updated
        const existing = db.prepare('SELECT category, transaction_type FROM transactions WHERE merchant = ? LIMIT 1').get(merchant) as any;
        if (existing) {
          const cacheStmt = db.prepare(`
            INSERT INTO merchant_mappings (merchant, category, transaction_type, last_updated)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(merchant) DO UPDATE SET
              category = excluded.category,
              transaction_type = excluded.transaction_type,
              last_updated = CURRENT_TIMESTAMP
          `);
          cacheStmt.run(
            merchant,
            updates.category !== undefined ? updates.category : existing.category,
            updates.transaction_type !== undefined ? updates.transaction_type : existing.transaction_type
          );
        }
      }

      return result.changes;
    } catch (error) {
      console.error('Error updating all transactions from merchant:', error);
      throw error;
    }
  });

  // Delete transaction
  ipcMain.handle('db:delete-transaction', async (_, id: number) => {
    try {
      const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
      stmt.run(id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  });

  // Delete all transactions
  ipcMain.handle('db:delete-all-transactions', async () => {
    try {
      const stmt = db.prepare('DELETE FROM transactions');
      stmt.run();
    } catch (error) {
      console.error('Error deleting all transactions:', error);
      throw error;
    }
  });

  // Get cached category
  ipcMain.handle('db:get-cached-category', async (_, merchant: string) => {
    try {
      const stmt = db.prepare('SELECT * FROM merchant_mappings WHERE merchant = ?');
      return stmt.get(merchant.toUpperCase()) || null;
    } catch (error) {
      console.error('Error getting cached category:', error);
      return null;
    }
  });

  // Cache category
  ipcMain.handle('db:cache-category', async (_, merchant: string, category: string, type: string) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO merchant_mappings (merchant, category, transaction_type, last_updated)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(merchant) DO UPDATE SET
          category = excluded.category,
          transaction_type = excluded.transaction_type,
          last_updated = CURRENT_TIMESTAMP
      `);
      stmt.run(merchant.toUpperCase(), category, type);
    } catch (error) {
      console.error('Error caching category:', error);
      throw error;
    }
  });

  // Select transaction file (CSV, XLSX, TXT, PDF)
  ipcMain.handle('file:select-csv', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Transaction Files', extensions: ['csv', 'xlsx', 'xls', 'txt', 'pdf'] },
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'PDF Files', extensions: ['pdf'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      return result.canceled ? null : result.filePaths[0];
    } catch (error) {
      console.error('Error selecting file:', error);
      throw error;
    }
  });

  // Select multiple transaction files
  ipcMain.handle('file:select-multiple', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Transaction Files', extensions: ['csv', 'xlsx', 'xls', 'txt', 'pdf'] },
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'PDF Files', extensions: ['pdf'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      return result.canceled ? null : result.filePaths;
    } catch (error) {
      console.error('Error selecting files:', error);
      throw error;
    }
  });

  // Parse file and return data
  ipcMain.handle('file:parse-file', async (_, filePath: string, manualMapping?: any) => {
    try {
      const fs = require('fs');
      const path = require('path');
      const buffer = fs.readFileSync(filePath);
      const filename = path.basename(filePath);
      const ext = filename.toLowerCase().split('.').pop();

      // Import parsers dynamically
      const { parseFile } = require('../src/lib/utils/file-parsers');
      const result = await parseFile(buffer, filename, manualMapping);

      return {
        ...result,
        filename,
        extension: ext,
      };
    } catch (error) {
      console.error('Error parsing file:', error);
      throw error;
    }
  });

  // Analytics: Get dashboard stats
  ipcMain.handle('analytics:get-stats', async (_, dateFrom?: string, dateTo?: string) => {
    try {
      let query = `
        SELECT
          category,
          SUM(amount) as total,
          COUNT(*) as count,
          AVG(amount) as avg
        FROM transactions
        WHERE transaction_type = 'purchase' AND amount > 0
      `;
      const params: any[] = [];

      if (dateFrom) {
        query += ' AND date >= ?';
        params.push(dateFrom);
      }

      if (dateTo) {
        query += ' AND date <= ?';
        params.push(dateTo);
      }

      query += ' GROUP BY category';

      const stmt = db.prepare(query);
      const results = stmt.all(...params) as any[];

      // Return empty stats if no data
      if (results.length === 0) {
        return {
          totalSpent: 0,
          transactionCount: 0,
          avgAmount: 0,
          topCategory: 'None',
          categoryTotals: {},
          categoryPercentages: {},
          monthlyData: [],
        };
      }

      const categoryTotals: Record<string, number> = {};
      let grandTotal = 0;

      results.forEach((row) => {
        categoryTotals[row.category] = row.total;
        grandTotal += row.total;
      });

      const categoryPercentages: Record<string, number> = {};
      Object.entries(categoryTotals).forEach(([category, total]) => {
        categoryPercentages[category] = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
      });

      const topCategory =
        Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';

      // Get monthly data
      let monthlyQuery = `
        SELECT
          strftime('%Y-%m', date) as month,
          category,
          SUM(amount) as total
        FROM transactions
        WHERE transaction_type = 'purchase' AND amount > 0
      `;
      const monthlyParams: any[] = [];

      if (dateFrom) {
        monthlyQuery += ' AND date >= ?';
        monthlyParams.push(dateFrom);
      }

      if (dateTo) {
        monthlyQuery += ' AND date <= ?';
        monthlyParams.push(dateTo);
      }

      monthlyQuery += ' GROUP BY month, category ORDER BY month ASC';

      const monthlyStmt = db.prepare(monthlyQuery);
      const monthlyResults = monthlyStmt.all(...monthlyParams) as any[];

      return {
        totalSpent: grandTotal,
        transactionCount: results.reduce((sum, r) => sum + r.count, 0),
        avgAmount: grandTotal / results.reduce((sum, r) => sum + r.count, 0) || 0,
        topCategory,
        categoryTotals,
        categoryPercentages,
        monthlyData: monthlyResults,
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  });

  // AI Categorization
  ipcMain.handle('ai:categorize', async (_, merchant: string) => {
    try {
      const normalized = normalizeMerchant(merchant);

      // Step 1: Check pattern matching first (fastest, most accurate for known merchants)
      const patternMatch = categorizeMerchantByPattern(merchant);
      if (patternMatch) {
        // Cache the pattern match result
        db.prepare(`
          INSERT INTO merchant_mappings (merchant, category, transaction_type, last_updated)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(merchant) DO UPDATE SET
            category = excluded.category,
            transaction_type = excluded.transaction_type,
            last_updated = CURRENT_TIMESTAMP
        `).run(normalized, patternMatch.category, patternMatch.transactionType);

        return {
          category: patternMatch.category,
          transactionType: patternMatch.transactionType,
          confidence: 1.0,
        };
      }

      // Step 2: Check cache
      const cached = db
        .prepare('SELECT * FROM merchant_mappings WHERE merchant = ?')
        .get(normalized) as any;

      if (cached) {
        return {
          category: cached.category,
          transactionType: cached.transaction_type,
          confidence: 1.0,
        };
      }

      // Step 3: Call Gemini API
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('GEMINI_API_KEY not set, defaulting to Other category');
        return {
          category: 'Other',
          transactionType: 'purchase',
          confidence: 0.0,
        };
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

      const prompt = buildCategorizationPrompt(normalized);
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Try to parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Cache the result
      db.prepare(`
        INSERT INTO merchant_mappings (merchant, category, transaction_type, last_updated)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(merchant) DO UPDATE SET
          category = excluded.category,
          transaction_type = excluded.transaction_type,
          last_updated = CURRENT_TIMESTAMP
      `).run(normalized, parsed.category, parsed.transactionType);

      return parsed;
    } catch (error) {
      console.error('Error categorizing merchant:', error);
      return {
        category: 'Other',
        transactionType: 'purchase',
        confidence: 0.0,
      };
    }
  });

  // Batch categorization - send all merchants in one API call
  ipcMain.handle('ai:batch-categorize', async (_, merchants: string[]) => {
    const results: Record<string, any> = {};

    console.log(`Batch categorizing ${merchants.length} merchants...`);

    // Separate pattern-matched, cached, and uncached merchants
    const uncachedMerchants: string[] = [];
    let patternMatched = 0;
    let cached = 0;

    for (const merchant of merchants) {
      const normalized = normalizeMerchant(merchant);

      // Step 1: Try pattern matching first
      const patternMatch = categorizeMerchantByPattern(merchant);
      if (patternMatch) {
        // Cache the pattern match
        db.prepare(`
          INSERT INTO merchant_mappings (merchant, category, transaction_type, last_updated)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(merchant) DO UPDATE SET
            category = excluded.category,
            transaction_type = excluded.transaction_type,
            last_updated = CURRENT_TIMESTAMP
        `).run(normalized, patternMatch.category, patternMatch.transactionType);

        results[merchant] = {
          category: patternMatch.category,
          transactionType: patternMatch.transactionType,
          confidence: 1.0,
        };
        patternMatched++;
        continue;
      }

      // Step 2: Check cache
      const cachedResult = db.prepare('SELECT * FROM merchant_mappings WHERE merchant = ?').get(normalized) as any;
      if (cachedResult) {
        results[merchant] = {
          category: cachedResult.category,
          transactionType: cachedResult.transaction_type,
          confidence: 1.0,
        };
        cached++;
      } else {
        uncachedMerchants.push(merchant);
      }
    }

    console.log(`Pattern matched: ${patternMatched}, Cached: ${cached}, Need AI categorization: ${uncachedMerchants.length}`);

    // If no uncached merchants, return early
    if (uncachedMerchants.length === 0) {
      return results;
    }

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not set');
      for (const merchant of uncachedMerchants) {
        results[merchant] = {
          category: 'Other',
          transactionType: 'purchase',
          confidence: 0.0,
        };
      }
      return results;
    }

    try {
      // Build batch prompt with all merchants
      const merchantList = uncachedMerchants.map((m, i) => `${i + 1}. ${m}`).join('\n');
      const batchPrompt = `Categorize the following ${uncachedMerchants.length} merchants into spending categories.

For each merchant, provide:
- category: One of [${CATEGORIES.join(', ')}]
- transactionType: One of [purchase, transfer, income]
- confidence: Number between 0-1

Merchants:
${merchantList}

Return ONLY a JSON array with ${uncachedMerchants.length} objects in the same order, no other text:
[
  {"category": "...", "transactionType": "...", "confidence": 0.9},
  ...
]`;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

      console.log('Sending batch request to Gemini API...');
      const result = await model.generateContent(batchPrompt);
      const text = result.response.text();

      // Parse JSON array response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]) as Array<{
        category: string;
        transactionType: string;
        confidence: number;
      }>;

      // Map results back to merchants and cache them
      for (let i = 0; i < uncachedMerchants.length; i++) {
        const merchant = uncachedMerchants[i];
        const categorization = parsed[i] || {
          category: 'Other',
          transactionType: 'purchase',
          confidence: 0.0,
        };

        const normalized = normalizeMerchant(merchant);

        // Cache the result
        db.prepare(`
          INSERT INTO merchant_mappings (merchant, category, transaction_type, last_updated)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(merchant) DO UPDATE SET
            category = excluded.category,
            transaction_type = excluded.transaction_type,
            last_updated = CURRENT_TIMESTAMP
        `).run(normalized, categorization.category, categorization.transactionType);

        results[merchant] = categorization;
        console.log(`Categorized: ${merchant} -> ${categorization.category}`);
      }

      console.log(`Batch categorization complete: ${uncachedMerchants.length} merchants categorized in 1 API call`);
    } catch (error) {
      console.error('Batch categorization error:', error);
      // Fallback to "Other" for all uncached merchants
      for (const merchant of uncachedMerchants) {
        results[merchant] = {
          category: 'Other',
          transactionType: 'purchase',
          confidence: 0.0,
        };
      }
    }

    return results;
  });

  // Find similar transactions using vendor matching
  ipcMain.handle('db:find-similar-transactions', async (_, transactionId: number, threshold: number = 0.70) => {
    try {
      // Get the target transaction
      const target = db.prepare('SELECT * FROM transactions WHERE id = ?').get(transactionId) as Transaction;

      if (!target) {
        throw new Error('Transaction not found');
      }

      // Get all other transactions
      const allTransactions = db.prepare('SELECT * FROM transactions WHERE id != ?').all(transactionId) as Transaction[];

      // Import vendor matching utilities
      const { findSimilarTransactions, groupSimilarTransactions } = require('../src/lib/vendor-matching');

      const similar = findSimilarTransactions(target, allTransactions, threshold);
      const grouped = groupSimilarTransactions(similar);

      return {
        target,
        similar,
        grouped,
      };
    } catch (error) {
      console.error('Error finding similar transactions:', error);
      throw error;
    }
  });

  // Batch update transactions by IDs
  ipcMain.handle('db:batch-update-transactions', async (_, transactionIds: number[], updates: Partial<Transaction>) => {
    try {
      console.log(`Batch update: ${transactionIds.length} transactions`, { transactionIds, updates });

      const fields = [];
      const values = [];

      if (updates.category !== undefined) {
        fields.push('category = ?');
        values.push(updates.category);
      }

      if (updates.transaction_type !== undefined) {
        fields.push('transaction_type = ?');
        values.push(updates.transaction_type);
      }

      if (fields.length === 0) {
        console.log('No fields to update, returning 0');
        return 0;
      }

      // Create placeholders for IN clause
      const placeholders = transactionIds.map(() => '?').join(',');

      const query = `
        UPDATE transactions
        SET ${fields.join(', ')}
        WHERE id IN (${placeholders})
      `;

      console.log('Executing query:', query);
      console.log('With values:', [...values, ...transactionIds]);

      const stmt = db.prepare(query);
      const result = stmt.run(...values, ...transactionIds);

      console.log(`Batch update complete: ${result.changes} rows affected`);
      return result.changes;
    } catch (error) {
      console.error('Error batch updating transactions:', error);
      throw error;
    }
  });

  // Exchange rate operations
  ipcMain.handle('exchange:get-rate', async (_, fromCurrency: string, toCurrency: string, date: string) => {
    try {
      return await exchangeRateService.getRate(fromCurrency, toCurrency, date);
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      throw error;
    }
  });

  ipcMain.handle('exchange:convert', async (_, amount: number, fromCurrency: string, toCurrency: string, date: string) => {
    try {
      return await exchangeRateService.convertAmount(amount, fromCurrency, toCurrency, date);
    } catch (error) {
      console.error('Error converting currency:', error);
      throw error;
    }
  });

  // Duplicate detection - find existing transactions that match the given transactions
  ipcMain.handle('db:find-duplicates', async (_, transactions: Array<{date: string, merchant: string, amount: number}>) => {
    try {
      const duplicates = [];
      const exactThreshold = 0.01; // Amount difference threshold (1 cent)

      for (const trans of transactions) {
        // Normalize date to YYYY-MM-DD format
        const normalizedDate = normalizeDateToISO(trans.date);

        // Find potential duplicates: same date, same merchant (case-insensitive), similar amount
        const query = `
          SELECT * FROM transactions
          WHERE date = ?
          AND LOWER(merchant) = LOWER(?)
          AND ABS(amount - ?) < ?
        `;

        const matches = db.prepare(query).all(
          normalizedDate,
          trans.merchant,
          trans.amount,
          exactThreshold
        ) as Transaction[];

        if (matches.length > 0) {
          duplicates.push({
            newTransaction: trans,
            existingMatches: matches,
            matchCount: matches.length
          });
        }
      }

      return duplicates;
    } catch (error) {
      console.error('Error finding duplicates:', error);
      throw error;
    }
  });

  // Export transactions to CSV
  ipcMain.handle('export:transactions-csv', async (_, filters: TransactionFilters = {}) => {
    try {
      // Get filtered transactions
      let query = 'SELECT * FROM transactions WHERE 1=1';
      const params: any[] = [];

      if (filters.search) {
        query += ' AND (merchant LIKE ? OR raw_description LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      if (filters.category && filters.category !== 'all') {
        query += ' AND category = ?';
        params.push(filters.category);
      }

      if (filters.transactionType && filters.transactionType !== 'all') {
        query += ' AND transaction_type = ?';
        params.push(filters.transactionType);
      }

      if (filters.dateFrom) {
        query += ' AND date >= ?';
        params.push(filters.dateFrom);
      }

      if (filters.dateTo) {
        query += ' AND date <= ?';
        params.push(filters.dateTo);
      }

      query += ' ORDER BY date DESC, id DESC';

      const stmt = db.prepare(query);
      const transactions = stmt.all(...params) as Transaction[];

      // Convert to CSV format
      const headers = ['Date', 'Merchant', 'Amount (USD)', 'Original Amount', 'Currency', 'Category', 'Type', 'Description'];
      const csvRows = [headers.join(',')];

      for (const trans of transactions) {
        const row = [
          trans.date,
          `"${trans.merchant.replace(/"/g, '""')}"`, // Escape quotes in merchant name
          trans.amount.toFixed(2),
          (trans.original_amount || trans.amount).toFixed(2),
          trans.original_currency || 'USD',
          trans.category,
          trans.transaction_type,
          trans.raw_description ? `"${trans.raw_description.replace(/"/g, '""')}"` : ''
        ];
        csvRows.push(row.join(','));
      }

      const csvContent = csvRows.join('\n');

      // Show save dialog
      const { filePath } = await dialog.showSaveDialog({
        title: 'Export Transactions to CSV',
        defaultPath: `transactions-${new Date().toISOString().split('T')[0]}.csv`,
        filters: [
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!filePath) {
        return null; // User cancelled
      }

      // Write CSV file
      const fs = require('fs');
      fs.writeFileSync(filePath, csvContent, 'utf-8');

      return filePath;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  });

  // Export transactions to PDF
  ipcMain.handle('export:transactions-pdf', async (_, filters: TransactionFilters = {}, dateFrom?: string, dateTo?: string) => {
    try {
      // Get dashboard stats for the report
      let statsQuery = `
        SELECT
          category,
          SUM(amount) as total,
          COUNT(*) as count,
          AVG(amount) as avg
        FROM transactions
        WHERE transaction_type = 'purchase' AND amount > 0
      `;
      const statsParams: any[] = [];

      if (dateFrom) {
        statsQuery += ' AND date >= ?';
        statsParams.push(dateFrom);
      }

      if (dateTo) {
        statsQuery += ' AND date <= ?';
        statsParams.push(dateTo);
      }

      statsQuery += ' GROUP BY category';

      const statsStmt = db.prepare(statsQuery);
      const statsResults = statsStmt.all(...statsParams) as any[];

      const categoryTotals: Record<string, number> = {};
      let grandTotal = 0;

      statsResults.forEach((row) => {
        categoryTotals[row.category] = row.total;
        grandTotal += row.total;
      });

      const categoryPercentages: Record<string, number> = {};
      Object.entries(categoryTotals).forEach(([category, total]) => {
        categoryPercentages[category] = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
      });

      const stats = {
        totalSpent: grandTotal,
        transactionCount: statsResults.reduce((sum, r) => sum + r.count, 0),
        avgAmount: grandTotal / statsResults.reduce((sum, r) => sum + r.count, 0) || 0,
        categoryTotals,
        categoryPercentages,
      };

      // Get filtered transactions
      let query = 'SELECT * FROM transactions WHERE transaction_type = "purchase" AND amount > 0';
      const params: any[] = [];

      if (dateFrom) {
        query += ' AND date >= ?';
        params.push(dateFrom);
      }

      if (dateTo) {
        query += ' AND date <= ?';
        params.push(dateTo);
      }

      query += ' ORDER BY date DESC, id DESC LIMIT 100'; // Limit to 100 for PDF

      const stmt = db.prepare(query);
      const transactions = stmt.all(...params) as Transaction[];

      // Create a simple HTML report (PDF generation would require additional library like puppeteer)
      // For now, we'll create an HTML file that can be printed to PDF
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Transaction Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
    .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
    .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
    .stat-label { color: #666; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
    td { padding: 10px; border-bottom: 1px solid #eee; }
    .amount { text-align: right; font-weight: 500; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <h1>Vault - Transaction Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  ${dateFrom || dateTo ? `<p>Period: ${dateFrom || 'Start'} to ${dateTo || 'End'}</p>` : ''}

  <div class="stats">
    <div class="stat-card">
      <div class="stat-label">Total Spent</div>
      <div class="stat-value">$${(stats?.totalSpent || 0).toFixed(2)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Transactions</div>
      <div class="stat-value">${stats?.transactionCount || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Average</div>
      <div class="stat-value">$${(stats?.avgAmount || 0).toFixed(2)}</div>
    </div>
  </div>

  <h2>Category Breakdown</h2>
  <table>
    <tr>
      <th>Category</th>
      <th style="text-align: right;">Amount</th>
      <th style="text-align: right;">Percentage</th>
    </tr>
    ${Object.entries(stats?.categoryTotals || {})
      .sort(([, a]: any, [, b]: any) => b - a)
      .map(([category, amount]: any) => `
        <tr>
          <td>${category}</td>
          <td class="amount">$${amount.toFixed(2)}</td>
          <td class="amount">${stats?.categoryPercentages?.[category]?.toFixed(1)}%</td>
        </tr>
      `).join('')}
  </table>

  <h2>Recent Transactions (Top 100)</h2>
  <table>
    <tr>
      <th>Date</th>
      <th>Merchant</th>
      <th>Category</th>
      <th style="text-align: right;">Amount</th>
    </tr>
    ${transactions.map(trans => `
      <tr>
        <td>${trans.date}</td>
        <td>${trans.merchant}</td>
        <td>${trans.category}</td>
        <td class="amount">$${trans.amount.toFixed(2)}</td>
      </tr>
    `).join('')}
  </table>

  <div class="footer">
    <p>Vault - Privacy-First Transaction Analytics</p>
    <p>This report contains ${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}</p>
  </div>
</body>
</html>
      `;

      // Show save dialog
      const { filePath } = await dialog.showSaveDialog({
        title: 'Export Report',
        defaultPath: `vault-report-${new Date().toISOString().split('T')[0]}.html`,
        filters: [
          { name: 'HTML Files', extensions: ['html'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (!filePath) {
        return null; // User cancelled
      }

      // Write HTML file
      const fs = require('fs');
      fs.writeFileSync(filePath, html, 'utf-8');

      return filePath;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  });
}
