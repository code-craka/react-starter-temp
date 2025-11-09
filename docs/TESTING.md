# Taskcoda Testing Guide

## TechSci, Inc. - Comprehensive Testing Suite

This guide covers the testing infrastructure for Taskcoda, including unit tests, integration tests, E2E tests, and load testing.

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Stack](#testing-stack)
3. [Running Tests](#running-tests)
4. [Unit Tests](#unit-tests)
5. [Integration Tests](#integration-tests)
6. [E2E Tests](#e2e-tests)
7. [Load Testing](#load-testing)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Coverage Requirements](#coverage-requirements)
10. [Writing New Tests](#writing-new-tests)

---

## Overview

Taskcoda uses a comprehensive testing strategy to ensure code quality and reliability:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test complete user flows and feature interactions
- **E2E Tests**: Test critical user journeys in a real browser
- **Load Tests**: Test system performance under load

### Coverage Target

- **Minimum Coverage**: 60% for critical paths
- **Focus Areas**: Business logic, authentication, billing, quotas

---

## Testing Stack

| Tool | Purpose | Documentation |
|------|---------|---------------|
| **Vitest** | Unit & integration testing | [vitejs.dev/guide](https://vitest.dev) |
| **Testing Library** | React component testing | [testing-library.com](https://testing-library.com) |
| **Playwright** | E2E browser testing | [playwright.dev](https://playwright.dev) |
| **MSW** | API mocking | [mswjs.io](https://mswjs.io) |
| **k6** | Load testing | [k6.io](https://k6.io) |

---

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:unit

# Watch mode for development
npm run test:watch

# Open Vitest UI
npm run test:ui
```

### E2E Tests

```bash
# Run E2E tests in headless mode
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific browser
npx playwright test --project=chromium
```

### Load Tests

```bash
# Install k6 (macOS)
brew install k6

# Install k6 (Linux)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Run load tests
npm run test:load

# Or directly with k6
k6 run tests/load/api-endpoints.js

# Run against production
BASE_URL=https://taskcoda.com k6 run tests/load/api-endpoints.js
```

### Run All Tests

```bash
# Run unit + E2E tests
npm run test:all
```

---

## Unit Tests

### File Structure

```
tests/
├── unit/
│   ├── logger.test.ts          # Logger utility tests
│   ├── utils.test.ts           # Utility function tests
│   └── components/
│       ├── button.test.tsx     # Component tests
│       └── card.test.tsx
├── fixtures/
│   ├── users.ts                # Mock user data
│   ├── organizations.ts        # Mock organization data
│   └── subscriptions.ts        # Mock subscription data
└── setup.ts                    # Test environment setup
```

### Example Unit Test

```typescript
import { describe, it, expect, vi } from "vitest";
import { logger, logAuth } from "~/lib/logger";

describe("Logger Utility", () => {
  it("should log authentication success", () => {
    const infoSpy = vi.spyOn(logger, "info");
    logAuth.success("user123", "test@techsci.io");

    expect(infoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "auth_success",
        userId: "user123",
        email: "test@techsci.io",
      }),
      "User authenticated successfully"
    );
  });
});
```

### Component Testing

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "~/components/ui/button";

describe("Button Component", () => {
  it("should render with text", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("should handle click events", async () => {
    const handleClick = vi.fn();
    const { user } = render(<Button onClick={handleClick}>Click</Button>);

    await user.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

---

## Integration Tests

Integration tests verify complete user flows and feature interactions.

### Example: Authentication Flow

```typescript
import { describe, it, expect } from "vitest";

describe("Authentication Flow", () => {
  it("should create user profile on signup", async () => {
    // 1. User signs up via Clerk
    // 2. Webhook triggers user profile creation
    // 3. User is redirected to onboarding
    // 4. Verify user exists in database
  });

  it("should redirect to dashboard on login", async () => {
    // 1. User logs in via Clerk
    // 2. Session is established
    // 3. User is redirected to /dashboard
    // 4. Verify user can access dashboard
  });
});
```

### Example: Billing Flow

```typescript
describe("Billing Flow", () => {
  it("should upgrade from free to pro", async () => {
    // 1. User on free plan
    // 2. Clicks upgrade button
    // 3. Completes checkout via Polar.sh
    // 4. Webhook updates subscription
    // 5. Verify pro features unlocked
  });
});
```

---

## E2E Tests

E2E tests use Playwright to test critical user journeys in real browsers.

### File Structure

```
tests/
└── e2e/
    ├── homepage.spec.ts        # Homepage tests
    ├── admin-panel.spec.ts     # Admin functionality tests
    ├── signup-to-billing.spec.ts  # Full user journey
    └── team-management.spec.ts    # Team collaboration tests
```

### Example E2E Test

```typescript
import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Taskcoda/i);
  });

  test("should navigate to pricing", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Pricing/i }).click();
    await expect(page).toHaveURL(/\/pricing/);
  });
});
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/homepage.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific browser
npx playwright test --project=firefox

# Debug mode
npx playwright test --debug

# View test report
npx playwright show-report
```

---

## Load Testing

Load tests use k6 to simulate high traffic and measure performance.

### Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| **p95 Response Time** | < 500ms | < 1000ms |
| **p99 Response Time** | < 1000ms | < 2000ms |
| **Error Rate** | < 0.5% | < 1% |
| **Throughput** | > 100 req/s | > 50 req/s |

### Load Test Configuration

```javascript
export const options = {
  stages: [
    { duration: "30s", target: 20 },   // Ramp up
    { duration: "1m", target: 50 },    // Steady load
    { duration: "30s", target: 100 },  // Peak load
    { duration: "2m", target: 100 },   // Sustain peak
    { duration: "30s", target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.01"],
  },
};
```

### Running Load Tests

```bash
# Local testing
npm run test:load

# Against staging
BASE_URL=https://staging.taskcoda.com k6 run tests/load/api-endpoints.js

# Against production (careful!)
BASE_URL=https://taskcoda.com k6 run tests/load/api-endpoints.js --vus 10 --duration 30s

# With custom VUs and duration
k6 run tests/load/api-endpoints.js --vus 50 --duration 2m

# Output results to file
k6 run tests/load/api-endpoints.js --out json=test-results/load-test.json
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request to `main` or `develop`

### Workflow Steps

1. **Unit Tests** - Run on all pushes/PRs
2. **Build Check** - Verify app builds successfully
3. **E2E Tests** - Run only on `main` branch (to save CI time)
4. **Coverage Check** - Fail if coverage < 60%

### View Test Results

```bash
# View coverage report
open coverage/index.html

# View Playwright report
npx playwright show-report

# View k6 results
cat test-results/load-test-summary.json
```

---

## Coverage Requirements

### Thresholds

```typescript
coverage: {
  thresholds: {
    statements: 60,
    branches: 50,
    functions: 60,
    lines: 60,
  },
}
```

### Critical Areas (Must Have Tests)

✅ **Authentication**
- User signup → profile creation
- User login → session management
- Logout → cleanup

✅ **Organizations**
- Create organization → assign owner role
- Invite member → send email
- Change member role → verify permissions
- Remove member → revoke access

✅ **Billing**
- Free → Pro upgrade
- Pro → Enterprise upgrade
- Subscription cancellation
- Webhook processing

✅ **Quotas**
- Increment usage
- Enforce limits
- Reset monthly quotas
- Plan-specific limits

✅ **Admin Panel**
- User management
- Organization management
- System health monitoring
- Feature flags

---

## Writing New Tests

### Unit Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Feature Name", () => {
  beforeEach(() => {
    // Setup code
  });

  it("should do something", () => {
    // Arrange
    const input = "test";

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe("expected");
  });
});
```

### E2E Test Template

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test("should complete user journey", async ({ page }) => {
    // Navigate
    await page.goto("/");

    // Interact
    await page.getByRole("button", { name: /Click Me/i }).click();

    // Assert
    await expect(page).toHaveURL(/\/success/);
  });
});
```

### Load Test Template

```javascript
import http from "k6/http";
import { check, sleep } from "k6";

export default function () {
  const res = http.get("https://taskcoda.com/api/endpoint");

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

---

## Best Practices

### Unit Tests

✅ **DO**:
- Test one thing per test
- Use descriptive test names
- Mock external dependencies
- Keep tests fast (< 1s)

❌ **DON'T**:
- Test implementation details
- Share state between tests
- Use real API calls
- Skip error cases

### E2E Tests

✅ **DO**:
- Test critical user journeys
- Use page object pattern for reusability
- Wait for elements to be visible
- Take screenshots on failure

❌ **DON'T**:
- Test every edge case (use unit tests)
- Hardcode selectors
- Share authentication between tests
- Run tests in production

### Load Tests

✅ **DO**:
- Start with low load
- Gradually increase VUs
- Monitor error rates
- Test realistic scenarios

❌ **DON'T**:
- Run against production without permission
- Use production user data
- Exceed server capacity
- Ignore error thresholds

---

## Debugging Tests

### Vitest

```bash
# Run specific test file
npm test tests/unit/logger.test.ts

# Run tests matching pattern
npm test -- --grep "authentication"

# Debug in VS Code
# Add breakpoint, press F5
```

### Playwright

```bash
# Debug mode (opens inspector)
npx playwright test --debug

# Run in headed mode
npx playwright test --headed

# Slow down execution
npx playwright test --headed --slow-mo=1000

# Generate test code
npx playwright codegen https://taskcoda.com
```

### k6

```bash
# Run with detailed output
k6 run tests/load/api-endpoints.js --verbose

# Run single iteration
k6 run tests/load/api-endpoints.js --iterations 1

# Output to InfluxDB (for visualization)
k6 run tests/load/api-endpoints.js --out influxdb=http://localhost:8086/k6
```

---

## Troubleshooting

### Common Issues

#### Tests Timing Out

```typescript
// Increase timeout in vitest.config.ts
test: {
  testTimeout: 20000, // 20 seconds
}
```

#### Playwright Browser Launch Fails

```bash
# Install missing dependencies
npx playwright install --with-deps

# Or install specific browser
npx playwright install chromium
```

#### Coverage Not Generated

```bash
# Ensure coverage is configured
npm run test:unit

# Check coverage directory
ls -la coverage/
```

#### k6 Not Found

```bash
# Install k6
brew install k6  # macOS
# or
sudo apt install k6  # Ubuntu
```

---

## Resources

- [Vitest Documentation](https://vitest.dev)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright Documentation](https://playwright.dev)
- [k6 Documentation](https://k6.io/docs/)
- [MSW Documentation](https://mswjs.io/)

---

## Support

**Company**: TechSci, Inc.
**Product**: Taskcoda
**Email**: hello@techsci.io

For testing issues or questions, please contact the engineering team.

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintained by**: TechSci, Inc. Engineering Team
