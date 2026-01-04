export interface ElectronAPI {
  // Database operations
  getTransactions: (filters?: any) => Promise<any[]>;
  addTransaction: (transaction: any) => Promise<number>;
  updateTransaction: (id: number, updates: any) => Promise<void>;
  updateAllFromMerchant: (merchant: string, updates: any) => Promise<number>;
  deleteTransaction: (id: number) => Promise<void>;
  deleteAllTransactions: () => Promise<void>;

  // Merchant cache
  getCachedCategory: (merchant: string) => Promise<any | null>;
  cacheCategory: (merchant: string, category: string, type: string) => Promise<void>;

  // File operations
  selectCsvFile: () => Promise<string | null>;
  selectMultipleFiles: () => Promise<string[] | null>;
  parseFile: (filePath: string, manualMapping?: any) => Promise<any>;

  // Categorization
  categorizeTransaction: (merchant: string) => Promise<any>;
  batchCategorize: (merchants: string[]) => Promise<Map<string, any>>;

  // Analytics
  getDashboardStats: (dateFrom?: string, dateTo?: string) => Promise<any>;

  // Vendor matching
  findSimilarTransactions: (transactionId: number, threshold?: number) => Promise<any>;
  batchUpdateTransactions: (transactionIds: number[], updates: any) => Promise<number>;

  // Exchange rates
  getExchangeRate: (fromCurrency: string, toCurrency: string, date: string) => Promise<any>;
  convertCurrency: (amount: number, fromCurrency: string, toCurrency: string, date: string) => Promise<any>;

  // Duplicate detection
  findDuplicates: (transactions: Array<{date: string, merchant: string, amount: number}>) => Promise<any[]>;

  // Export
  exportTransactionsCSV: (filters?: any) => Promise<string>;
  exportTransactionsPDF: (filters?: any, dateFrom?: string, dateTo?: string) => Promise<string>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
