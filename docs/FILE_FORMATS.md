# Supported File Formats

Vault supports importing transactions from multiple file formats commonly exported by banks and credit card companies.

## Supported Formats

### 1. CSV (Comma-Separated Values)
**Extensions:** `.csv`

**Common Sources:**
- Most banks and credit cards
- Mint.com exports
- Personal Capital exports

**Expected Format:**
```csv
Date,Description,Amount
01/15/2024,STARBUCKS #12345,6.75
01/16/2024,WHOLE FOODS MARKET,87.32
```

**Column Detection:**
- Auto-detects columns with headers containing: `date`, `description`, `merchant`, `amount`
- Manual mapping available if auto-detection fails

### 2. Excel (XLSX/XLS)
**Extensions:** `.xlsx`, `.xls`

**Common Sources:**
- Bank of America (option to download as XLSX)
- Wells Fargo
- Chase (alternative format)
- Manual exports from Excel

**Expected Format:**
- First row contains headers
- Same column structure as CSV
- Only the first sheet is processed

### 3. Text Files (TXT)
**Extensions:** `.txt`

**Common Sources:**
- Bank of America (plain text export)
- Some credit unions
- OFX converted to text

**Expected Format:**
```
01/15/2024    STARBUCKS #12345    6.75
01/16/2024    WHOLE FOODS MARKET    87.32
```

**Parsing Rules:**
- Looks for pattern: `MM/DD/YYYY  Merchant Name  Amount`
- Flexible whitespace between columns
- Amounts with or without dollar signs

### 4. PDF Files
**Extensions:** `.pdf`

**Common Sources:**
- Chase credit card statements
- American Express statements
- Discover statements

**Status:** ⚠️ **Partially Supported**

**Current Limitations:**
- PDF parsing is complex and varies by bank
- Text extraction may not work for image-based PDFs
- Manual review recommended after import

**Future Enhancement:**
- Bank-specific PDF parsers
- Table detection
- Multi-page support

## Column Mapping

Vault automatically detects common column names:

### Date Column
Recognized patterns:
- `Date`, `Posted Date`, `Transaction Date`
- `Trans Date`, `Posting Date`

Supported date formats:
- `MM/DD/YYYY` (e.g., 01/15/2024)
- `YYYY-MM-DD` (e.g., 2024-01-15)
- `DD/MM/YYYY` (e.g., 15/01/2024) - with auto-detection

### Merchant/Description Column
Recognized patterns:
- `Description`, `Merchant`, `Merchant Name`
- `Vendor`, `Payee`, `Memo`

### Amount Column
Recognized patterns:
- `Amount`, `Debit`, `Credit`, `Total`
- `Transaction Amount`, `Amt`

Supported amount formats:
- `6.75`, `$6.75`, `6.75 USD`
- `1,234.56` (comma thousands separator)
- Negative amounts for refunds

## Bank-Specific Formats

### Chase Credit Card

**PDF Export:**
1. Log in to Chase.com
2. Go to Statements & Activity
3. Download statement as PDF

**Status:** Requires manual conversion or text extraction

**Recommendation:** Use Chase's CSV export if available through third-party tools

### Bank of America

**XLSX Export:**
1. Log in to BofA
2. Go to Accounts → [Select Account]
3. Click "Download Transactions"
4. Select "Microsoft Excel (.xlsx)"

**TXT Export:**
1. Same steps as above
2. Select "Text (.txt)"

**Status:** ✅ Fully supported

### Wells Fargo

**CSV Export:**
1. Log in to Wells Fargo
2. Select account
3. Click "Download" → "Download Account Activity"
4. Select CSV format

**Status:** ✅ Fully supported

### American Express

**CSV Export:**
1. Log in to AmEx
2. Go to Statements & Activity
3. Select transactions
4. Download as CSV

**Status:** ✅ Fully supported

## Manual Column Mapping

If auto-detection fails:

1. Import the file
2. You'll see a column mapping interface
3. Map each required field:
   - Date → [Select from dropdown]
   - Merchant → [Select from dropdown]
   - Amount → [Select from dropdown]
4. Preview mapped data
5. Confirm import

## Tips for Best Results

### 1. Clean Your Data
- Remove header rows (if multiple)
- Ensure consistent date format
- Remove any summary rows at the bottom

### 2. Check Date Format
- Vault prefers `YYYY-MM-DD` or `MM/DD/YYYY`
- Inconsistent formats may cause errors

### 3. Amount Format
- Ensure amounts are numeric
- Remove currency symbols if causing issues
- Negative amounts should use `-` prefix

### 4. File Size
- Large files (10,000+ transactions) may take time to process
- Consider splitting by year if needed

### 5. Encoding
- Use UTF-8 encoding for best compatibility
- Some exports use Latin-1 or Windows-1252

## Troubleshooting

### "Could not auto-detect columns"
**Solution:** Use manual column mapping

### "Date parsing failed"
**Solution:** Ensure dates are in supported format (MM/DD/YYYY or YYYY-MM-DD)

### "Amount not a number"
**Solution:** Check for currency symbols or commas in amount column

### "PDF parsing failed"
**Solution:**
1. Try converting PDF to CSV using online tools
2. Copy-paste table from PDF into Excel, then export as CSV
3. Use bank's native CSV export if available

## Future Format Support

Planned additions:
- QFX (Quicken)
- OFX (Open Financial Exchange)
- QIF (Quicken Interchange Format)
- JSON (Mint, YNAB exports)

## Converting Other Formats

### PDF → CSV
Online tools:
- https://www.ilovepdf.com/pdf_to_excel
- Adobe Acrobat (Export to Excel)

### QFX/OFX → CSV
Use tools like:
- GnuCash (Import QFX, export CSV)
- Quicken (if available)

### JSON → CSV
Use online JSON to CSV converters
