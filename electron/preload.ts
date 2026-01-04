import { contextBridge, ipcRenderer } from 'electron';

// Define the ElectronAPI type
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

const electronAPI: ElectronAPI = {
  // Database operations
  getTransactions: (filters) => ipcRenderer.invoke('db:get-transactions', filters),
  addTransaction: (transaction) => ipcRenderer.invoke('db:add-transaction', transaction),
  updateTransaction: (id, updates) => ipcRenderer.invoke('db:update-transaction', id, updates),
  updateAllFromMerchant: (merchant, updates) => ipcRenderer.invoke('db:update-all-from-merchant', merchant, updates),
  deleteTransaction: (id) => ipcRenderer.invoke('db:delete-transaction', id),
  deleteAllTransactions: () => ipcRenderer.invoke('db:delete-all-transactions'),

  // Merchant cache
  getCachedCategory: (merchant) => ipcRenderer.invoke('db:get-cached-category', merchant),
  cacheCategory: (merchant, category, type) =>
    ipcRenderer.invoke('db:cache-category', merchant, category, type),

  // File operations
  selectCsvFile: () => ipcRenderer.invoke('file:select-csv'),
  selectMultipleFiles: () => ipcRenderer.invoke('file:select-multiple'),
  parseFile: (filePath, manualMapping) => ipcRenderer.invoke('file:parse-file', filePath, manualMapping),

  // Categorization
  categorizeTransaction: (merchant) => ipcRenderer.invoke('ai:categorize', merchant),
  batchCategorize: (merchants) => ipcRenderer.invoke('ai:batch-categorize', merchants),

  // Analytics
  getDashboardStats: (dateFrom, dateTo) =>
    ipcRenderer.invoke('analytics:get-stats', dateFrom, dateTo),

  // Vendor matching
  findSimilarTransactions: (transactionId, threshold) =>
    ipcRenderer.invoke('db:find-similar-transactions', transactionId, threshold),
  batchUpdateTransactions: (transactionIds, updates) =>
    ipcRenderer.invoke('db:batch-update-transactions', transactionIds, updates),

  // Exchange rates
  getExchangeRate: (fromCurrency, toCurrency, date) =>
    ipcRenderer.invoke('exchange:get-rate', fromCurrency, toCurrency, date),
  convertCurrency: (amount, fromCurrency, toCurrency, date) =>
    ipcRenderer.invoke('exchange:convert', amount, fromCurrency, toCurrency, date),

  // Duplicate detection
  findDuplicates: (transactions) => ipcRenderer.invoke('db:find-duplicates', transactions),

  // Export
  exportTransactionsCSV: (filters) => ipcRenderer.invoke('export:transactions-csv', filters),
  exportTransactionsPDF: (filters, dateFrom, dateTo) =>
    ipcRenderer.invoke('export:transactions-pdf', filters, dateFrom, dateTo),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// TypeScript declaration
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
