import type { CurrencyCode } from '../types/transaction';

export interface CurrencyFormat {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimals: number;
}

export const CURRENCY_INFO: Record<CurrencyCode, CurrencyFormat> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', decimals: 2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', decimals: 2 },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', decimals: 2 },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', decimals: 2 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', decimals: 2 },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimals: 2 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2 },
};

/**
 * Format amount in USD (always 2 decimals, $ prefix)
 */
export function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Format amount in original currency
 */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const info = CURRENCY_INFO[currency];
  if (!info) {
    return `${amount.toFixed(2)} ${currency}`;
  }

  const formatted = amount.toFixed(info.decimals);

  // Some currencies put symbol after amount
  if (currency === 'SEK' || currency === 'NOK' || currency === 'DKK') {
    return `${formatted} ${info.symbol}`;
  }

  return `${info.symbol}${formatted}`;
}

/**
 * Format transaction with both USD and original currency
 */
export function formatTransactionAmount(
  usdAmount: number,
  originalAmount: number,
  originalCurrency: CurrencyCode,
  showOriginal: boolean = true
): string {
  const usd = formatUSD(usdAmount);

  if (!showOriginal || originalCurrency === 'USD') {
    return usd;
  }

  const original = formatCurrency(originalAmount, originalCurrency);
  return `${usd} (${original})`;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCY_INFO[currency]?.symbol || currency;
}

/**
 * Get list of supported currencies for dropdown
 */
export function getSupportedCurrencies(): CurrencyFormat[] {
  return Object.values(CURRENCY_INFO);
}
