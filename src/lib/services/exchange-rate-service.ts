import Database from 'better-sqlite3';

export interface ExchangeRate {
  from_currency: string;
  to_currency: string;
  rate: number;
  date: string;
}

export interface ExchangeRateResponse {
  rate: number;
  cached: boolean;
  date: string;
}

export class ExchangeRateService {
  private db: Database.Database;
  // Free currency API with no rate limits or API key required
  private primaryApiUrl: string = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@';
  private fallbackApiUrl: string = 'https://currency-api.pages.dev/';

  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * Get exchange rate for a specific date, using cache if available
   */
  async getRate(
    fromCurrency: string,
    toCurrency: string,
    date: string
  ): Promise<ExchangeRateResponse> {
    // Normalize currencies to uppercase
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    // USD to USD is always 1.0
    if (from === to) {
      return { rate: 1.0, cached: true, date };
    }

    // Check cache first
    const cached = this.getCachedRate(from, to, date);
    if (cached) {
      return { rate: cached.rate, cached: true, date: cached.date };
    }

    // Fetch from API
    try {
      const rate = await this.fetchRateFromAPI(from, to, date);

      // Cache the result
      this.cacheRate(from, to, date, rate);

      return { rate, cached: false, date };
    } catch (error) {
      console.error(`Failed to fetch exchange rate for ${from}→${to} on ${date}:`, error);
      throw new Error(`Could not fetch exchange rate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get cached exchange rate from database
   */
  private getCachedRate(
    fromCurrency: string,
    toCurrency: string,
    date: string
  ): ExchangeRate | null {
    try {
      const stmt = this.db.prepare(`
        SELECT from_currency, to_currency, rate, date
        FROM exchange_rates
        WHERE from_currency = ? AND to_currency = ? AND date = ?
      `);

      return stmt.get(fromCurrency, toCurrency, date) as ExchangeRate | null;
    } catch (error) {
      console.error('Error reading from exchange_rates cache:', error);
      return null;
    }
  }

  /**
   * Cache exchange rate in database
   */
  private cacheRate(
    fromCurrency: string,
    toCurrency: string,
    date: string,
    rate: number
  ): void {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO exchange_rates (from_currency, to_currency, rate, date)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(from_currency, to_currency, date) DO UPDATE SET
          rate = excluded.rate,
          created_at = CURRENT_TIMESTAMP
      `);

      stmt.run(fromCurrency, toCurrency, date, rate);
    } catch (error) {
      console.error('Error caching exchange rate:', error);
    }
  }

  /**
   * Fetch exchange rate from API
   * Uses free currency-api with automatic fallback
   */
  private async fetchRateFromAPI(
    fromCurrency: string,
    toCurrency: string,
    date: string
  ): Promise<number> {
    const fromLower = fromCurrency.toLowerCase();
    const toLower = toCurrency.toLowerCase();

    // Try primary CDN first
    const primaryUrl = `${this.primaryApiUrl}${date}/v1/currencies/${fromLower}.json`;

    try {
      const response = await fetch(primaryUrl);

      if (!response.ok) {
        throw new Error(`Primary API returned ${response.status}`);
      }

      const data = await response.json() as {
        date: string;
        [key: string]: any;
      };

      // The API returns data in format: { "date": "2024-01-01", "eur": { "usd": 1.234, ... } }
      const rates = data[fromLower];

      if (!rates || typeof rates[toLower] !== 'number') {
        throw new Error(`No rate found for ${fromCurrency}→${toCurrency}`);
      }

      return rates[toLower];
    } catch (primaryError) {
      // Fallback to Cloudflare Pages
      console.warn('Primary API failed, trying fallback:', primaryError);

      const fallbackUrl = `${this.fallbackApiUrl}${date}/v1/currencies/${fromLower}.json`;

      try {
        const response = await fetch(fallbackUrl);

        if (!response.ok) {
          throw new Error(`Fallback API returned ${response.status}`);
        }

        const data = await response.json() as {
          date: string;
          [key: string]: any;
        };

        const rates = data[fromLower];

        if (!rates || typeof rates[toLower] !== 'number') {
          throw new Error(`No rate found for ${fromCurrency}→${toCurrency}`);
        }

        return rates[toLower];
      } catch (fallbackError) {
        throw new Error(`Both APIs failed. Primary: ${primaryError instanceof Error ? primaryError.message : primaryError}, Fallback: ${fallbackError instanceof Error ? fallbackError.message : fallbackError}`);
      }
    }
  }

  /**
   * Batch fetch multiple exchange rates (more efficient for imports)
   */
  async batchGetRates(
    requests: Array<{ from: string; to: string; date: string }>
  ): Promise<Map<string, ExchangeRateResponse>> {
    const results = new Map<string, ExchangeRateResponse>();

    for (const req of requests) {
      const key = `${req.from}_${req.to}_${req.date}`;
      try {
        const result = await this.getRate(req.from, req.to, req.date);
        results.set(key, result);
      } catch (error) {
        console.error(`Failed to get rate for ${key}:`, error);
        // Store error or default to 1.0 with warning
        results.set(key, { rate: 1.0, cached: false, date: req.date });
      }
    }

    return results;
  }

  /**
   * Convert amount from one currency to another
   */
  async convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    date: string
  ): Promise<{ usdAmount: number; rate: number }> {
    const rateResponse = await this.getRate(fromCurrency, toCurrency, date);
    const usdAmount = amount * rateResponse.rate;

    return { usdAmount, rate: rateResponse.rate };
  }
}
