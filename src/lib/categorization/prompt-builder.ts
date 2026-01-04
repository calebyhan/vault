export function buildCategorizationPrompt(merchantName: string): string {
  return `Categorize the following merchant transaction.

**Merchant Name:** ${merchantName}

**Categories:**
- Dining: Restaurants, cafes, fast food, bars, coffee shops, food delivery (DoorDash, Uber Eats)
- Groceries: Supermarkets (Kroger, Walmart, Publix, Whole Foods, Trader Joe's, Aldi)
- Gas: Gas stations, fuel (Shell, Chevron, Kroger Fuel, BP, Exxon)
- Travel: Airlines, hotels, car rentals, Airbnb, travel booking sites
- Entertainment: Movies, concerts, sports events, theaters, music venues
- Shopping: Retail stores, online shopping (Amazon, Target, Best Buy, department stores)
- Healthcare: Pharmacies, doctor visits, dentist, medical services (CVS, Walgreens)
- Transportation: Rideshare (Uber, Lyft), public transit, tolls, parking
- Subscriptions: Streaming services (Netflix, Spotify), gym memberships, recurring services
- Home & Garden: Home improvement stores (Home Depot, Lowe's), garden supplies
- Bills & Utilities: Phone, internet, electric, insurance, recurring bills
- Personal Care: Salon, barber, spa, beauty products (Ulta, Sephora)
- Other: Everything else that doesn't fit the above categories

**Transaction Types:**
- purchase: Standard spending transaction
- transfer: Money movement (Zelle, Venmo, PayPal, bank transfers, ATM withdrawals)
- income: Deposits, paychecks, refunds, reimbursements

**Important Rules:**
1. Kroger Fuel/KROGER FU = Gas (not Groceries)
2. Regular KROGER (without "FUEL" or "FU") = Groceries
3. Walmart/Target without specific department = Shopping or Groceries (use context)
4. Amazon = Shopping
5. Food delivery services = Dining

**Instructions:**
1. Analyze the merchant name
2. Determine the most likely category based on the merchant's primary business
3. Identify the transaction type
4. Provide a confidence score (0.0 to 1.0)

**Output Format (JSON only, no markdown):**
{
  "category": "Dining",
  "transactionType": "purchase",
  "confidence": 0.95
}

**Examples:**

Merchant: STARBUCKS
→ { "category": "Dining", "transactionType": "purchase", "confidence": 0.99 }

Merchant: WHOLE FOODS MARKET
→ { "category": "Groceries", "transactionType": "purchase", "confidence": 0.98 }

Merchant: KROGER #1234
→ { "category": "Groceries", "transactionType": "purchase", "confidence": 0.98 }

Merchant: KROGER FUEL #9686
→ { "category": "Gas", "transactionType": "purchase", "confidence": 0.99 }

Merchant: SHELL GAS STATION
→ { "category": "Gas", "transactionType": "purchase", "confidence": 0.99 }

Merchant: NETFLIX
→ { "category": "Subscriptions", "transactionType": "purchase", "confidence": 0.99 }

Merchant: AMAZON
→ { "category": "Shopping", "transactionType": "purchase", "confidence": 0.95 }

Merchant: CVS PHARMACY
→ { "category": "Healthcare", "transactionType": "purchase", "confidence": 0.98 }

Merchant: UBER
→ { "category": "Transportation", "transactionType": "purchase", "confidence": 0.98 }

Merchant: ZELLE SENT
→ { "category": "Other", "transactionType": "transfer", "confidence": 1.0 }

Now categorize: ${merchantName}`;
}
