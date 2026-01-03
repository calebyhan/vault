# Security Policy

## Overview

Vault is built with privacy and security as core principles. Your financial data is sensitive, and we take protecting it seriously. This document outlines our security practices, data handling policies, and how to report security vulnerabilities.

## Data Privacy Guarantees

### Local-First Architecture

**All transaction data stays on your device.** We guarantee:

- No cloud storage or synchronization
- No remote databases or third-party services
- No user accounts or authentication servers
- No analytics or telemetry collection
- No tracking or usage monitoring

Your financial data is stored exclusively in a local SQLite database on your machine.

### What Data is Transmitted

The only external network communication occurs when:

1. **Gemini API Categorization** - Merchant names are sent to Google's Gemini API for categorization
   - Only merchant names are transmitted (e.g., "STARBUCKS #12345")
   - Transaction amounts, dates, and other details are NOT sent
   - See [Gemini API Data Usage](#gemini-api-data-usage) below

2. **Software Updates** (if enabled) - Checking for new versions of the application

### What Data is Never Transmitted

- Transaction amounts
- Transaction dates
- Account numbers or identifiers
- Personal identifying information
- Full transaction history
- Database contents

## Local Data Storage

### SQLite Database

Transaction data is stored in a local SQLite database:

**Location:**
- macOS: `~/Library/Application Support/Vault/transactions.db`
- Windows: `%APPDATA%\Vault\transactions.db`
- Linux: `~/.config/Vault/transactions.db`

**Security Measures:**

- File permissions set to user-only read/write (0600)
- No remote access capabilities
- Can be encrypted at rest using OS-level encryption (FileVault, BitLocker, etc.)

### Optional Database Encryption

For additional security, you can enable SQLite encryption:

**Using SQLCipher (Advanced Users):**

```bash
# Install SQLCipher variant
npm install better-sqlite3-sqlcipher

# Set encryption key in .env.local
SQLITE_ENCRYPTION_KEY=your-secure-key-here
```

Note: Database encryption is optional and must be configured manually. Encrypted databases cannot be opened without the encryption key.

## Gemini API Data Usage

### What is Sent

When categorizing transactions, only the **merchant name** is sent to the Gemini API:

```json
{
  "prompt": "Categorize this merchant: STARBUCKS #12345",
  "categories": ["Dining", "Groceries", "Gas", "Travel", "Other"]
}
```

### What is NOT Sent

- Transaction amounts
- Transaction dates
- Full transaction records
- Account information
- User information

### Gemini API Data Retention

According to Google's Gemini API Terms of Service:

- Prompts and responses may be temporarily stored for abuse prevention
- Data is not used to train models (when using the paid API)
- Review [Google's Gemini API Privacy Policy](https://ai.google.dev/terms) for full details

### Caching to Reduce API Calls

To minimize data transmission:

- Merchant names are cached locally after first categorization
- Subsequent transactions from the same merchant use cached categories
- No repeat API calls for known merchants

## API Key Security

### Storage

**Never commit API keys to version control.** Store your Gemini API key in:

```
.env.local (git-ignored)
```

Example:
```bash
GEMINI_API_KEY=your_api_key_here
```

### Best Practices

1. **Use Environment Variables** - Never hardcode API keys
2. **Restrict API Key Permissions** - Limit to Gemini API only
3. **Rotate Keys Periodically** - Generate new keys every 90 days
4. **Monitor Usage** - Check Google Cloud Console for unexpected usage
5. **Use API Key Restrictions** - Limit by IP address or application (if applicable)

### API Key Exposure Risk

If your API key is accidentally exposed:

1. **Immediately revoke** the key in Google Cloud Console
2. **Generate a new key** and update `.env.local`
3. **Monitor billing** for unauthorized usage
4. **Review logs** for suspicious activity

## CSV File Handling

### Secure Import Process

When importing CSV files:

1. Files are read directly from disk (no upload to servers)
2. Parsed in-memory using PapaParse
3. Data written directly to local SQLite database
4. Original CSV files are NOT stored by the application

### CSV File Security

**Recommendations:**

- Store CSV exports from your bank in encrypted folders
- Delete CSV files after importing if no longer needed
- Use OS-level file encryption for sensitive directories
- Avoid storing CSVs in cloud-synced folders (Dropbox, iCloud, etc.)

## Electron Security

### Context Isolation

Electron security features enabled:

```javascript
{
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true
}
```

### Content Security Policy (CSP)

Strict CSP headers prevent XSS attacks:

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
```

### Secure IPC Communication

Inter-process communication between main and renderer processes uses validated channels:

- No dynamic IPC channel registration
- Input validation on all IPC messages
- Type-safe communication via TypeScript

## Dependency Security

### Automated Scanning

Dependencies are scanned for vulnerabilities:

```bash
# Check for vulnerabilities
npm audit

# Auto-fix vulnerabilities
npm audit fix
```

### Dependency Policy

- Regularly update dependencies (monthly security patches)
- Review dependency licenses for compatibility
- Minimize third-party dependencies
- Use well-maintained, reputable packages

### Pinned Dependencies

All dependencies use exact versions (no `^` or `~`) to prevent unexpected updates:

```json
{
  "dependencies": {
    "better-sqlite3": "9.2.0",
    "electron": "28.0.0"
  }
}
```

## Building from Source

### Verifying Integrity

Before building:

1. **Verify Git commits** are signed (GPG signatures)
2. **Check package checksums** match published versions
3. **Review dependency tree** for unexpected packages

```bash
# Verify npm package integrity
npm ls
npm audit signatures
```

### Secure Build Process

```bash
# Clean install (removes existing node_modules)
rm -rf node_modules
npm ci

# Build with integrity checks
npm run build
```

## Known Limitations

### SQLite Database Access

Anyone with access to your computer can:

- Copy the SQLite database file
- Read transaction data (if database is not encrypted)
- Modify or delete data

**Mitigations:**
- Use OS-level user accounts with strong passwords
- Enable full disk encryption (FileVault, BitLocker)
- Lock your computer when away from desk
- Consider SQLite encryption for high-security needs

### Gemini API Transmission

Merchant names are transmitted to Gemini API for categorization. While minimal, this does expose:

- Names of businesses you transact with
- Frequency of categorization requests (new merchants)

**Mitigations:**
- Review cached merchants before syncing (manual mode - future feature)
- Option to disable auto-categorization and use manual categories only (future feature)

## Reporting Security Vulnerabilities

If you discover a security vulnerability:

**DO NOT** open a public GitHub issue.

Instead:

1. **Email:** security@example.com (replace with actual email)
2. **Include:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

3. **Response Time:**
   - Acknowledgment within 48 hours
   - Status update within 7 days
   - Fix deployed within 30 days (for critical vulnerabilities)

### Vulnerability Disclosure Policy

- We follow responsible disclosure practices
- Security researchers will be credited (with permission)
- Critical vulnerabilities fixed immediately
- Users notified of security updates

## Security Updates

### How to Stay Updated

- Watch this repository for security announcements
- Enable automatic updates in the app (when available)
- Check [Releases](https://github.com/yourusername/vault/releases) regularly

### Applying Updates

```bash
# Check current version
npm run version

# Update to latest
git pull origin main
npm install
npm run build
```

## Recommendations for Users

### Essential Security Practices

1. **Use Strong OS Passwords** - Protect access to your computer
2. **Enable Disk Encryption** - FileVault (macOS), BitLocker (Windows), LUKS (Linux)
3. **Lock Your Computer** - When stepping away
4. **Regular Backups** - Backup database file (with encryption)
5. **Keep Software Updated** - OS, Electron app, dependencies
6. **Secure API Keys** - Treat like passwords
7. **Review Permissions** - Check file permissions on database

### Advanced Security (Optional)

- Use SQLite encryption (SQLCipher)
- Store database in encrypted volume (VeraCrypt)
- Use hardware security keys for system login
- Monitor file access logs for database file
- Run application in sandboxed environment

## Privacy by Design

Our architecture is built around privacy principles:

1. **Data Minimization** - Collect only what's necessary
2. **Local-First** - No cloud storage requirements
3. **User Control** - You own and control all data
4. **Transparency** - Open source code for audit
5. **No Tracking** - Zero analytics or telemetry

## Compliance

### GDPR Compliance

Since data never leaves your device (except merchant names to Gemini):

- No data controller/processor relationship
- No cross-border data transfers
- No right to access requests (you already have all data)
- No data retention policies needed

### Data Portability

All data is stored in standard formats:

- SQLite database (portable, standard format)
- CSV export capability (planned)
- No proprietary or encrypted formats (unless user-enabled)

## Questions?

For security-related questions:

- **General:** Open a GitHub issue (non-sensitive topics)
- **Vulnerabilities:** Email security@example.com (replace with actual email)
- **Privacy Concerns:** Review this document and `docs/ARCHITECTURE.md`

---

**Last Updated:** 2026-01-02

This security policy may be updated as the application evolves. Check back regularly for changes.
