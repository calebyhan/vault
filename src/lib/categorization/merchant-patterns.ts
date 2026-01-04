import type { Category, TransactionType } from '../types/transaction';

export interface MerchantPattern {
  keywords: string[];
  category: Category;
  transactionType: TransactionType;
  priority: number; // Higher priority patterns are checked first
}

/**
 * Merchant categorization patterns
 * Patterns are checked in order of priority (highest first)
 * Each pattern contains keywords that, if found in the merchant name, trigger the category
 */
export const MERCHANT_PATTERNS: MerchantPattern[] = [
  // Gas/Fuel - High priority to catch fuel-specific keywords
  {
    keywords: ['FUEL', 'SHELL', 'CHEVRON', 'EXXON', ' MOBIL ', 'BP ', 'TEXACO', 'ARCO', 'VALERO', 'SUNOCO', '76 ', 'CIRCLE K', 'MARATHON GAS', 'SPEEDWAY'],
    category: 'Gas',
    transactionType: 'purchase',
    priority: 100,
  },
  {
    keywords: ['KROGER FUEL', 'KROGER FU', 'WALMART FUEL', 'SAM\'S CLUB FUEL', 'COSTCO GAS', 'SAMS CLUB GAS'],
    category: 'Gas',
    transactionType: 'purchase',
    priority: 95,
  },

  // Groceries - Major supermarkets
  {
    keywords: ['KROGER', 'PUBLIX', 'SAFEWAY', 'ALBERTSONS', 'WHOLE FOODS', 'TRADER JOE', 'ALDI', 'LIDL', 'SPROUTS', 'WEGMANS', 'H E B', 'FRESH MARKET', 'FOOD LION', 'GIANT FOOD', 'STOP SHOP', 'HARRIS TEETER'],
    category: 'Groceries',
    transactionType: 'purchase',
    priority: 90,
  },
  // Walmart sub-types - Subscription vs groceries
  {
    keywords: ['WALMART+', 'WALMART PLUS', 'WALMARTPLUS'],
    category: 'Subscriptions',
    transactionType: 'purchase',
    priority: 93,
  },
  {
    keywords: ['WALMART', 'TARGET', 'MEIJER', 'WINCO'],
    category: 'Groceries',
    transactionType: 'purchase',
    priority: 85,
  },

  // Dining - Restaurants and food delivery
  {
    keywords: ['MCDONALD', 'BURGER KING', 'WENDY\'S', 'TACO BELL', 'KFC', 'CHICK FIL A', 'POPEYES', 'SUBWAY', 'ARBY\'S', 'SONIC', 'JACK IN THE BOX', 'CHIPOTLE', 'PANDA EXPRESS', 'FIVE GUYS', 'IN N OUT', 'SHAKE SHACK'],
    category: 'Dining',
    transactionType: 'purchase',
    priority: 90,
  },
  {
    keywords: ['STARBUCKS', 'DUNKIN', 'PANERA', 'CARIBOU COFFEE', 'PEET\'S COFFEE', 'DUTCH BROS'],
    category: 'Dining',
    transactionType: 'purchase',
    priority: 90,
  },
  // Food delivery - Higher priority to distinguish from generic rideshare
  {
    keywords: ['UBER *EATS', 'UBER EATS', 'UBEREATS'],
    category: 'Dining',
    transactionType: 'purchase',
    priority: 95,
  },
  // DoorDash sub-types - Subscription vs food delivery
  {
    keywords: ['DOORDASH *DASHPASS', 'DOORDASH DASHPASS', 'DASHPASS'],
    category: 'Subscriptions',
    transactionType: 'purchase',
    priority: 95,
  },
  {
    keywords: ['DOORDASH', 'GRUBHUB', 'POSTMATES', 'SEAMLESS', 'INSTACART', 'GOPUFF'],
    category: 'Dining',
    transactionType: 'purchase',
    priority: 92,
  },
  {
    keywords: ['RESTAURANT', 'CAFE', 'COFFEE', 'PIZZA', 'DINER', 'GRILL', 'BAR & GRILL', 'BISTRO', 'EATERY'],
    category: 'Dining',
    transactionType: 'purchase',
    priority: 80,
  },

  // Entertainment - Movies, streaming, events
  {
    keywords: ['AMC THEATRES', 'REGAL CINEMA', 'CINEMARK', 'IMAX', 'MOVIE', 'THEATER', 'CINEMA'],
    category: 'Entertainment',
    transactionType: 'purchase',
    priority: 90,
  },
  {
    keywords: ['TICKETMASTER', 'STUBHUB', 'EVENTBRITE', 'CONCERT', 'STADIUM', 'ARENA'],
    category: 'Entertainment',
    transactionType: 'purchase',
    priority: 90,
  },

  // Subscriptions - Streaming and recurring services
  // Amazon sub-types - Higher priority for specific services
  {
    keywords: ['AMAZON PRIME VIDEO', 'AMZN PRIME VIDEO', 'PRIME VIDEO'],
    category: 'Subscriptions',
    transactionType: 'purchase',
    priority: 97,
  },
  {
    keywords: ['NETFLIX', 'HULU', 'DISNEY PLUS', 'HBO MAX', 'APPLE TV', 'PARAMOUNT PLUS', 'PEACOCK', 'DISCOVERY PLUS'],
    category: 'Subscriptions',
    transactionType: 'purchase',
    priority: 95,
  },
  {
    keywords: ['SPOTIFY', 'APPLE MUSIC', 'YOUTUBE PREMIUM', 'YOUTUBE MUSIC', 'PANDORA', 'TIDAL'],
    category: 'Subscriptions',
    transactionType: 'purchase',
    priority: 95,
  },
  {
    keywords: ['GYM', 'FITNESS', 'PLANET FITNESS', 'LA FITNESS', 'EQUINOX', 'YMCA', 'CRUNCH'],
    category: 'Subscriptions',
    transactionType: 'purchase',
    priority: 90,
  },

  // Shopping - Retail and online
  // Amazon sub-types - Groceries vs generic shopping
  {
    keywords: ['AMAZON FRESH', 'AMZN FRESH', 'AMAZON GROCERY', 'WHOLE FOODS AMAZON'],
    category: 'Groceries',
    transactionType: 'purchase',
    priority: 94,
  },
  {
    keywords: ['AMAZON', 'AMZN'],
    category: 'Shopping',
    transactionType: 'purchase',
    priority: 92,
  },
  {
    keywords: ['BEST BUY', 'APPLE STORE', 'MICROSOFT STORE', 'GAMESTOP'],
    category: 'Shopping',
    transactionType: 'purchase',
    priority: 90,
  },
  {
    keywords: ['MACY', 'NORDSTROM', 'KOHL\'S', 'JC PENNEY', 'DILLARD', 'SAKS', 'NEIMAN MARCUS', 'BLOOMINGDALE'],
    category: 'Shopping',
    transactionType: 'purchase',
    priority: 90,
  },
  {
    keywords: ['TJ MAXX', 'MARSHALLS', 'ROSS', 'BURLINGTON', 'HOMEGOODS'],
    category: 'Shopping',
    transactionType: 'purchase',
    priority: 90,
  },

  // Healthcare - Medical and pharmacy
  {
    keywords: ['CVS PHARMACY', 'WALGREENS', 'RITE AID', 'DUANE READE', 'PHARMACY'],
    category: 'Healthcare',
    transactionType: 'purchase',
    priority: 90,
  },
  {
    keywords: ['DOCTOR', 'DENTIST', 'DENTAL', 'MEDICAL', 'CLINIC', 'HOSPITAL', 'URGENT CARE', 'HEALTH'],
    category: 'Healthcare',
    transactionType: 'purchase',
    priority: 85,
  },

  // Transportation - Transit, rideshare, tolls
  // Note: UBER *TRIP and generic UBER patterns have lower priority than UBER *EATS (95)
  {
    keywords: ['UBER *TRIP', 'UBER TRIP', 'UBER *RIDE', 'UBER RIDE'],
    category: 'Transportation',
    transactionType: 'purchase',
    priority: 93,
  },
  {
    keywords: ['UBER', 'LYFT', 'TAXI', 'CAB'],
    category: 'Transportation',
    transactionType: 'purchase',
    priority: 88,
  },
  {
    keywords: ['TOLL', 'PARKING', 'PARK', 'METRO', 'SUBWAY', 'TRANSIT', 'BUS FARE', 'TRAIN'],
    category: 'Transportation',
    transactionType: 'purchase',
    priority: 88,
  },

  // Travel - Airlines, hotels, car rentals
  {
    keywords: ['AIRLINES', 'DELTA', 'UNITED', 'AMERICAN AIR', 'SOUTHWEST', 'JETBLUE', 'SPIRIT', 'FRONTIER', 'ALASKA AIR'],
    category: 'Travel',
    transactionType: 'purchase',
    priority: 95,
  },
  {
    keywords: ['MARRIOTT', 'HILTON', 'HYATT', 'IHG', 'HOLIDAY INN', 'BEST WESTERN', 'RADISSON', 'SHERATON', 'WESTIN', 'HOTEL', 'MOTEL', 'INN', 'RESORT', 'AIRBNB', 'VRBO'],
    category: 'Travel',
    transactionType: 'purchase',
    priority: 92,
  },
  {
    keywords: ['HERTZ', 'ENTERPRISE', 'BUDGET', 'AVIS', 'NATIONAL CAR', 'ALAMO', 'THRIFTY', 'DOLLAR RENT'],
    category: 'Travel',
    transactionType: 'purchase',
    priority: 92,
  },

  // Home & Garden - Home improvement
  {
    keywords: ['HOME DEPOT', 'LOWE\'S', 'ACE HARDWARE', 'TRUE VALUE', 'MENARDS', 'HARBOR FREIGHT'],
    category: 'Home & Garden',
    transactionType: 'purchase',
    priority: 90,
  },
  {
    keywords: ['GARDEN', 'NURSERY', 'LANDSCAPE', 'LAWN'],
    category: 'Home & Garden',
    transactionType: 'purchase',
    priority: 85,
  },

  // Bills & Utilities - Recurring bills
  {
    keywords: ['VERIZON', 'AT&T', 'T MOBILE', 'SPRINT', 'COMCAST', 'XFINITY', 'SPECTRUM', 'COX COMMUNICATIONS', 'INTERNET', 'ELECTRIC', 'WATER', 'GAS COMPANY', 'UTILITY'],
    category: 'Bills & Utilities',
    transactionType: 'purchase',
    priority: 90,
  },
  {
    keywords: ['INSURANCE', 'GEICO', 'STATE FARM', 'ALLSTATE', 'PROGRESSIVE'],
    category: 'Bills & Utilities',
    transactionType: 'purchase',
    priority: 88,
  },

  // Personal Care - Salon, barber, beauty
  {
    keywords: ['SALON', 'BARBER', 'HAIR', 'NAIL', 'SPA', 'MASSAGE', 'ULTA', 'SEPHORA', 'BEAUTY'],
    category: 'Personal Care',
    transactionType: 'purchase',
    priority: 88,
  },

  // Transfers - Money movement (highest priority for safety)
  {
    keywords: ['APPLE CASH', 'APPLE PAY CASH'],
    category: 'Other',
    transactionType: 'transfer',
    priority: 99,
  },
  {
    keywords: ['ZELLE', 'VENMO', 'PAYPAL', 'CASH APP', 'TRANSFER', 'ATM WITHDRAWAL', 'WIRE TRANSFER', 'ACH TRANSFER', 'AUTOPAY'],
    category: 'Other',
    transactionType: 'transfer',
    priority: 98,
  },

  // Income - Deposits and refunds
  {
    keywords: ['PAYROLL', 'DIRECT DEPOSIT', 'REFUND', 'REIMBURSEMENT', 'SALARY', 'WAGES'],
    category: 'Other',
    transactionType: 'income',
    priority: 99,
  },
];

/**
 * Normalize a merchant name for base matching
 * This strips store numbers and location identifiers to group variations
 * Examples:
 *   "KROGER #1234" -> "KROGER"
 *   "STARBUCKS STORE 5678" -> "STARBUCKS"
 *   "WALMART SUPERCENTER #123" -> "WALMART"
 */
export function normalizeToBaseMerchant(merchant: string): string {
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
    .replace(/\s+MARKET/g, '')
    // Remove dates and transaction IDs
    .replace(/\d{2}\/\d{2}\/\d{4}/g, '')
    .replace(/\d{2}\/\d{2}/g, '')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
}

/**
 * Categorize a merchant based on keyword patterns
 * Returns the category and transaction type if a match is found, or null if no match
 */
export function categorizeMerchantByPattern(
  merchant: string
): { category: Category; transactionType: TransactionType } | null {
  const normalizedMerchant = merchant.toUpperCase();
  const baseMerchant = normalizeToBaseMerchant(merchant);

  // Sort patterns by priority (highest first)
  const sortedPatterns = [...MERCHANT_PATTERNS].sort((a, b) => b.priority - a.priority);

  for (const pattern of sortedPatterns) {
    for (const keyword of pattern.keywords) {
      // Check against both the full merchant name and the base merchant name
      if (normalizedMerchant.includes(keyword) || baseMerchant.includes(keyword)) {
        return {
          category: pattern.category,
          transactionType: pattern.transactionType,
        };
      }
    }
  }

  return null;
}
