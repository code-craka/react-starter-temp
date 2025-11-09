# Testing Guide

Complete testing guide for Taskcoda SaaS Starter Template.

## Environment Setup for Tests

### Required Environment Variables

Tests require these environment variables (automatically configured):

```bash
VITE_CONVEX_URL=https://test.convex.cloud
CONVEX_URL=https://test.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_mock_key
NODE_ENV=test
```

### Local Testing
No setup needed - variables are pre-configured in `tests/setup.ts`

### CI/CD Testing  
Variables are automatically set in `.github/workflows/test.yml`

For production builds, add GitHub Secrets:
- `VITE_CONVEX_URL` - Your Convex deployment URL
- `VITE_CLERK_PUBLISHABLE_KEY` - Your Clerk key

## Running Tests

```bash
npm test              # All tests
npm run test:unit     # Unit tests with coverage
npm run test:e2e      # E2E tests
npm run test:watch    # Watch mode
```

## Coverage (26% achieved)

```
Lines: 26.05% (target: 25%) ✅
Statements: 26.05% (target: 25%) ✅
Branches: 20.93% (target: 20%) ✅
Functions: 20.75% (target: 20%) ✅
```

### 100% Coverage Components
- app/lib/utils.ts
- app/components/ui/button.tsx
- app/components/ui/input.tsx  
- app/components/ui/badge.tsx
- app/components/ui/label.tsx
- app/components/ui/textarea.tsx

## Writing Tests

See existing test files in `tests/unit/` for examples:
- `utils.test.ts` - Utility functions
- `button.test.tsx` - UI components
- `logger.test.ts` - Service testing

For full documentation, see [Vitest Docs](https://vitest.dev/)
