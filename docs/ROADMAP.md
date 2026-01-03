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

**Status:** Planning & Documentation Phase

**Completed:**
- ✅ Project architecture defined
- ✅ Database schema designed
- ✅ Technology stack selected
- ✅ Comprehensive documentation written

**In Progress:**
- 🚧 Initial development environment setup
- 🚧 Electron + Next.js boilerplate

**Next Steps:**
- Begin MVP development
- Implement CSV import
- Integrate Gemini API for categorization

## Phase 1: MVP (Minimum Viable Product)

**Goal:** Launch a working desktop app that imports CSV files and provides basic spending analytics.

**Timeline:** 6-8 weeks from start of development

### Features

#### 1.1 CSV Import ✅ Planned

**Description:** Import credit card transaction CSV files from any bank

**Acceptance Criteria:**
- [ ] Drag-and-drop file upload
- [ ] File picker support
- [ ] Auto-detect CSV columns (date, merchant, amount)
- [ ] Manual column mapping fallback
- [ ] Preview before import (first 10 rows)
- [ ] Import progress indicator
- [ ] Duplicate detection
- [ ] Error handling (invalid files, missing columns)

**Priority:** Critical
**Complexity:** Medium

#### 1.2 Automatic Categorization ✅ Planned

**Description:** AI-powered transaction categorization using Gemini API

**Acceptance Criteria:**
- [ ] Normalize merchant names
- [ ] Check merchant cache before API call
- [ ] Categorize into 5 categories (Dining, Groceries, Gas, Travel, Other)
- [ ] Detect transaction types (purchase, transfer, income)
- [ ] Batch processing for performance
- [ ] Rate limiting (max 60 req/min)
- [ ] Retry logic on failures
- [ ] Cache results in merchant_mappings table

**Priority:** Critical
**Complexity:** High

#### 1.3 Dashboard Analytics ✅ Planned

**Description:** Visual dashboard showing spending breakdown by category

**Acceptance Criteria:**
- [ ] Stats cards (total spent, transaction count, avg amount)
- [ ] Pie chart (category breakdown with percentages)
- [ ] Monthly bar chart (trend over time)
- [ ] Date range filter (last 30/90 days, YTD, all time, custom)
- [ ] Exclude transfers and income from spending analysis
- [ ] Responsive layout

**Priority:** Critical
**Complexity:** Medium

#### 1.4 Transaction Management ✅ Planned

**Description:** View, search, filter, and edit transactions

**Acceptance Criteria:**
- [ ] Sortable table (date, merchant, amount, category)
- [ ] Pagination (50 rows per page)
- [ ] Search by merchant name or description
- [ ] Filter by category
- [ ] Filter by transaction type
- [ ] Filter by date range
- [ ] Inline category editing (dropdown)
- [ ] Delete transactions (with confirmation)
- [ ] Update merchant cache on manual edits

**Priority:** High
**Complexity:** Medium

#### 1.5 Database & Storage ✅ Planned

**Description:** Local SQLite database for transaction storage

**Acceptance Criteria:**
- [ ] SQLite database initialization on first launch
- [ ] Create `transactions` and `merchant_mappings` tables
- [ ] Indexed queries for performance
- [ ] Database stored in app data directory
- [ ] File permissions (user-only read/write)
- [ ] Backup capability (manual file copy)

**Priority:** Critical
**Complexity:** Low

### MVP Success Metrics

- ✅ User can import 500+ transactions in < 30 seconds
- ✅ AI categorization accuracy > 85%
- ✅ Dashboard loads in < 1 second
- ✅ Zero data transmitted to cloud (except merchant names to Gemini)
- ✅ Works offline for viewing and manual categorization

### MVP Limitations

**What's NOT included in MVP:**
- No budget tracking
- No recurring transaction detection
- No data export (CSV)
- No credit card comparison tool
- No multi-device sync
- No mobile app
- Limited to 5 categories

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

**Last Updated:** 2026-01-02

This roadmap is a living document and may change based on user feedback and development priorities.
