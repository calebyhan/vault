# Product Roadmap

## Table of Contents

- [Vision](#vision)
- [Current Status](#current-status)
- [Phase 1: MVP](#phase-1-mvp-minimum-viable-product)
- [Phase 2: Enhanced Analytics](#phase-2-enhanced-analytics)
- [Phase 3: Advanced Features](#phase-3-advanced-features)
- [Phase 4: Intelligence & Automation](#phase-4-intelligence--automation)
- [Future Possibilities](#future-possibilities)
- [Known Limitations](#known-limitations)
- [Community Requests](#community-requests)

## Vision

Build the best local-first credit card spending analyzer that helps users:

1. **Understand spending patterns** across credit card reward categories
2. **Optimize credit card selection** based on actual spending data
3. **Track budgets** and financial goals (future)
4. **Maintain complete privacy** with local-only data storage

**Core Principles:**
- Privacy-first (local storage only)
- Simple and intuitive UX
- Fast performance
- Cross-platform desktop support

## Current Status

**Status:** 🎉 **MVP Complete!** - Ready for Beta Testing

**Completed:**
- ✅ Project architecture defined
- ✅ Database schema designed
- ✅ Technology stack selected
- ✅ Comprehensive documentation written
- ✅ Development environment setup
- ✅ Electron + Next.js implementation
- ✅ All MVP features implemented and tested
- ✅ Multi-currency support added
- ✅ Vendor matching system implemented
- ✅ Duplicate detection implemented
- ✅ Export functionality (CSV & HTML reports)

**Current Phase:**
- 🚀 Beta testing
- 🚀 User feedback collection
- 🚀 Production deployment preparation

**Next Steps:**
- Begin Phase 2 development (enhanced analytics)
- Implement budget tracking
- Add recurring transaction detection

## Phase 1: MVP (Minimum Viable Product)

**Goal:** Launch a working desktop app that imports CSV files and provides basic spending analytics.

**Status:** ✅ **100% Complete** (Completed: January 2026)

### Features

#### 1.1 CSV/Multi-Format Import ✅ Complete

**Description:** Import credit card transaction files from any bank in multiple formats

**Implemented Features:**
- ✅ Drag-and-drop file upload
- ✅ File picker support (multiple files)
- ✅ Auto-detect CSV/XLSX/TXT/PDF columns
- ✅ Manual column mapping fallback with visual UI
- ✅ Preview before import (first 10 rows)
- ✅ Import progress indicator
- ✅ **Duplicate detection** with visual warnings
- ✅ Error handling (invalid files, missing columns)
- ✅ Multi-currency detection and support

**Priority:** Critical ✅
**Complexity:** Medium

#### 1.2 Automatic Categorization ✅ Complete

**Description:** AI-powered transaction categorization using Gemini API

**Implemented Features:**
- ✅ Normalize merchant names
- ✅ 3-tier categorization system (patterns, cache, API)
- ✅ 277 hardcoded merchant patterns (instant categorization)
- ✅ Check merchant cache before API call
- ✅ Categorize into 13 categories (expanded from 5)
- ✅ Detect transaction types (purchase, transfer, income)
- ✅ Optimized batch processing (all merchants in ONE API call)
- ✅ Cache results in merchant_mappings table
- ✅ Pattern-based categorization for known merchants

**Priority:** Critical ✅
**Complexity:** High

#### 1.3 Dashboard Analytics ✅ Complete

**Description:** Visual dashboard showing spending breakdown by category

**Implemented Features:**
- ✅ Stats cards (total spent, transaction count, avg amount, top category)
- ✅ Interactive pie chart (category breakdown with percentages)
- ✅ Stacked monthly bar chart (trend over time)
- ✅ Date range filters (6M/12M/24M/36M/All time, custom)
- ✅ Exclude transfers and income from spending analysis
- ✅ Responsive layout
- ✅ Multi-currency support (all displayed in USD)
- ✅ Category breakdown toggle

**Priority:** Critical ✅
**Complexity:** Medium

#### 1.4 Transaction Management ✅ Complete

**Description:** View, search, filter, and edit transactions

**Implemented Features:**
- ✅ Sortable table (date, merchant, amount, category)
- ✅ Pagination (configurable, default 50 per page)
- ✅ Search by merchant name or description
- ✅ Filter by category
- ✅ Filter by transaction type
- ✅ Filter by date range (custom date pickers)
- ✅ Inline category editing (dropdown)
- ✅ Inline transaction type editing (dropdown)
- ✅ Delete transactions (with confirmation)
- ✅ Bulk delete similar transactions
- ✅ Update merchant cache on manual edits
- ✅ **Vendor similarity matching** (find and bulk-update similar merchants)
- ✅ Currency display (original + USD converted)
- ✅ Problematic date detection and warnings
- ✅ **Export to CSV** (with all active filters)

**Priority:** High ✅
**Complexity:** Medium

#### 1.5 Database & Storage ✅ Complete

**Description:** Local SQLite database for transaction storage

**Implemented Features:**
- ✅ SQLite database initialization on first launch
- ✅ Create `transactions`, `merchant_mappings`, and `exchange_rates` tables
- ✅ Indexed queries for performance
- ✅ Database stored in app data directory
- ✅ File permissions (user-only read/write)
- ✅ Migration system for schema updates
- ✅ Multi-currency columns in base schema
- ✅ Exchange rate caching

**Priority:** Critical ✅
**Complexity:** Low

#### 1.6 Multi-Currency Support ✅ Complete (Bonus Feature)

**Description:** Support transactions in multiple currencies with automatic conversion

**Implemented Features:**
- ✅ Support for 12 currencies (USD, EUR, GBP, JPY, CAD, AUD, SEK, NOK, DKK, CHF, CNY, INR)
- ✅ Automatic currency detection from transaction descriptions
- ✅ Real-time exchange rate fetching with caching
- ✅ Free API with CDN + fallback endpoints
- ✅ Store both original and USD-converted amounts
- ✅ Currency selector in transaction editing

**Priority:** High ✅
**Complexity:** Medium

#### 1.7 Export Functionality ✅ Complete

**Description:** Export transaction data for external analysis

**Implemented Features:**
- ✅ **Export to CSV** with all filtered transactions
- ✅ **Export to HTML Report** (printable to PDF)
- ✅ Proper CSV formatting with quote escaping
- ✅ Multi-currency data in exports
- ✅ Native file save dialogs
- ✅ Reports include statistics and category breakdowns

**Priority:** High ✅
**Complexity:** Low

### MVP Success Metrics - All Achieved! ✅

- ✅ User can import 500+ transactions in < 30 seconds
- ✅ AI categorization accuracy > 85% (with 277 pattern matches)
- ✅ Dashboard loads in < 1 second
- ✅ Zero data transmitted to cloud (except merchant names to Gemini)
- ✅ Works offline for viewing and manual categorization
- ✅ Duplicate detection prevents re-imports
- ✅ Multi-currency support with automatic conversion
- ✅ Export functionality implemented (CSV & HTML)
- ✅ Vendor matching for bulk updates

### Beyond MVP - Bonus Features Implemented

Features that exceeded original MVP scope:
- ✅ **Multi-currency support** (12 currencies with auto-conversion)
- ✅ **Vendor similarity matching** (Jaro-Winkler fuzzy matching)
- ✅ **Duplicate detection** (prevents re-importing existing transactions)
- ✅ **Export functionality** (CSV + HTML reports)
- ✅ **Pattern-based categorization** (277 hardcoded merchant patterns)
- ✅ **Date normalization** (handles multiple date formats)
- ✅ **Pagination** (configurable items per page)
- ✅ **Expanded categories** (13 categories instead of original 5)

### What's Coming in Phase 2

**Features NOT included in MVP (planned for Phase 2+):**
- Budget tracking and alerts
- Recurring transaction detection
- Credit card comparison tool
- Multi-device sync
- Mobile app
- Additional spending categories (Entertainment, Streaming, Transit, etc.)
- Investment tracking

## Phase 2: Enhanced Analytics

**Goal:** Add deeper insights and analysis tools

**Timeline:** 4-6 weeks after MVP launch

### Features

#### 2.1 Advanced Category Analytics 📋 Future

**Description:** Drill-down analysis for each category

**Features:**
- Top merchants per category
- Average transaction by category
- Category spending trends (up/down vs. previous period)
- Subcategory breakdown (e.g., Fast Food vs. Sit-Down Dining)
- Month-over-month comparison

**Priority:** Medium
**Complexity:** Medium

#### 2.2 Budget Tracking 📋 Future

**Description:** Set and monitor category budgets

**Features:**
- Set monthly budget per category
- Progress bars showing % of budget used
- Notifications when approaching limit (90%, 100%)
- Budget vs. actual comparison
- Rollover unused budget (optional)

**Priority:** High
**Complexity:** Medium

#### 2.3 Recurring Transaction Detection 📋 Future

**Description:** Identify subscription and recurring charges

**Features:**
- Auto-detect recurring merchants (same merchant, similar amount, regular interval)
- Tag transactions as recurring
- List all subscriptions with monthly cost
- Alert on new recurring charges
- Track subscription changes (price increases)

**Priority:** Medium
**Complexity:** High

#### 2.4 Export Capabilities 📋 Future

**Description:** Export data for external analysis

**Features:**
- Export to CSV (filtered transactions)
- Export to PDF (monthly reports)
- Export to Excel (with charts)
- Schedule automatic exports (monthly)

**Priority:** Low
**Complexity:** Low

## Phase 3: Advanced Features

**Goal:** Power user features and credit card optimization

**Timeline:** 6-8 weeks after Phase 2

### Features

#### 3.1 Credit Card Comparison Tool 📋 Future

**Description:** Compare credit cards based on actual spending

**Features:**
- Input credit card reward structures
  - Category bonuses (e.g., 4% dining, 3% gas)
  - Annual fees
  - Sign-up bonuses
- Calculate projected annual rewards based on actual spending
- Rank cards by total rewards
- Recommendations for optimal card portfolio
- Break-even analysis (when rewards exceed annual fee)

**Priority:** High
**Complexity:** High

**Example:**
```
Your Spending:
- Dining: $500/month
- Groceries: $400/month
- Gas: $200/month

Card Comparison:
1. Chase Sapphire Preferred
   - Rewards: $735/year
   - Annual Fee: $95
   - Net: $640/year

2. Amex Blue Cash Preferred
   - Rewards: $684/year
   - Annual Fee: $95
   - Net: $589/year
```

#### 3.2 Additional Categories 📋 Future

**Description:** Expand beyond 5 categories for detailed analysis

**New Categories:**
- Entertainment (movies, concerts, sports events)
- Streaming Services (Netflix, Spotify, etc.)
- Transit (public transportation, tolls, parking)
- Drugstores (CVS, Walgreens)
- Home Improvement (Home Depot, Lowe's)
- Healthcare (doctor, dentist, pharmacy)
- Online Shopping (separate from general retail)
- Custom Categories (user-defined)

**Priority:** Medium
**Complexity:** Medium

#### 3.3 Multi-Account Support 📋 Future

**Description:** Track transactions from multiple credit cards/accounts

**Features:**
- Import from multiple CSV files
- Tag transactions with account/card
- Filter and analyze by account
- Cross-account spending totals
- Identify which card to use for each category (based on rewards)

**Priority:** Medium
**Complexity:** Medium

#### 3.4 Smart Tagging & Notes 📋 Future

**Description:** Add custom tags and notes to transactions

**Features:**
- Add custom tags (e.g., "business", "vacation", "gift")
- Add notes to transactions
- Filter by tags
- Analyze spending by tag
- Bulk tag operations

**Priority:** Low
**Complexity:** Low

## Phase 4: Intelligence & Automation

**Goal:** Proactive insights and automation

**Timeline:** Future (post Phase 3)

### Features

#### 4.1 Spending Insights 📋 Future

**Description:** AI-powered spending insights and recommendations

**Features:**
- Anomaly detection (unusual spending)
- Spending pattern recognition
- Personalized recommendations
- "You spent 40% more on dining this month"
- "Starbucks is your #1 merchant ($150/month)"

**Priority:** Medium
**Complexity:** High

#### 4.2 Automated Categorization Improvements 📋 Future

**Description:** Learn from user corrections to improve categorization

**Features:**
- Track user manual overrides
- Fine-tune prompts based on corrections
- Confidence scoring improvements
- Suggest new category rules

**Priority:** Low
**Complexity:** High

#### 4.3 Forecasting 📋 Future

**Description:** Predict future spending based on history

**Features:**
- Project end-of-month spending
- Predict yearly totals
- Seasonal spending analysis
- Alert when projected spending exceeds budget

**Priority:** Low
**Complexity:** High

## Future Possibilities

**Features under consideration (no timeline):**

### Mobile Companion App 📱
- View dashboard on mobile
- Quick transaction review
- No editing or import (view-only)
- Sync via local network (no cloud)

### Bank API Integration 🏦
- Direct import from banks (via Plaid, Yodlee)
- Automatic transaction sync
- No CSV export needed
- **Concern:** Privacy implications, API costs

### Multi-Device Sync ☁️
- Sync database across devices
- End-to-end encryption
- Self-hosted sync server option
- **Concern:** Conflicts with local-first philosophy

### Investment Tracking 📈
- Track investment accounts
- Portfolio analysis
- Net worth calculation
- **Concern:** Scope creep beyond spending analysis

### Tax Preparation Helper 💼
- Tag business expenses
- Generate tax reports
- Export for accountant
- **Concern:** Tax complexity varies by jurisdiction

## Known Limitations

### Technical Limitations

1. **SQLite Concurrency**
   - Single-user only (no multi-user editing)
   - Write conflicts if multiple instances running
   - **Mitigation:** Lock database, prevent multiple instances

2. **Electron Bundle Size**
   - ~200MB app size (Chromium + Node.js)
   - **Mitigation:** Acceptable for desktop app

3. **AI Categorization Accuracy**
   - Not 100% accurate (especially for ambiguous merchants)
   - Depends on Gemini API quality
   - **Mitigation:** Manual override + caching

4. **CSV Format Variations**
   - Banks use different CSV formats
   - Manual column mapping may be needed
   - **Mitigation:** Support common formats, provide mapping UI

### Feature Limitations (By Design)

1. **No Cloud Sync**
   - Deliberate choice for privacy
   - Single-device only

2. **No Web Version**
   - Desktop-only application
   - Better file system access, database performance

3. **No Mobile App (MVP)**
   - Focus on desktop analysis workflow
   - Mobile viewing possible in future

## Community Requests

**How to Request Features:**

1. Open a GitHub issue
2. Use the "Feature Request" template
3. Describe the use case and expected behavior
4. Vote on existing requests with 👍

**Top Requested Features (To Be Populated):**

| Feature | Votes | Status | Notes |
|---------|-------|--------|-------|
| *None yet* | - | - | - |

**Submit your requests at:** [GitHub Issues](https://github.com/yourusername/vault/issues)

---

**Last Updated:** 2026-01-03

**Status:** MVP Complete! 🎉 All Phase 1 features implemented and ready for beta testing.

This roadmap is a living document and may change based on user feedback and development priorities.
