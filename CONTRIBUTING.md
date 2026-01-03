# Contributing to Vault

Thank you for your interest in contributing to Vault! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Message Conventions](#commit-message-conventions)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Assume good intentions
- Respect differing viewpoints and experiences

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Git
- Gemini API key for testing categorization features

### Setting Up Your Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/vault.git
cd vault
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/vault.git
```

4. Install dependencies:

```bash
npm install
```

5. Create a `.env.local` file:

```bash
cp .env.example .env.local
# Add your Gemini API key
```

6. Run the development server:

```bash
npm run dev
```

## Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation changes

### Working on a Feature

1. Create a new branch from `develop`:

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

2. Make your changes and commit regularly
3. Keep your branch up to date:

```bash
git fetch upstream
git rebase upstream/develop
```

4. Push your branch to your fork:

```bash
git push origin feature/your-feature-name
```

5. Create a pull request on GitHub

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Document complex types with comments

### Code Style

This project uses ESLint and Prettier for code formatting:

```bash
# Check for linting errors
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

**Key conventions:**

- Use 2 spaces for indentation
- Use single quotes for strings
- Include trailing commas in multi-line structures
- Use semicolons
- Maximum line length: 100 characters
- Use arrow functions for callbacks
- Prefer `const` over `let`, avoid `var`

### File Organization

```
src/
├── app/              # Next.js app router pages
├── components/
│   ├── ui/          # Reusable UI components
│   ├── features/    # Feature-specific components
│   └── layouts/     # Layout components
├── lib/
│   ├── utils/       # Utility functions
│   ├── hooks/       # Custom React hooks
│   └── constants/   # Constants and enums
├── electron/
│   ├── main/        # Electron main process
│   └── preload/     # Preload scripts
└── db/
    ├── schema/      # Database schema
    └── queries/     # Database query functions
```

### Component Guidelines

- Use functional components with hooks
- Keep components small and focused (< 200 lines)
- Extract complex logic into custom hooks
- Use proper prop typing with TypeScript interfaces
- Include JSDoc comments for complex components

Example:

```typescript
interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (id: string) => void;
  loading?: boolean;
}

/**
 * Displays a list of transactions with filtering and sorting.
 * Supports manual category overrides via inline editing.
 */
export function TransactionList({
  transactions,
  onEdit,
  loading = false
}: TransactionListProps) {
  // Component implementation
}
```

### Database Queries

- Use parameterized queries (never string concatenation)
- Handle errors gracefully
- Close database connections properly
- Add comments for complex queries

```typescript
// Good
const transaction = db.prepare(
  'SELECT * FROM transactions WHERE id = ?'
).get(transactionId);

// Bad - SQL injection risk
const transaction = db.exec(
  `SELECT * FROM transactions WHERE id = ${transactionId}`
);
```

## Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no logic change)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks (dependencies, build config)
- `perf` - Performance improvements

### Examples

```
feat(csv-import): add column mapping preview

Allow users to preview column mappings before importing CSV.
Includes validation for required columns (date, merchant, amount).

Closes #123
```

```
fix(categorization): handle empty merchant names

Gemini API was failing when merchant name was empty.
Now defaults to "Unknown Merchant" for categorization.
```

```
docs(api): add Gemini API rate limiting section

Documented rate limits and retry strategy for API calls.
```

### Commit Message Guidelines

- Use imperative mood ("add feature" not "added feature")
- First line should be ≤ 72 characters
- Include body for non-trivial changes
- Reference issues and PRs where applicable

## Pull Request Process

### Before Submitting

1. Ensure all tests pass: `npm test`
2. Run linting: `npm run lint`
3. Update documentation if needed
4. Add tests for new features
5. Ensure your branch is up to date with `develop`

### PR Template

When creating a pull request, include:

**Description:**
- What does this PR do?
- Why is this change needed?
- Related issues/tickets

**Type of Change:**
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

**Testing:**
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

**Screenshots (if applicable):**
- Add before/after screenshots for UI changes

### Review Process

1. At least one maintainer review required
2. All CI checks must pass
3. No unresolved comments
4. Squash commits if requested
5. Maintainer will merge once approved

## Issue Reporting

### Bug Reports

When reporting bugs, include:

- **Description:** Clear description of the issue
- **Steps to Reproduce:** Numbered steps to reproduce the behavior
- **Expected Behavior:** What you expected to happen
- **Actual Behavior:** What actually happened
- **Environment:**
  - OS and version
  - Node.js version
  - App version
- **Screenshots:** If applicable
- **Logs:** Relevant error messages or logs

### Feature Requests

When requesting features, include:

- **Problem:** What problem does this solve?
- **Proposed Solution:** How would you implement this?
- **Alternatives:** Have you considered other approaches?
- **Use Case:** Specific examples of how you'd use this

## Testing Guidelines

### Unit Tests

- Write tests for all new features
- Test edge cases and error conditions
- Use descriptive test names

```typescript
describe('TransactionCategorizer', () => {
  it('should categorize Starbucks as Dining', () => {
    const result = categorize('STARBUCKS #12345');
    expect(result.category).toBe('Dining');
  });

  it('should handle empty merchant names gracefully', () => {
    const result = categorize('');
    expect(result.category).toBe('Other');
  });
});
```

### Integration Tests

- Test component interactions
- Test database operations
- Test IPC communication between Electron processes

### Manual Testing

Before submitting PRs with UI changes:

1. Test on your target platform (macOS, Windows, Linux)
2. Test different CSV formats
3. Verify categorization accuracy
4. Check responsive behavior

## Questions?

If you have questions about contributing:

1. Check existing documentation in `docs/`
2. Search existing issues on GitHub
3. Create a new issue with the `question` label

## Thank You!

Your contributions make this project better. We appreciate your time and effort!
