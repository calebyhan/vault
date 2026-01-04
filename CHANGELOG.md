# Changelog

All notable changes to Vault will be documented in this file.

## [1.0.1] - 2026-01-04

### Fixed
- **Production build rendering** - Fixed Next.js static export not loading properly in Electron
  - Added Express HTTP server to serve static files in production
  - Fixed asset paths with relative URL configuration
  - Fixed database schema file path resolution in packaged app
  - Added proper error handling and user-friendly error dialogs
  - Resolved navigation issues between pages in production build
- **TypeScript compilation** - Fixed all type errors preventing production builds
  - Added ElectronAPI type declarations
  - Fixed window.electronAPI undefined checks
  - Fixed React component prop type errors
  - Fixed ESLint errors (empty interface, unescaped entities, require imports)
- **Build configuration** - Improved electron-builder packaging
  - Fixed file paths in packaged .asar file
  - Added schema.sql to build artifacts
  - Corrected electron main entry point paths

## [1.0.0] - 2026-01-03 - MVP Complete! 🎉

### Added - MVP Release

#### Core Features
- **Multi-format file import** - Support for CSV, XLSX, TXT, and PDF files
- **Duplicate detection** - Automatically prevents re-importing existing transactions
- **Multiple file upload** - Import multiple files at once
- **AI-powered categorization** - Gemini API with 3-tier system (patterns, cache, API)
- **277 merchant patterns** - Instant categorization for known merchants
- **Merchant caching** - Smart caching to minimize API calls and costs
- **Multi-currency support** - 12 currencies with automatic conversion to USD
- **Dashboard analytics** - Real-time spending statistics and category breakdown
- **Vendor matching** - Fuzzy matching to find and bulk-update similar merchants
- **Transaction management** - Full CRUD operations with search and filtering
- **Export functionality** - CSV export and HTML report generation
- **Local SQLite database** - Privacy-first local storage with no cloud dependencies

#### File Format Support
- ✅ **CSV** - Full support with auto column detection
- ✅ **XLSX/XLS** - Excel files from Bank of America and others
- ✅ **TXT** - Plain text exports (Bank of America format)
- ⚠️ **PDF** - Experimental support for Chase statements

#### User Interface
- Dashboard page with spending statistics
- CSV/file import page with progress tracking
- Transaction list with inline category editing
- Search and filter functionality
- Clean, modern UI with Tailwind CSS and shadcn/ui components

#### Technical Stack
- **Frontend:** Next.js 15.1.0 + React 19.0.0 + TypeScript 5.7.2
- **Desktop:** Electron 33.2.0
- **Database:** SQLite 3.x via better-sqlite3 11.7.0
- **AI:** Google Gemini API (gemini-1.5-flash)
- **File Parsing:** xlsx, pdf-parse, papaparse
- **Styling:** Tailwind CSS 3.4.17
- **UI Components:** Radix UI primitives

#### Security & Privacy
- All transaction data stored locally
- No cloud sync or remote storage
- API key stored in local environment variables
- Only merchant names sent to Gemini API
- Complete transparency in data handling

#### Documentation
- Comprehensive README with quick start
- Full architecture documentation
- Database schema documentation
- API integration guide
- File format support guide
- Security policy
- Development guide
- Contributing guidelines

### Completed in This Release

- ✅ Multi-format import (CSV, XLSX, TXT, PDF)
- ✅ Duplicate detection with visual warnings
- ✅ AI categorization with 3-tier system
- ✅ Multi-currency support (12 currencies)
- ✅ Vendor similarity matching
- ✅ Dashboard with interactive charts
- ✅ Transaction management with filters
- ✅ Date range filtering
- ✅ CSV and HTML export
- ✅ Pagination with configurable page size
- ✅ Pattern-based categorization (277 patterns)
- ✅ Database migration system
- ✅ Exchange rate caching

### Known Limitations

- PDF parsing is experimental and may not work for all banks
- Duplicate detection uses ±$0.01 threshold (may miss some edge cases)
- HTML export requires manual print-to-PDF (no native PDF generation)
- No budget tracking yet (Phase 2)
- No recurring transaction detection yet (Phase 2)
- No credit card comparison tool yet (Phase 2)

### Dependencies

**Production:**
- @google/generative-ai ^0.21.0
- @radix-ui/react-* (various components)
- better-sqlite3 ^11.7.0
- clsx ^2.1.1
- date-fns ^4.1.0
- electron-is-dev ^3.0.1
- lucide-react ^0.468.0
- next ^15.1.0
- papaparse ^5.4.1
- pdf-parse ^1.1.1
- react ^19.0.0
- react-dom ^19.0.0
- recharts ^2.15.0
- tailwind-merge ^2.6.0
- tailwindcss-animate ^1.0.7
- xlsx ^0.18.5
- zod ^3.24.1

**Development:**
- @types/* (various type definitions)
- autoprefixer ^10.4.20
- concurrently ^9.1.0
- electron ^33.2.0
- electron-builder ^25.1.8
- eslint ^9.17.0
- postcss ^8.4.49
- prettier ^3.4.2
- tailwindcss ^3.4.17
- typescript ^5.7.2
- wait-on ^8.0.1

### File Structure

```
vault/
├── electron/              # Electron main process
│   ├── main.ts           # Application entry point
│   ├── database.ts       # SQLite database initialization
│   ├── ipc-handlers.ts   # IPC communication handlers
│   └── preload.ts        # Context bridge for renderer
├── src/
│   ├── app/              # Next.js pages
│   │   ├── page.tsx              # Dashboard
│   │   ├── import/page.tsx       # Import page
│   │   ├── transactions/page.tsx # Transaction list
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   └── ui/           # UI components (button, card)
│   ├── lib/
│   │   ├── categorization/       # AI categorization logic
│   │   ├── constants/            # Category definitions
│   │   ├── types/                # TypeScript types
│   │   └── utils/                # Utilities (parsers, formatters)
│   └── db/
│       ├── schema/       # SQL schema
│       └── queries/      # Database queries
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── FEATURES.md
│   ├── CATEGORIES.md
│   ├── SETUP.md
│   ├── DEVELOPMENT.md
│   ├── ROADMAP.md
│   └── FILE_FORMATS.md
├── QUICKSTART.md         # Quick start guide
├── CONTRIBUTING.md       # Contribution guidelines
├── SECURITY.md          # Security and privacy policy
└── README.md            # Project overview
```

### Next Steps (Phase 2)

See [ROADMAP.md](docs/ROADMAP.md) for planned features:
- Budget tracking and alerts
- Recurring transaction detection
- Credit card comparison tool (calculate optimal rewards)
- Additional spending categories (Entertainment, Streaming, Transit, etc.)
- Multi-account support
- Smart tagging and notes
- Enhanced PDF parsing with bank-specific parsers
- Advanced category analytics with drill-down

### Breaking Changes

N/A - Initial release

### Migration Guide

N/A - Initial release

### Contributors

- Caleb Han - Initial development

### License

MIT License - See [LICENSE](LICENSE) for details
