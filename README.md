# Vault

A personal desktop application for analyzing credit card spending patterns by category. Track where your money goes and make informed decisions about credit card selection and rewards optimization.

## Overview

Vault helps you understand your spending habits by automatically categorizing credit card transactions and providing detailed analytics. Import CSV files from your bank, let AI categorize your purchases, and visualize your spending patterns across categories like Dining, Groceries, Gas, and Travel.

**Key Philosophy:** Your financial data stays completely local. No cloud sync, no user accounts, no data sharing.

## Features

- **Multi-Format Import** - Import CSV, XLSX, TXT, and PDF files from any bank (Chase, BofA, etc.)
- **Multiple File Upload** - Select and import multiple files at once, even different file types
- **Duplicate Detection** - Automatically detects and prevents re-importing existing transactions
- **Smart Column Mapping** - Auto-detect columns or manually map them with an intuitive UI
- **Import Preview** - Review transactions before importing with a preview table
- **Automatic Categorization** - AI-powered batch categorization using Google Gemini (processes all merchants in one API call)
- **Multi-Currency Support** - Import and convert transactions from 12 currencies with automatic exchange rates
- **Spending Analytics** - Interactive pie charts and monthly trend bar charts
- **Transaction Management** - Search, filter, edit, and delete transactions with advanced filters
- **Vendor Matching** - Find and bulk-update similar transactions with fuzzy matching
- **Date Range Filtering** - Filter transactions by custom date ranges
- **Export Functionality** - Export transactions to CSV or generate HTML reports for printing
- **Local Storage** - All data stored locally in SQLite (no cloud dependencies)
- **Privacy-First** - Desktop-only application with no external data sharing

## Tech Stack

- **Frontend:** Next.js 15.1.0, React 19.0.0, TypeScript 5.7.2
- **Desktop:** Electron 33.2.0
- **Database:** SQLite 3 with better-sqlite3
- **AI Categorization:** Google Gemini API (gemini-2.5-flash-lite)
- **UI Components:** Radix UI (accessible components)
- **Styling:** Tailwind CSS 3.4
- **Charts:** Recharts 2.15.0
- **File Parsing:** PapaParse (CSV), XLSX (Excel), pdf-parse (PDF)
- **Currency Exchange:** Free Currency API with caching
- **Vendor Matching:** Jaro-Winkler similarity algorithm

## Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Gemini API key ([Get one here](https://ai.google.dev/))

### Installation

```bash
# Clone the repository
git clone https://github.com/calebyhan/vault.git
cd vault

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Gemini API key to .env.local

# Run in development mode
npm run dev

# Build for production
npm run build
npm run start
```

## Project Structure

```
vault/
├── docs/                          # Comprehensive documentation
├── electron/                      # Electron main process
├── src/
│   ├── app/                      # Next.js pages
│   │   ├── import/              # Import flow pages
│   │   └── transactions/page.tsx # Transaction list
│   ├── components/
│   │   ├── features/             # Feature-specific components
│   │   │   ├── import/           # Import flow components
│   │   │   └── transactions/     # Transaction components
│   │   └── ui/                   # Reusable UI components (shadcn/ui)
│   ├── lib/
│   │   ├── categorization/       # AI categorization logic
│   │   ├── vendor-matching/      # Similarity matching
│   │   ├── services/             # Exchange rate service
│   │   ├── types/                # TypeScript interfaces
│   │   ├── constants/            # Categories, colors
│   │   └── utils/                # Parsers, formatters
│   └── db/
│       ├── schema/schema.sql     # Base database schema
│       └── migrations/           # Database migrations
├── public/                        # Static assets
├── scripts/                       # Utility scripts
└── README.md                      # This file
```

## Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

- [Architecture](docs/ARCHITECTURE.md) - System design, diagrams, and technical architecture
- [Setup Guide](docs/SETUP.md) - Detailed installation and configuration instructions
- [Database Schema](docs/DATABASE.md) - SQLite database structure and queries
- [Features](docs/FEATURES.md) - Feature specifications and user workflows
- [API Integration](docs/API.md) - Gemini API integration and categorization logic
- [Categories](docs/CATEGORIES.md) - Transaction categories and classification rules
- [Development Guide](docs/DEVELOPMENT.md) - Code organization and development workflow
- [Roadmap](docs/ROADMAP.md) - Feature roadmap and future plans

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Code standards and style
- Development workflow
- Pull request process
- Issue reporting

## Security & Privacy

Your financial data is your business. This application:

- Stores all data locally in SQLite (no cloud storage)
- Never transmits transaction data except to Gemini API for categorization
- Keeps API keys local in environment variables
- Provides no telemetry or tracking

Read our full [Security Policy](SECURITY.md) for details.

## Roadmap

**Current Status:** 🎉 **MVP Complete!** - Ready for beta testing and production use!

**MVP (Phase 1):** ✅ **100% Complete**
- [x] CSV/XLSX/TXT/PDF import with auto-detection
- [x] Manual column mapping UI
- [x] Import preview with transaction review
- [x] Multiple file upload support
- [x] Duplicate transaction detection
- [x] Batch Gemini API categorization (optimized!)
- [x] Multi-currency support (12 currencies)
- [x] Vendor similarity matching
- [x] Dashboard with pie chart analytics
- [x] Monthly trend bar chart
- [x] Transaction list with search/filter/edit/delete
- [x] Date range filtering
- [x] Manual category overrides
- [x] Transaction type detection (purchase/transfer/income)
- [x] Export to CSV and HTML reports

**Post-MVP (Phase 2+):**
- Additional spending categories
- Budget tracking and alerts
- Recurring transaction detection
- Credit card comparison tool
- Multi-account support
- Smart tagging and notes

See the full [Roadmap](docs/ROADMAP.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Powered by [Google Gemini AI](https://ai.google.dev/)
- Charts by [Recharts](https://recharts.org/)
