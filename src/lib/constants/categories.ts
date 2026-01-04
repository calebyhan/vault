import type { Category } from '../types/transaction';

export type { Category } from '../types/transaction';

export const CATEGORIES: Category[] = [
  'Dining',
  'Groceries',
  'Gas',
  'Travel',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Transportation',
  'Subscriptions',
  'Home & Garden',
  'Bills & Utilities',
  'Personal Care',
  'Other',
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Dining: '#8b5cf6',          // Purple
  Groceries: '#10b981',       // Green
  Gas: '#f59e0b',             // Orange
  Travel: '#3b82f6',          // Blue
  Entertainment: '#ec4899',   // Pink
  Shopping: '#14b8a6',        // Teal
  Healthcare: '#ef4444',      // Red
  Transportation: '#a855f7',  // Purple (darker)
  Subscriptions: '#06b6d4',   // Cyan
  'Home & Garden': '#84cc16', // Lime
  'Bills & Utilities': '#f97316', // Orange (darker)
  'Personal Care': '#d946ef', // Fuchsia
  Other: '#6b7280',           // Gray
};

export const TRANSACTION_TYPES = ['purchase', 'transfer', 'income'] as const;

export const TYPE_COLORS: Record<string, string> = {
  purchase: '#ef4444',  // Red
  transfer: '#f59e0b',  // Amber/Orange
  income: '#10b981',    // Green
};
