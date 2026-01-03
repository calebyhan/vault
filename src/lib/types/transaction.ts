export type Category = 'Dining' | 'Groceries' | 'Gas' | 'Travel' | 'Other';

export type TransactionType = 'purchase' | 'transfer' | 'income';

export interface Transaction {
  id: number;
  date: string;
  merchant: string;
  amount: number;
  category: Category;
  transaction_type: TransactionType;
  raw_description: string | null;
  created_at: string;
}

export interface MerchantMapping {
  merchant: string;
  category: Category;
  transaction_type: TransactionType;
  last_updated: string;
}

export interface TransactionFilters {
  search?: string;
  category?: string;
  transactionType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DashboardStats {
  totalSpent: number;
  transactionCount: number;
  avgAmount: number;
  topCategory: string;
  categoryTotals: Record<Category, number>;
  categoryPercentages: Record<Category, number>;
}
