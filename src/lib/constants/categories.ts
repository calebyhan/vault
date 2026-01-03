import type { Category } from '../types/transaction';

export const CATEGORIES: Category[] = ['Dining', 'Groceries', 'Gas', 'Travel', 'Other'];

export const CATEGORY_COLORS: Record<Category, string> = {
  Dining: '#8b5cf6',
  Groceries: '#10b981',
  Gas: '#f59e0b',
  Travel: '#3b82f6',
  Other: '#6b7280',
};

export const TRANSACTION_TYPES = ['purchase', 'transfer', 'income'] as const;
