# Changelog

## [1.0.0] - 2026-01-03

### Added - MVP Release

#### Core Features
- **Multi-format file import** - Support for CSV, XLSX, TXT, and PDF files
- **AI-powered categorization** - Gemini API integration for automatic transaction categorization
- **Merchant caching** - Smart caching to minimize API calls and costs
- **Dashboard analytics** - Real-time spending statistics and category breakdown
- **Transaction management** - Full CRUD operations with search and filtering
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

### Known Limitations

- PDF parsing is experimental and may not work for all banks
- No automatic CSV column mapping UI yet (uses auto-detection)
- Sample data only for demo import
- No date range filtering on dashboard yet
- No export functionality yet
- Charts not yet implemented (using progress bars)

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

### Next Steps (Post-MVP)

See [ROADMAP.md](docs/ROADMAP.md) for planned features:
- Enhanced PDF parsing with bank-specific parsers
- Visual charts (pie charts, bar charts) using Recharts
- Date range filtering
- Budget tracking
- Recurring transaction detection
- CSV export functionality
- Credit card comparison tool
- Additional spending categories

### Breaking Changes

N/A - Initial release

### Migration Guide

N/A - Initial release

### Contributors

- Caleb Han - Initial development

### License

MIT License - See [LICENSE](LICENSE) for details
