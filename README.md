# Vault

A personal desktop application for analyzing credit card spending patterns by category. Track where your money goes and make informed decisions about credit card selection and rewards optimization.

## Overview

Vault helps you understand your spending habits by automatically categorizing credit card transactions and providing detailed analytics. Import CSV files from your bank, let AI categorize your purchases, and visualize your spending patterns across categories like Dining, Groceries, Gas, and Travel.

**Key Philosophy:** Your financial data stays completely local. No cloud sync, no user accounts, no data sharing.

## Features

- **Multi-Format Import** - Import CSV, XLSX, TXT, and PDF files from any bank (Chase, BofA, etc.)
- **Automatic Categorization** - AI-powered transaction categorization using Google Gemini
- **Spending Analytics** - Visualize spending breakdowns by category with charts and percentages
- **Transaction Management** - Search, filter, and manually override categorizations
- **Local Storage** - All data stored locally in SQLite (no cloud dependencies)
- **Privacy-First** - Desktop-only application with no external data sharing

## Tech Stack

- **Frontend:** Next.js (React) + TypeScript
- **Desktop:** Electron
- **Database:** SQLite (better-sqlite3)
- **AI Categorization:** Google Gemini API
- **Charts:** Recharts / Chart.js
- **CSV Parsing:** PapaParse

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
├── docs/               # Comprehensive documentation
├── src/
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   ├── lib/           # Utilities and helpers
│   ├── electron/      # Electron main process
│   └── db/            # Database schema and queries
├── public/            # Static assets
└── README.md          # This file
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

**Current Status:** Planning & Architecture Phase

**MVP (Phase 1):**
- [ ] CSV import with column mapping
- [ ] Gemini API categorization
- [ ] Basic dashboard with spending charts
- [ ] Transaction list with search/filter
- [ ] Manual category overrides

**Post-MVP (Phase 2+):**
- Additional credit card categories
- Credit card comparison tool
- Budget tracking
- Recurring transaction detection
- Export capabilities

See the full [Roadmap](docs/ROADMAP.md) for details.

## Screenshots

*Coming soon - application in development*

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Powered by [Google Gemini AI](https://ai.google.dev/)
- Charts by [Recharts](https://recharts.org/)

---

**Project Status:** Currently in planning and documentation phase. Check back soon for updates!
