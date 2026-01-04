export interface VendorExtraction {
  coreName: string;
  storeId?: string;
  location?: string;
  originalMerchant: string;
}

/**
 * Extract core vendor name from transaction merchant string
 * Removes store IDs, locations, and other metadata to identify the core vendor
 */
export function extractVendorCore(merchant: string): VendorExtraction {
  // Normalize the input
  const normalized = merchant.toUpperCase().trim();

  let working = normalized;
  let storeId: string | undefined;
  let location: string | undefined;

  // Store ID patterns
  const storeIdPatterns = [
    { regex: /#(\d+)/, name: 'hash-number' },
    { regex: /STORE\s*#?\s*(\d+)/, name: 'store-number' },
    { regex: /STO\s*#?\s*(\d+)/, name: 'sto-number' },
    { regex: /T-(\d+)/, name: 't-number' },
    { regex: /MKT\s*#?(\d+)/, name: 'mkt-number' },
    { regex: /\b(\d{4,6})\b/, name: 'standalone-digits' }, // 4-6 digit standalone numbers
  ];

  // Extract store ID (try each pattern)
  for (const pattern of storeIdPatterns) {
    const match = working.match(pattern.regex);
    if (match) {
      storeId = match[1];
      // Remove the matched store ID pattern from working string
      working = working.replace(match[0], ' ');
      break;
    }
  }

  // Location patterns (city/state at end)
  const locationPatterns = [
    /\s+([A-Z\s]{2,})\s+([A-Z]{2})$/, // SEATTLE WA
    /\s+([A-Z\s]+),\s*([A-Z]{2})$/, // SEATTLE, WA
  ];

  // Extract location
  for (const pattern of locationPatterns) {
    const match = working.match(pattern);
    if (match) {
      location = `${match[1].trim()} ${match[2]}`;
      working = working.replace(match[0], '');
      break;
    }
  }

  // Payment processor prefixes (remove these)
  const processorPrefixes = [
    /^SQ\s+\*\s*/,       // Square
    /^PAYPAL\s+\*\s*/,   // PayPal
    /^AMZN\s+MKTP\s*/,   // Amazon Marketplace
    /^TST\s+\*\s*/,      // Toast POS
    /^SP\s+\*\s*/,       // Shopify
  ];

  for (const pattern of processorPrefixes) {
    working = working.replace(pattern, '');
  }

  // Common suffixes to remove
  const suffixes = [
    /\s+INC\.?$/,
    /\s+LLC\.?$/,
    /\s+CORP\.?$/,
    /\s+CO\.?$/,
    /\s+LTD\.?$/,
  ];

  for (const pattern of suffixes) {
    working = working.replace(pattern, '');
  }

  // Clean up multiple spaces and special characters
  working = working
    .replace(/[^A-Z0-9\s]/g, ' ')  // Replace special chars with space
    .replace(/\s+/g, ' ')           // Collapse multiple spaces
    .trim();

  // Remove common filler words at the end
  const fillerWords = ['THE', 'AND', 'OF', 'FOR'];
  const words = working.split(' ');
  while (words.length > 1 && fillerWords.includes(words[words.length - 1])) {
    words.pop();
  }

  const coreName = words.join(' ');

  return {
    coreName: coreName || normalized, // Fallback to normalized if extraction fails
    storeId,
    location,
    originalMerchant: merchant,
  };
}
