/**
 * Normalize merchant name for caching and lookup
 * This is used for the merchant_mappings cache table
 * It removes special characters but preserves store numbers for specific matching
 */
export function normalizeMerchant(merchant: string): string {
  return merchant
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim()
    .substring(0, 100); // Limit length
}

/**
 * Get the base merchant name without store numbers or location identifiers
 * This is used for grouping merchant variations together
 * Examples:
 *   "KROGER #1234" -> "KROGER"
 *   "WALMART SUPERCENTER" -> "WALMART"
 */
export function getBaseMerchantName(merchant: string): string {
  let normalized = merchant.toUpperCase().trim();

  // Remove common patterns
  normalized = normalized
    // Remove store/location numbers
    .replace(/#\d+/g, '')
    .replace(/STORE\s*\d+/g, '')
    .replace(/LOCATION\s*\d+/g, '')
    .replace(/BRANCH\s*\d+/g, '')
    // Remove common suffixes
    .replace(/\s+SUPERCENTER/g, '')
    .replace(/\s+MARKETPLACE/g, '')
    .replace(/\s+STORE/g, '')
    .replace(/\s+CENTER/g, '')
    // Remove dates and transaction IDs
    .replace(/\d{2}\/\d{2}\/\d{4}/g, '')
    .replace(/\d{2}\/\d{2}/g, '')
    // Clean up special characters
    .replace(/[^A-Z0-9\s]/g, '')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
}
