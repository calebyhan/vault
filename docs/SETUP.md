# Setup Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Platform-Specific Instructions](#platform-specific-instructions)
- [Troubleshooting](#troubleshooting)
- [Updating](#updating)
- [Uninstalling](#uninstalling)
- [Related Documentation](#related-documentation)

## Prerequisites

### Required Software

| Software | Minimum Version | Recommended | Purpose |
|----------|----------------|-------------|---------|
| **Node.js** | 18.0.0 | 20.x LTS | JavaScript runtime |
| **npm** | 9.0.0 | 10.x | Package manager |
| **Git** | 2.30.0 | Latest | Version control |

### Operating System Support

| Platform | Supported Versions | Status |
|----------|-------------------|---------|
| **macOS** | 11.0+ (Big Sur and later) | Fully supported |
| **Windows** | 10, 11 | Fully supported |
| **Linux** | Ubuntu 20.04+, Fedora 35+ | Fully supported |

### Gemini API Key

You'll need a Google Gemini API key for transaction categorization:

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Click "Get API Key" in the top right
4. Create a new project or select an existing one
5. Generate an API key
6. Copy and save the key securely

**Note:** The free tier includes 60 requests per minute, sufficient for most users.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/vault.git
cd vault
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js and React
- Electron and electron-builder
- better-sqlite3 for database
- Gemini AI SDK
- UI libraries (Recharts, Tailwind CSS)

**Installation Time:** ~2-5 minutes depending on internet speed

### 3. Verify Installation

```bash
npm run verify
```

This command checks:
- Node.js and npm versions
- Dependency installation
- SQLite compilation
- Electron installation

Expected output:
```
✓ Node.js v20.10.0 (OK)
✓ npm v10.2.4 (OK)
✓ Dependencies installed (324 packages)
✓ SQLite compiled successfully
✓ Electron v28.0.0 (OK)

Installation verified successfully!
```

## Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Gemini API key:

```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Database path (defaults to system app data directory)
# DATABASE_PATH=/custom/path/to/transactions.db

# Optional: Enable debug logging
# DEBUG=true
```

**Security Note:**
- Never commit `.env.local` to version control (already in `.gitignore`)
- Treat API keys like passwords
- Don't share your `.env.local` file

### Database Location

By default, the database is stored in:

| Platform | Default Path |
|----------|-------------|
| **macOS** | `~/Library/Application Support/Vault/transactions.db` |
| **Windows** | `%APPDATA%\Vault\transactions.db` |
| **Linux** | `~/.config/Vault/transactions.db` |

To use a custom location, set `DATABASE_PATH` in `.env.local`.

### First-Time Setup

On first launch, the application will:

1. Create the database directory if it doesn't exist
2. Initialize the SQLite database
3. Create the `transactions` and `merchant_mappings` tables
4. Set file permissions (user-only read/write)

**Note:** No manual database setup required.

## Running the Application

### Development Mode

Start the application in development mode with hot reloading:

```bash
npm run dev
```

This starts:
- Next.js development server (http://localhost:3000)
- Electron window with DevTools enabled
- Hot module reloading for code changes

**Development Features:**
- React DevTools integration
- Chrome DevTools for debugging
- Automatic reload on file changes
- Verbose error messages

### Production Mode (Local)

Build and run the production version:

```bash
npm run build
npm run start
```

This creates an optimized production build and launches Electron.

### Background Process

The application runs as a standard desktop app:
- Shows in Dock/Taskbar
- Can be minimized to tray (future feature)
- Continues running until quit

## Building for Production

### Build for Current Platform

```bash
npm run build:electron
```

This creates a distributable application for your current platform in the `dist/` directory.

**Output:**
- **macOS:** `dist/Vault-1.0.0.dmg`
- **Windows:** `dist/Vault Setup 1.0.0.exe`
- **Linux:** `dist/Vault-1.0.0.AppImage`

### Build for All Platforms

```bash
npm run build:all
```

**Note:** Cross-platform builds have limitations:
- macOS builds require macOS host (code signing)
- Windows builds work on macOS/Linux with Wine
- Linux builds work on all platforms

### Build Configuration

Edit `electron-builder.yml` to customize:

```yaml
appId: com.spendingcategorytracker.app
productName: Vault
copyright: Copyright © 2026

mac:
  category: public.app-category.finance
  icon: build/icon.icns
  target:
    - dmg
    - zip

win:
  icon: build/icon.ico
  target:
    - nsis
    - portable

linux:
  icon: build/icon.png
  category: Finance
  target:
    - AppImage
    - deb
```

## Platform-Specific Instructions

### macOS

#### Installation

1. Download `Vault-1.0.0.dmg`
2. Double-click to mount the disk image
3. Drag app to Applications folder
4. First launch: Right-click → Open (to bypass Gatekeeper)

#### Permissions

Grant permissions when prompted:
- **File Access:** For CSV import
- **Accessibility:** For window management (if needed)

#### Unidentified Developer Warning

If you see "cannot be opened because it is from an unidentified developer":

```bash
xattr -cr /Applications/Vault.app
```

Or: System Preferences → Security & Privacy → Open Anyway

### Windows

#### Installation

1. Download `Vault Setup 1.0.0.exe`
2. Run the installer
3. Follow installation wizard
4. Choose install location (default: `C:\Program Files\Vault`)

#### SmartScreen Warning

If Windows SmartScreen blocks the app:
- Click "More info"
- Click "Run anyway"

**Note:** This warning appears because the app isn't code-signed (requires paid certificate).

#### Firewall

Allow network access when prompted (needed for Gemini API calls).

### Linux

#### AppImage

```bash
chmod +x Vault-1.0.0.AppImage
./Vault-1.0.0.AppImage
```

#### Debian/Ubuntu (.deb)

```bash
sudo dpkg -i spending-category-tracker_1.0.0_amd64.deb
```

#### Fedora/RHEL (.rpm)

```bash
sudo rpm -i spending-category-tracker-1.0.0.x86_64.rpm
```

#### Dependencies

Install required libraries if needed:

```bash
# Ubuntu/Debian
sudo apt-get install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libdrm2 libgbm1 libxcb-dri3-0

# Fedora
sudo dnf install gtk3 libnotify nss libXScrnSaver libXtst xdg-utils at-spi2-core libdrm mesa-libgbm libxcb
```

## Troubleshooting

### Common Issues

#### "Module not found" Errors

**Problem:** Missing dependencies

**Solution:**
```bash
rm -rf node_modules
npm install
```

#### SQLite Compilation Errors

**Problem:** better-sqlite3 failed to compile

**Solution (macOS):**
```bash
xcode-select --install
npm rebuild better-sqlite3
```

**Solution (Linux):**
```bash
sudo apt-get install build-essential python3
npm rebuild better-sqlite3
```

**Solution (Windows):**
Install [Windows Build Tools](https://github.com/felixrieseberg/windows-build-tools):
```powershell
npm install --global windows-build-tools
npm rebuild better-sqlite3
```

#### "Cannot find module 'electron'"

**Problem:** Electron not installed properly

**Solution:**
```bash
npm install electron --save-dev
```

#### Gemini API Errors

**Problem:** "Invalid API key" or "Unauthorized"

**Solution:**
1. Check `.env.local` has correct API key
2. Verify key at [Google AI Studio](https://ai.google.dev/)
3. Ensure no extra spaces or quotes in `.env.local`
4. Restart the application

**Problem:** "Rate limit exceeded"

**Solution:**
- Wait 60 seconds and try again
- Reduce batch size in import
- Consider upgrading to paid tier

#### Database Locked

**Problem:** "Database is locked" error

**Solution:**
1. Close all instances of the application
2. Check for background processes: `ps aux | grep Vault`
3. Kill stale processes if needed
4. Restart application

#### UI Not Loading

**Problem:** Blank window or loading spinner

**Solution:**
1. Open DevTools: View → Toggle Developer Tools
2. Check Console for errors
3. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

### Log Files

**Location:**
- **macOS:** `~/Library/Logs/Vault/`
- **Windows:** `%APPDATA%\Vault\logs\`
- **Linux:** `~/.config/Vault/logs/`

**View logs:**
```bash
# macOS/Linux
tail -f ~/Library/Logs/Vault/main.log

# Windows
type %APPDATA%\Vault\logs\main.log
```

### Debug Mode

Enable verbose logging:

```bash
# .env.local
DEBUG=true
LOG_LEVEL=debug
```

Restart the application and check logs for detailed output.

## Updating

### Check for Updates

**Manual check:**
```bash
git fetch origin
git log HEAD..origin/main --oneline
```

### Update to Latest Version

```bash
git pull origin main
npm install
npm run build
```

**Note:** Future versions will include auto-update functionality.

### Database Migrations

If the update includes database changes:

1. Backup your database first:
   ```bash
   cp ~/Library/Application\ Support/Vault/transactions.db \
      ~/transactions-backup-$(date +%Y%m%d).db
   ```

2. Run migrations (automatic on app startup)
   ```bash
   npm run migrate
   ```

## Uninstalling

### macOS

1. Quit the application
2. Delete from Applications:
   ```bash
   rm -rf /Applications/Vault.app
   ```

3. Delete user data (optional):
   ```bash
   rm -rf ~/Library/Application\ Support/Vault
   rm -rf ~/Library/Logs/Vault
   ```

### Windows

1. Uninstall via Settings → Apps → Vault → Uninstall
2. Delete user data (optional):
   ```powershell
   rmdir /s "%APPDATA%\Vault"
   ```

### Linux

**AppImage:**
```bash
rm Vault-1.0.0.AppImage
rm -rf ~/.config/Vault
```

**Debian/Ubuntu:**
```bash
sudo dpkg -r spending-category-tracker
rm -rf ~/.config/Vault
```

## Related Documentation

- [Architecture](ARCHITECTURE.md) - System architecture
- [Development Guide](DEVELOPMENT.md) - Development environment
- [Features](FEATURES.md) - Feature documentation
- [Troubleshooting](TROUBLESHOOTING.md) - Detailed troubleshooting (future)
