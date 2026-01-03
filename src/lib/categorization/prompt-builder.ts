export function buildCategorizationPrompt(merchantName: string): string {
  return `Categorize the following merchant transaction.

**Merchant Name:** ${merchantName}

**Categories:**
- Dining: Restaurants, cafes, fast food, bars, coffee shops, food delivery
- Groceries: Supermarkets (excluding warehouse clubs like Costco)
- Gas: Gas stations, fuel
- Travel: Airlines, hotels, car rentals, Airbnb, travel agencies
- Other: Everything else

**Transaction Types:**
- purchase: Standard spending transaction
- transfer: Money movement (Zelle, Venmo, PayPal, bank transfers, ATM)
- income: Deposits, paychecks, refunds, reimbursements

**Instructions:**
1. Analyze the merchant name
2. Determine the most likely category
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

Merchant: SHELL GAS STATION
→ { "category": "Gas", "transactionType": "purchase", "confidence": 0.99 }

Merchant: ZELLE SENT
→ { "category": "Other", "transactionType": "transfer", "confidence": 1.0 }

Now categorize: ${merchantName}`;
}
