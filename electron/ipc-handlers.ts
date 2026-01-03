import { ipcMain, dialog } from 'electron';
import { getDatabase } from './database';
import type { Transaction, TransactionFilters } from '../src/lib/types/transaction';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildCategorizationPrompt } from '../src/lib/categorization/prompt-builder';
import { normalizeMerchant } from '../src/lib/categorization/merchant-normalizer';
import { CATEGORIES } from '../src/lib/constants/categories';

export function registerIpcHandlers() {
  const db = getDatabase();

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
      const stmt = db.prepare(`
        INSERT INTO transactions (date, merchant, amount, category, transaction_type, raw_description)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        transaction.date,
        transaction.merchant,
        transaction.amount,
        transaction.category,
        transaction.transaction_type,
        transaction.raw_description
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

      if (updates.category !== undefined) {
        fields.push('category = ?');
        values.push(updates.category);
      }

      if (updates.transaction_type !== undefined) {
        fields.push('transaction_type = ?');
        values.push(updates.transaction_type);
      }

      if (fields.length === 0) return;

      values.push(id);

      const stmt = db.prepare(`
        UPDATE transactions
        SET ${fields.join(', ')}
        WHERE id = ?
      `);

      stmt.run(...values);

      // Update merchant cache if category changed
      if (updates.category) {
        const transaction = db.prepare('SELECT merchant, transaction_type FROM transactions WHERE id = ?').get(id) as any;
        if (transaction) {
          const cacheStmt = db.prepare(`
            INSERT INTO merchant_mappings (merchant, category, transaction_type, last_updated)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(merchant) DO UPDATE SET
              category = excluded.category,
              transaction_type = excluded.transaction_type,
              last_updated = CURRENT_TIMESTAMP
          `);
          cacheStmt.run(transaction.merchant, updates.category, transaction.transaction_type);
        }
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
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

  // Parse file and return data
  ipcMain.handle('file:parse-file', async (_, filePath: string) => {
    try {
      const fs = require('fs');
      const path = require('path');
      const buffer = fs.readFileSync(filePath);
      const filename = path.basename(filePath);
      const ext = filename.toLowerCase().split('.').pop();

      // Import parsers dynamically
      const { parseFile } = require('../src/lib/utils/file-parsers');
      const result = await parseFile(buffer, filename);

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

      return {
        totalSpent: grandTotal,
        transactionCount: results.reduce((sum, r) => sum + r.count, 0),
        avgAmount: grandTotal / results.reduce((sum, r) => sum + r.count, 0) || 0,
        topCategory,
        categoryTotals,
        categoryPercentages,
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

      // Check cache first
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

      // Call Gemini API
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

    // Separate cached and uncached merchants
    const uncachedMerchants: string[] = [];

    for (const merchant of merchants) {
      const normalized = normalizeMerchant(merchant);
      const cached = db.prepare('SELECT * FROM merchant_mappings WHERE merchant = ?').get(normalized) as any;

      if (cached) {
        results[merchant] = {
          category: cached.category,
          transactionType: cached.transaction_type,
          confidence: 1.0,
        };
      } else {
        uncachedMerchants.push(merchant);
      }
    }

    console.log(`Found ${merchants.length - uncachedMerchants.length} cached, ${uncachedMerchants.length} need categorization`);

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
}
