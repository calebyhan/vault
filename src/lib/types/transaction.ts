export type Category =
  | 'Dining'
  | 'Groceries'
  | 'Gas'
  | 'Travel'
  | 'Entertainment'
  | 'Shopping'
  | 'Healthcare'
  | 'Transportation'
  | 'Subscriptions'
  | 'Home & Garden'
  | 'Bills & Utilities'
  | 'Personal Care'
  | 'Other';

export type TransactionType = 'purchase' | 'transfer' | 'income';

// ISO 4217 currency codes (common ones)
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'SEK' | 'NOK' | 'DKK' | 'CHF' | 'CNY' | 'INR';

export interface Transaction {
  id: number;
  date: string;
  merchant: string;
  amount: number; // This is the USD amount for display
  category: Category;
  transaction_type: TransactionType;
  raw_description: string | null;
  created_at: string;

  // Multi-currency fields
  original_currency: CurrencyCode;
  original_amount: number;
  exchange_rate: number;
  usd_amount: number;
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
  currency?: CurrencyCode; // New filter option
}

export interface DashboardStats {
  totalSpent: number; // Always in USD
  transactionCount: number;
  avgAmount: number; // Always in USD
  topCategory: string;
  categoryTotals: Record<Category, number>; // Always in USD
  categoryPercentages: Record<Category, number>;
  currencyBreakdown?: Record<CurrencyCode, number>; // Optional: show original currency distribution
}
