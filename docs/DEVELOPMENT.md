# Development Guide

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Organization](#code-organization)
- [Testing](#testing)
- [Debugging](#debugging)
- [Git Workflow](#git-workflow)
- [Code Style](#code-style)
- [Performance Optimization](#performance-optimization)
- [Related Documentation](#related-documentation)

## Development Environment Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- Git
- VS Code (recommended editor)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/yourusername/vault.git
cd vault

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Gemini API key

# Start development server
npm run dev
```

### Recommended VS Code Extensions

Install these extensions for optimal development experience:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "streetsidesoftware.code-spell-checker",
    "eamodio.gitlens",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## Project Structure

```
vault/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Dashboard (/)
│   │   ├── import/
│   │   │   └── page.tsx       # CSV Import (/import)
│   │   ├── transactions/
│   │   │   └── page.tsx       # Transaction List (/transactions)
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   │
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   │
│   │   ├── features/         # Feature-specific components
│   │   │   ├── csv-import/
│   │   │   │   ├── csv-uploader.tsx
│   │   │   │   ├── column-mapper.tsx
│   │   │   │   ├── import-preview.tsx
│   │   │   │   └── import-progress.tsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── stats-cards.tsx
│   │   │   │   ├── category-pie-chart.tsx
│   │   │   │   ├── monthly-bar-chart.tsx
│   │   │   │   └── date-range-filter.tsx
│   │   │   │
│   │   │   └── transactions/
│   │   │       ├── transaction-table.tsx
│   │   │       ├── transaction-row.tsx
│   │   │       ├── filter-panel.tsx
│   │   │       └── search-bar.tsx
│   │   │
│   │   └── layouts/
│   │       ├── app-layout.tsx
│   │       ├── navigation.tsx
│   │       └── header.tsx
│   │
│   ├── lib/                   # Core utilities and logic
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── use-transactions.ts
│   │   │   ├── use-categories.ts
│   │   │   ├── use-import.ts
│   │   │   └── use-filters.ts
│   │   │
│   │   ├── contexts/         # React contexts
│   │   │   ├── transaction-context.tsx
│   │   │   ├── filter-context.tsx
│   │   │   └── category-context.tsx
│   │   │
│   │   ├── utils/            # Utility functions
│   │   │   ├── csv-parser.ts
│   │   │   ├── date-formatter.ts
│   │   │   ├── currency-formatter.ts
│   │   │   └── cn.ts         # className utility
│   │   │
│   │   ├── constants/        # Constants and enums
│   │   │   ├── categories.ts
│   │   │   ├── transaction-types.ts
│   │   │   └── date-ranges.ts
│   │   │
│   │   ├── types/            # TypeScript types
│   │   │   ├── transaction.ts
│   │   │   ├── merchant.ts
│   │   │   └── api.ts
│   │   │
│   │   ├── api/              # API clients
│   │   │   └── gemini-client.ts
│   │   │
│   │   └── categorization/   # Categorization logic
│   │       ├── categorize.ts
│   │       ├── merchant-normalizer.ts
│   │       └── prompt-builder.ts
│   │
│   ├── electron/             # Electron-specific code
│   │   ├── main/            # Main process
│   │   │   ├── main.ts      # Entry point
│   │   │   ├── window.ts    # Window management
│   │   │   ├── database.ts  # Database connection
│   │   │   ├── ipc-handlers.ts  # IPC event handlers
│   │   │   ├── menu.ts      # Application menu
│   │   │   └── file-handler.ts  # File operations
│   │   │
│   │   └── preload/         # Preload scripts
│   │       └── preload.ts   # IPC bridge (context isolation)
│   │
│   └── db/                   # Database layer
│       ├── schema/          # Schema definitions
│       │   └── schema.sql
│       │
│       ├── migrations/      # Database migrations
│       │   ├── 001_initial_schema.sql
│       │   └── migration-runner.ts
│       │
│       └── queries/         # Query functions
│           ├── transactions.ts
│           ├── merchants.ts
│           └── analytics.ts
│
├── public/                   # Static assets
│   ├── icons/               # App icons
│   └── images/              # Images
│
├── tests/                    # Test files
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # End-to-end tests
│
├── docs/                     # Documentation
├── .vscode/                  # VS Code configuration
├── electron-builder.yml      # Electron builder config
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript config
├── eslint.config.js          # ESLint configuration
├── prettier.config.js        # Prettier configuration
├── .env.example              # Environment template
└── package.json              # Dependencies and scripts
```

## Development Workflow

### Starting Development

```bash
# Start Next.js dev server + Electron
npm run dev

# Start Next.js only (for UI development)
npm run dev:next

# Start Electron only (assumes Next.js running)
npm run dev:electron
```

### Making Changes

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Edit code
   - Save (auto-format with Prettier)
   - Hot reload updates UI automatically

3. **Test changes**
   ```bash
   npm run test
   npm run lint
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add feature description"
   ```

### Building

```bash
# Build Next.js production bundle
npm run build

# Build Electron app for current platform
npm run build:electron

# Build for all platforms
npm run build:all
```

## Code Organization

### Component Structure

Follow this pattern for all React components:

```typescript
// src/components/features/example/example-component.tsx

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/lib/hooks/use-transactions';

interface ExampleComponentProps {
  title: string;
  onAction?: () => void;
}

/**
 * ExampleComponent displays...
 *
 * @param title - The component title
 * @param onAction - Optional callback when action is triggered
 */
export function ExampleComponent({ title, onAction }: ExampleComponentProps) {
  const [state, setState] = useState<string>('');
  const { transactions, loading } = useTransactions();

  useEffect(() => {
    // Side effects here
  }, []);

  const handleClick = () => {
    // Handler logic
    onAction?.();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <Button onClick={handleClick}>Click Me</Button>
    </div>
  );
}
```

### Custom Hook Pattern

```typescript
// src/lib/hooks/use-example.ts

import { useState, useEffect } from 'react';

interface UseExampleOptions {
  initialValue?: string;
}

interface UseExampleReturn {
  value: string;
  setValue: (value: string) => void;
  reset: () => void;
}

export function useExample(options: UseExampleOptions = {}): UseExampleReturn {
  const [value, setValue] = useState(options.initialValue || '');

  const reset = () => {
    setValue(options.initialValue || '');
  };

  return {
    value,
    setValue,
    reset
  };
}
```

### Database Query Pattern

```typescript
// src/db/queries/transactions.ts

import { db } from '@/electron/main/database';
import type { Transaction } from '@/lib/types/transaction';

export function getTransactionsByDateRange(
  startDate: string,
  endDate: string
): Transaction[] {
  return db.prepare(`
    SELECT * FROM transactions
    WHERE date BETWEEN ? AND ?
    ORDER BY date DESC
  `).all(startDate, endDate) as Transaction[];
}

export function insertTransaction(transaction: Omit<Transaction, 'id'>): number {
  const result = db.prepare(`
    INSERT INTO transactions (date, merchant, amount, category, transaction_type, raw_description)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    transaction.date,
    transaction.merchant,
    transaction.amount,
    transaction.category,
    transaction.transaction_type,
    transaction.raw_description
  );

  return result.lastInsertRowid as number;
}
```

## Testing

### Test Structure

```
tests/
├── unit/                    # Unit tests (pure functions, utilities)
│   ├── categorization.test.ts
│   ├── date-formatter.test.ts
│   └── merchant-normalizer.test.ts
│
├── integration/            # Integration tests (components, hooks)
│   ├── csv-import.test.tsx
│   ├── transaction-table.test.tsx
│   └── use-transactions.test.ts
│
└── e2e/                    # End-to-end tests (full user flows)
    ├── import-workflow.test.ts
    └── categorization-workflow.test.ts
```

### Unit Test Example

```typescript
// tests/unit/merchant-normalizer.test.ts

import { describe, it, expect } from '@jest/globals';
import { normalizeMerchant } from '@/lib/categorization/merchant-normalizer';

describe('normalizeMerchant', () => {
  it('should convert to uppercase', () => {
    expect(normalizeMerchant('starbucks')).toBe('STARBUCKS');
  });

  it('should remove special characters', () => {
    expect(normalizeMerchant('STARBUCKS #12345')).toBe('STARBUCKS 12345');
  });

  it('should trim whitespace', () => {
    expect(normalizeMerchant('  STARBUCKS  ')).toBe('STARBUCKS');
  });

  it('should handle empty strings', () => {
    expect(normalizeMerchant('')).toBe('');
  });
});
```

### Component Test Example

```typescript
// tests/integration/transaction-table.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionTable } from '@/components/features/transactions/transaction-table';

describe('TransactionTable', () => {
  const mockTransactions = [
    {
      id: 1,
      date: '2024-03-15',
      merchant: 'STARBUCKS',
      amount: 6.75,
      category: 'Dining',
      transaction_type: 'purchase'
    }
  ];

  it('renders transactions', () => {
    render(<TransactionTable transactions={mockTransactions} />);

    expect(screen.getByText('STARBUCKS')).toBeInTheDocument();
    expect(screen.getByText('$6.75')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const handleEdit = jest.fn();
    render(
      <TransactionTable
        transactions={mockTransactions}
        onEdit={handleEdit}
      />
    );

    fireEvent.click(screen.getByLabelText('Edit'));
    expect(handleEdit).toHaveBeenCalledWith(1);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- categorization.test.ts

# Run tests with coverage
npm test -- --coverage
```

## Debugging

### React DevTools

Open DevTools in Electron:
- **macOS:** Cmd+Option+I
- **Windows/Linux:** Ctrl+Shift+I

Or: View → Toggle Developer Tools

### Debugging Main Process

Add breakpoints in VS Code:

`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Main Process",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "windows": {
        "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron.cmd"
      },
      "args": ["."],
      "outputCapture": "std"
    }
  ]
}
```

### Logging

Use structured logging:

```typescript
// src/lib/utils/logger.ts
export const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.DEBUG === 'true') {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
  }
};

// Usage
logger.debug('Categorizing merchant', { merchant: 'STARBUCKS' });
logger.error('API call failed', error);
```

## Git Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Tests
- `chore` - Maintenance

**Examples:**
```
feat(csv-import): add column auto-detection

Implement automatic CSV column mapping based on header names.
Falls back to manual mapping if detection fails.

Closes #42
```

```
fix(categorization): handle empty merchant names

Gemini API was throwing errors on empty strings.
Now defaults to "Unknown Merchant" before categorization.
```

## Code Style

### ESLint Configuration

```javascript
// eslint.config.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
```

### Prettier Configuration

```javascript
// prettier.config.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false
};
```

### TypeScript Guidelines

1. **Always define types** - Avoid `any`
2. **Use interfaces for objects** - Prefer `interface` over `type` for object shapes
3. **Strict mode enabled** - No implicit `any`, strict null checks
4. **Document complex types** - Add JSDoc comments

## Performance Optimization

### Database Performance

```typescript
// Use prepared statements for repeated queries
const getTransactionStmt = db.prepare('SELECT * FROM transactions WHERE id = ?');

// Bad: Parsing query each time
for (const id of ids) {
  db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
}

// Good: Reuse prepared statement
for (const id of ids) {
  getTransactionStmt.get(id);
}
```

### React Performance

```typescript
// Memoize expensive computations
const categoryTotals = useMemo(() => {
  return calculateCategoryTotals(transactions);
}, [transactions]);

// Memoize callbacks
const handleEdit = useCallback((id: number) => {
  editTransaction(id);
}, [editTransaction]);

// Memoize components
export const TransactionRow = memo(({ transaction, onEdit }) => {
  // Component code
});
```

## Related Documentation

- [Setup Guide](SETUP.md) - Installation instructions
- [Architecture](ARCHITECTURE.md) - System design
- [Contributing](../CONTRIBUTING.md) - Contribution guidelines
- [Database Schema](DATABASE.md) - Database structure
