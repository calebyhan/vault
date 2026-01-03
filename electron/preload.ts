import { contextBridge, ipcRenderer } from 'electron';

// Define the ElectronAPI type
export interface ElectronAPI {
  // Database operations
  getTransactions: (filters?: any) => Promise<any[]>;
  addTransaction: (transaction: any) => Promise<number>;
  updateTransaction: (id: number, updates: any) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  deleteAllTransactions: () => Promise<void>;

  // Merchant cache
  getCachedCategory: (merchant: string) => Promise<any | null>;
  cacheCategory: (merchant: string, category: string, type: string) => Promise<void>;

  // File operations
  selectCsvFile: () => Promise<string | null>;
  parseFile: (filePath: string) => Promise<any>;

  // Categorization
  categorizeTransaction: (merchant: string) => Promise<any>;
  batchCategorize: (merchants: string[]) => Promise<Map<string, any>>;

  // Analytics
  getDashboardStats: (dateFrom?: string, dateTo?: string) => Promise<any>;
}

const electronAPI: ElectronAPI = {
  // Database operations
  getTransactions: (filters) => ipcRenderer.invoke('db:get-transactions', filters),
  addTransaction: (transaction) => ipcRenderer.invoke('db:add-transaction', transaction),
  updateTransaction: (id, updates) => ipcRenderer.invoke('db:update-transaction', id, updates),
  deleteTransaction: (id) => ipcRenderer.invoke('db:delete-transaction', id),
  deleteAllTransactions: () => ipcRenderer.invoke('db:delete-all-transactions'),

  // Merchant cache
  getCachedCategory: (merchant) => ipcRenderer.invoke('db:get-cached-category', merchant),
  cacheCategory: (merchant, category, type) =>
    ipcRenderer.invoke('db:cache-category', merchant, category, type),

  // File operations
  selectCsvFile: () => ipcRenderer.invoke('file:select-csv'),
  parseFile: (filePath) => ipcRenderer.invoke('file:parse-file', filePath),

  // Categorization
  categorizeTransaction: (merchant) => ipcRenderer.invoke('ai:categorize', merchant),
  batchCategorize: (merchants) => ipcRenderer.invoke('ai:batch-categorize', merchants),

  // Analytics
  getDashboardStats: (dateFrom, dateTo) =>
    ipcRenderer.invoke('analytics:get-stats', dateFrom, dateTo),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// TypeScript declaration
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
