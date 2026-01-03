export function normalizeMerchant(merchant: string): string {
  return merchant
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim()
    .substring(0, 100); // Limit length
}
