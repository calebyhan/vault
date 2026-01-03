import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface ParsedTransaction {
  date: string;
  merchant: string;
  amount: number;
  raw_description: string;
  transaction_type?: 'purchase' | 'transfer' | 'income';
}

/**
 * Detect transaction type based on merchant description
 */
function detectTransactionType(merchant: string): 'purchase' | 'transfer' | 'income' {
  const lower = merchant.toLowerCase();

  // Hardcoded transfer patterns - these are always transfers
  if (lower.includes('fid bkg svc llc') ||
      lower.includes('zelle payment from') ||
      lower.includes('zelle payment to') ||
      lower.includes('zelle sent') ||
      lower.includes('online banking transfer') ||
      lower.includes('autopay') ||
      lower.includes('automatic payment') ||
      lower.includes('credit crd des:autopay') ||
      lower.includes('chase credit crd')) {
    return 'transfer';
  }

  // Transfer patterns - money moving between accounts or to others
  if (lower.includes('transfer to') ||
      lower.includes('transfer from') ||
      lower.includes('payment to') ||
      lower.includes('online transfer') ||
      lower.includes('mobile transfer') ||
      lower.includes('wire transfer') ||
      lower.includes('wire sent') ||
      lower.includes('ach transfer') ||
      lower.includes('ach payment') ||
      lower.includes('bill pay') ||
      lower.includes('external transfer') ||
      lower.includes('p2p payment') ||
      lower.includes('venmo') ||
      lower.includes('paypal transfer') ||
      lower.includes('cash app') ||
      lower.includes('transfer')) {
    return 'transfer';
  }

  // Income patterns - money coming in (only actual income sources)
  if (lower.includes('direct deposit') ||
      lower.includes('payroll') ||
      lower.includes('refund') ||
      lower.includes('reimbursement') ||
      (lower.includes('deposit') && !lower.includes('atm')) ||
      (lower.includes('credit') && !lower.includes('credit card') && !lower.includes('autopay'))) {
    return 'income';
  }

  // Default to purchase
  return 'purchase';
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  headers?: string[];
  format: 'csv' | 'xlsx' | 'txt' | 'pdf';
}

/**
 * Parse CSV file
 */
export async function parseCSV(buffer: Buffer): Promise<ParseResult> {
  const text = buffer.toString('utf-8');

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as any[];

        // Try to auto-detect column mapping
        const mapping = detectColumnMapping(headers);

        if (!mapping) {
          // Return headers for manual mapping
          resolve({
            transactions: [],
            headers,
            format: 'csv',
          });
          return;
        }

        // Parse transactions using detected mapping
        const transactions: ParsedTransaction[] = [];
        for (const row of rows) {
          const dateStr = row[mapping.date];
          const merchant = row[mapping.merchant];
          const amountStr = row[mapping.amount];

          if (!dateStr || !merchant || !amountStr) continue;

          // Parse amount - remove $, commas, handle negatives
          const amountCleaned = amountStr.toString().replace(/[\$,]/g, '');
          const amount = Math.abs(parseFloat(amountCleaned));

          if (isNaN(amount) || amount === 0) continue;

          transactions.push({
            date: convertToISODate(dateStr),
            merchant: merchant.trim(),
            amount: amount,
            raw_description: merchant,
            transaction_type: detectTransactionType(merchant),
          });
        }

        resolve({
          transactions,
          headers,
          format: 'csv',
        });
      },
      error: (error: Error) => reject(error),
    });
  });
}

/**
 * Parse XLSX/Excel file
 */
export function parseXLSX(buffer: Buffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

  if (data.length === 0) {
    throw new Error('Empty spreadsheet');
  }

  const headers = (data[0] as any[]).map(String);
  const rows = data.slice(1) as any[][];

  return {
    transactions: [],
    headers,
    format: 'xlsx',
  };
}

/**
 * Parse TXT file (Bank of America format)
 * Example formats:
 * 01/15/2024    STARBUCKS #12345    -6.75    1,234.56
 * 01/15/2024    STARBUCKS #12345    6.75
 */
export function parseTXT(buffer: Buffer): ParseResult {
  const text = buffer.toString('utf-8');
  const lines = text.split('\n').filter(line => line.trim());

  const transactions: ParsedTransaction[] = [];

  for (const line of lines) {
    // Skip lines that look like headers or balances
    if (line.toLowerCase().includes('beginning balance') ||
        line.toLowerCase().includes('ending balance') ||
        line.toLowerCase().includes('date') && line.toLowerCase().includes('description')) {
      continue;
    }

    // Pattern for: Date  Description  Amount  RunningBalance
    // Captures the transaction amount (can be negative) before the running balance
    const pattern = /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?[\d,]+\.?\d{0,2})\s+([\d,]+\.\d{2})\s*$/;
    const match = line.match(pattern);

    if (match) {
      const [, date, merchant, amount, runningBalance] = match;

      // Skip if merchant is empty or amount is 0
      const amountNum = Math.abs(parseFloat(amount.replace(/,/g, '')));
      if (!merchant.trim() || amountNum === 0) continue;

      transactions.push({
        date: convertToISODate(date),
        merchant: merchant.trim(),
        amount: amountNum,
        raw_description: line.trim(),
        transaction_type: detectTransactionType(merchant),
      });
    } else {
      // Fallback pattern for lines without running balance: Date  Description  Amount
      const simplePattern = /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?[\d,]+\.\d{2})\s*$/;
      const simpleMatch = line.match(simplePattern);

      if (simpleMatch) {
        const [, date, merchant, amount] = simpleMatch;
        const amountNum = Math.abs(parseFloat(amount.replace(/,/g, '')));

        if (merchant.trim() && amountNum > 0) {
          transactions.push({
            date: convertToISODate(date),
            merchant: merchant.trim(),
            amount: amountNum,
            raw_description: line.trim(),
            transaction_type: detectTransactionType(merchant),
          });
        }
      }
    }
  }

  return {
    transactions,
    format: 'txt',
  };
}

/**
 * Extract year from PDF content or filename
 */
function extractYearFromPDF(text: string, filename: string): number {
  // Try to find "Statement Date" or similar patterns in the PDF
  const statementDatePatterns = [
    /statement\s+date[:\s]+(\d{1,2}\/\d{1,2}\/(\d{4}))/i,
    /closing\s+date[:\s]+(\d{1,2}\/\d{1,2}\/(\d{4}))/i,
    /(\d{1,2}\/\d{1,2}\/(\d{4}))\s*-\s*\d{1,2}\/\d{1,2}\/\d{4}/i, // Date range
  ];

  for (const pattern of statementDatePatterns) {
    const match = text.match(pattern);
    if (match && match[2]) {
      const year = parseInt(match[2], 10);
      if (year >= 2000 && year <= new Date().getFullYear() + 1) {
        return year;
      }
    }
  }

  // Try to extract year from filename (e.g., "statement_2024.pdf", "Dec_2024.pdf")
  const filenameYearMatch = filename.match(/20\d{2}/);
  if (filenameYearMatch) {
    const year = parseInt(filenameYearMatch[0], 10);
    if (year >= 2000 && year <= new Date().getFullYear() + 1) {
      return year;
    }
  }

  // Default to current year
  return new Date().getFullYear();
}

/**
 * Parse PDF file (Chase and other bank statement formats)
 * Looks for "Account Activity" section and extracts transactions
 */
export async function parsePDF(buffer: Buffer, filename: string = ''): Promise<ParseResult> {
  try {
    // Import pdf-parse dynamically - it's a CommonJS module (v2 API)
    const { PDFParse } = require('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;

    const transactions: ParsedTransaction[] = [];

    // Extract year from PDF content or filename
    const statementYear = extractYearFromPDF(text, filename);
    console.log(`Detected statement year: ${statementYear}`);

    // Find the "Account Activity" section (case-insensitive)
    const textLower = text.toLowerCase();
    const activityIndex = textLower.indexOf('account activity');

    // If no "Account Activity" section found, try to parse the entire document
    const activityText = activityIndex !== -1 ? text.substring(activityIndex) : text;
    const lines = activityText.split('\n');

    // Pattern to match transaction lines
    // Looking for: Date  Description  Amount (not balance)
    // Common patterns:
    // MM/DD/YYYY MERCHANT NAME -$123.45
    // MM/DD MERCHANT NAME $123.45
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and headers
      if (!line || line.includes('Account Activity') || line.includes('Date') || line.includes('Description')) {
        continue;
      }

      // Pattern 1: MM/DD/YYYY or MM/DD at start of line
      const datePattern = /^(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+(.+?)\s+(-?\$?[\d,]+\.?\d{0,2})$/;
      const match = line.match(datePattern);

      if (match) {
        let [, date, merchant, amount] = match;

        // Clean up date - add statement year if not present
        if (!date.includes('/20') && !date.includes('/19')) {
          date = `${date}/${statementYear}`;
        }

        // Clean up amount - remove $ and commas, handle negatives
        amount = amount.replace(/[\$,]/g, '');
        const amountNum = Math.abs(parseFloat(amount));

        // Skip if amount is 0 or NaN
        if (!amountNum || amountNum === 0) continue;

        // Skip lines that look like balances (usually have "Balance" in merchant)
        if (merchant.toLowerCase().includes('balance')) continue;

        transactions.push({
          date: convertToISODate(date),
          merchant: merchant.trim(),
          amount: amountNum,
          raw_description: line,
          transaction_type: detectTransactionType(merchant),
        });
      }
    }

    return {
      transactions,
      format: 'pdf',
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    return {
      transactions: [],
      format: 'pdf',
    };
  }
}

/**
 * Auto-detect and parse file based on extension
 */
export async function parseFile(
  buffer: Buffer,
  filename: string
): Promise<ParseResult> {
  const ext = filename.toLowerCase().split('.').pop();

  switch (ext) {
    case 'csv':
      return await parseCSV(buffer);
    case 'xlsx':
    case 'xls':
      return parseXLSX(buffer);
    case 'txt':
      return parseTXT(buffer);
    case 'pdf':
      return await parsePDF(buffer, filename);
    default:
      throw new Error(`Unsupported file format: ${ext}`);
  }
}

/**
 * Convert MM/DD/YYYY to YYYY-MM-DD
 */
function convertToISODate(date: string): string {
  const [month, day, year] = date.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Auto-detect column mapping from headers
 */
export interface ColumnMapping {
  date: string;
  merchant: string;
  amount: string;
}

export function detectColumnMapping(headers: string[]): ColumnMapping | null {
  const datePatterns = /date|posted|trans.*date/i;
  const merchantPatterns = /description|merchant|vendor|payee|memo/i;
  // Exclude "balance" and "running" from amount patterns
  const balancePatterns = /balance|running|bal\.|bal$/i;

  const dateCol = headers.find(h => datePatterns.test(h));
  const merchantCol = headers.find(h => merchantPatterns.test(h));

  // Find amount column - first, exclude any columns with "balance" or "running"
  // Then look for amount-related columns
  const amountCandidates = headers.filter(h => !balancePatterns.test(h.trim()));

  // Look for exact "Amount" or similar in the filtered candidates
  const amountPatterns = /^(amount|debit|credit|total|amt)$/i;
  const amountCol = amountCandidates.find(h => amountPatterns.test(h.trim()));

  if (dateCol && merchantCol && amountCol) {
    return {
      date: dateCol,
      merchant: merchantCol,
      amount: amountCol,
    };
  }

  return null;
}
