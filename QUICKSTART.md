# Quick Start Guide

## ✅ Setup Complete!

Your Vault MVP is ready to run. Here's how to get started.

## 1. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
```

**Get a Gemini API key**: Visit https://ai.google.dev/ and generate a free API key.

## 2. Run the Application

```bash
npm run dev
```

This will:
1. Compile the Electron TypeScript code
2. Start the Next.js development server
3. Launch the Electron app

**Note:** The first time you run this, it may take a moment to compile Electron.

## 3. Use the Application

The app will open with three pages:

### Dashboard (`/`)
- View spending statistics
- See category breakdown
- Empty until you import transactions

### Import Transactions (`/import`)
- Click "Import Sample Transactions" to test with demo data
- Or select a CSV file from your bank (not fully implemented yet)

### Transactions (`/transactions`)
- View all imported transactions
- Change categories with dropdown
- Delete transactions
- Search transactions

## What's Working

✅ Electron + Next.js setup
✅ SQLite database
✅ Gemini API categorization
✅ Dashboard with statistics
✅ Transaction import (sample data)
✅ Transaction list with editing
✅ Category management

## Sample Transaction Test

1. Go to Import page
2. Click "Import Sample Transactions"
3. Watch the progress bar as transactions are categorized
4. View results on the Dashboard
5. Edit categories on the Transactions page

## Troubleshooting

### "window.electronAPI is not defined"

- Make sure you're running `npm run dev` (not just `npm run dev:next`)
- Electron must be running for the API to be available

### Database errors

- The database is created automatically in your system's app data folder
- Location varies by OS (see SECURITY.md)

### Compilation errors

- Try deleting `dist/` and `.next/` folders and run `npm run dev` again

## Next Steps

To continue development:

1. **Implement real CSV parsing** - Currently using sample data
2. **Add real file reading** - Use Electron's fs module to read selected CSV
3. **Add column mapping UI** - Let users map CSV columns to fields
4. **Add charts** - Integrate Recharts for visualizations
5. **Add date filtering** - Filter dashboard by date range

## Project Structure

```
vault/
├── electron/           # Electron main process
│   ├── main.ts        # App entry point
│   ├── database.ts    # SQLite setup
│   ├── ipc-handlers.ts # IPC handlers
│   └── preload.ts     # IPC bridge
│
├── src/
│   ├── app/           # Next.js pages
│   │   ├── page.tsx           # Dashboard
│   │   ├── import/page.tsx    # Import page
│   │   └── transactions/page.tsx # Transactions
│   │
│   ├── components/ui/  # UI components
│   ├── lib/           # Utilities
│   └── db/            # Database schema
│
└── docs/              # Documentation
```

## Building for Production

```bash
npm run build:electron
```

This creates distributable apps in the `dist/` folder.

## Documentation

Full documentation is available in the `docs/` folder:

- [Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE.md)
- [API Integration](docs/API.md)
- [Features](docs/FEATURES.md)
- [Development Guide](docs/DEVELOPMENT.md)

## Questions?

Check the docs or open an issue on GitHub!
