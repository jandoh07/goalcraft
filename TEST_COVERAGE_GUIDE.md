# Test Coverage Guide

## What is Test Coverage?

Test coverage measures **which parts of your code are tested**.

### Without Coverage:
```bash
npm test
# Output:
✓ 14 tests passed
❌ Can't tell which code is actually tested
```

### With Coverage:
```bash
npm run test:coverage
# Output:
✓ 14 tests passed
✅ Shows which lines/functions/branches are tested
```

## Coverage vs Regular Tests

### Same Tests, Different Output

Both commands run the **exact same tests**:

| Command | Tests Run | Shows Coverage? | Speed |
|---------|-----------|-----------------|-------|
| `npm test` | All tests | ❌ No | Faster |
| `npm run test:coverage` | All tests | ✅ Yes | Slightly slower |

**Key Point:** Coverage is just **extra reporting**, not different tests!

## Understanding Coverage Metrics

### Example Coverage Report:

```bash
File              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines
------------------|---------|----------|---------|---------|----------------
src/lib/utils.ts  |   100   |   100    |   100   |   100   | 
src/auth.tsx      |   85.5  |   70.0   |   90.0  |   85.5  | 45-47, 89
src/firebase.ts   |   50.0  |   0.0    |   50.0  |   50.0  | 12-25
------------------|---------|----------|---------|---------|----------------
Total             |   78.5  |   56.7   |   80.0  |   78.5  |
```

### What Each Metric Means:

#### % Stmts (Statements)
- **What**: Percentage of code statements executed
- **Example**: 
  ```typescript
  const x = 5;        // ✅ Covered
  const y = x + 10;   // ✅ Covered
  const z = y * 2;    // ❌ Not covered (never runs in tests)
  ```

#### % Branch (Branches)
- **What**: Percentage of conditional paths tested
- **Example**:
  ```typescript
  if (user) {          // ✅ Both paths need testing
    return "Yes";      // ✅ Covered
  } else {
    return "No";       // ❌ Not covered (never tested)
  }
  ```

#### % Funcs (Functions)
- **What**: Percentage of functions called in tests
- **Example**:
  ```typescript
  function greet() { return "Hi"; }    // ✅ Covered
  function farewell() { return "Bye"; } // ❌ Not covered (never called)
  ```

#### % Lines
- **What**: Percentage of code lines executed
- **Similar to % Stmts** but counts by line number

## Your CI Setup Explained

### Current CI Flow:

```yaml
1. Run tests          (npm test)
   ↓ Fast check - all tests pass/fail

2. Run with coverage  (npm run test:coverage)
   ↓ Detailed analysis - what's tested

3. Upload to Codecov  (Visual reports)
   ↓ Track coverage over time

4. Build application  (npm run build)
```

### Why Run Tests Twice?

You might ask: "Why `npm test` AND `npm run test:coverage`?"

**Answer:** You don't have to! You can choose:

**Option A: Run both (Current Setup)**
```yaml
- name: Run tests
  run: npm test              # Fast - fails fast if tests break

- name: Run tests with coverage
  run: npm run test:coverage # Detailed - generates reports
```
**Pros:** Fail fast, then get details
**Cons:** Runs tests twice (but with caching, it's fast)

**Option B: Just coverage (Simpler)**
```yaml
- name: Run tests with coverage
  run: npm run test:coverage # Does both at once
```
**Pros:** Runs once, still shows test results
**Cons:** Slightly slower on first failure

**Recommendation:** Start with **Option B** (just coverage), then add separate `npm test` only if needed.

## Setting Up Codecov (Optional)

Codecov is a service that visualizes your coverage over time.

### Step 1: Sign Up for Codecov
1. Go to https://codecov.io
2. Sign in with GitHub
3. Add your repository: `jandoh07/goalcraft`

### Step 2: Get Codecov Token
1. Go to repository settings in Codecov
2. Copy the upload token

### Step 3: Add Token to GitHub Secrets
1. Go to GitHub: Settings → Secrets → Actions
2. Add secret: `CODECOV_TOKEN` = (your token)

### Step 4: View Reports
After CI runs, visit:
```
https://codecov.io/gh/jandoh07/goalcraft
```

You'll see:
- Coverage percentage over time
- Which files need more tests
- Coverage trends per commit

## Local Development

### View Coverage Locally

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report in browser
# Coverage report saved at: coverage/index.html
```

### Coverage Files Generated:

```
coverage/
  ├── index.html       # 👈 Open this in browser
  ├── lcov.info        # For CI tools
  ├── coverage-final.json
  └── ...
```

### Example HTML Report:

![Coverage Report Screenshot]
- Green = Covered lines ✅
- Red = Uncovered lines ❌
- Yellow = Partially covered branches ⚠️

## Coverage Configuration

### What's Excluded from Coverage:

```typescript
// vitest.config.ts
coverage: {
  exclude: [
    "node_modules/",      // Third-party code
    ".next/",             // Build output
    "coverage/",          // Coverage reports
    "**/*.config.*",      // Config files (vitest.config.ts, etc.)
    "**/*.test.*",        // Test files themselves
    "**/types/**",        // Type definitions
  ],
}
```

### Why Exclude These?
- **node_modules**: You don't test third-party libraries
- **.next**: Generated code, not your source
- **Config files**: Configuration doesn't need tests
- **Test files**: Testing the tests is redundant
- **Types**: TypeScript definitions don't run

## Coverage Goals

### Good Coverage Targets:

| Coverage % | Status | Meaning |
|-----------|--------|---------|
| 80%+ | 🟢 Excellent | Most code is tested |
| 60-80% | 🟡 Good | Core functionality tested |
| 40-60% | 🟠 Okay | Basic tests in place |
| <40% | 🔴 Needs work | Too much untested code |

### Don't Chase 100%!

**100% coverage doesn't mean no bugs!**

❌ Bad example:
```typescript
// 100% coverage, but useless test
it("should exist", () => {
  expect(myFunction).toBeDefined(); // ❌ Doesn't test behavior
});
```

✅ Good example:
```typescript
// 100% coverage with meaningful test
it("should return correct initials", () => {
  expect(avatarFallbackInitial("John Doe")).toBe("JD"); // ✅ Tests behavior
});
```

### Focus On:
1. ✅ Critical business logic (auth, payments, data)
2. ✅ Complex functions (calculations, algorithms)
3. ✅ Error handling paths
4. ❌ Don't obsess over UI components
5. ❌ Don't test trivial code

## Simplified CI Workflow (Recommended)

Here's a cleaner version with just coverage:

```yaml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    fail_ci_if_error: false

- name: Build application
  run: npm run build
```

**Why this is better:**
- ✅ Runs tests once
- ✅ Still shows if tests pass/fail
- ✅ Generates coverage report
- ✅ Uploads to Codecov
- ✅ Simpler to maintain

## Common Questions

### Q: Should I run tests twice in CI?
**A:** Not necessary. `test:coverage` runs all tests AND generates coverage.

### Q: Does coverage slow down tests?
**A:** Slightly (10-20% slower), but worth it for the insights.

### Q: Do I need Codecov?
**A:** No! It's optional. Coverage works without it. Codecov just makes reports prettier.

### Q: What's a good coverage percentage?
**A:** Aim for 70-80%. Don't obsess over 100%.

### Q: How do I improve coverage?
**A:** 
1. Look at coverage report (coverage/index.html)
2. Find red/uncovered lines
3. Write tests for those lines

### Q: Can I enforce minimum coverage?
**A:** Yes! Add to `vitest.config.ts`:
```typescript
coverage: {
  thresholds: {
    lines: 80,      // Fail if coverage drops below 80%
    functions: 80,
    branches: 80,
    statements: 80
  }
}
```

## Summary

### Current Setup ✅

Your CI now:
1. ✅ Runs regular tests (fast check)
2. ✅ Runs tests with coverage (detailed analysis)
3. ✅ Uploads to Codecov (visual reports)
4. ✅ Caches Next.js build (faster builds)

### Next Steps

1. **Install coverage package:**
   ```bash
   npm install --save-dev @vitest/coverage-v8
   ```

2. **Test locally:**
   ```bash
   npm run test:coverage
   open coverage/index.html
   ```

3. **Optional: Set up Codecov:**
   - Sign up at codecov.io
   - Add CODECOV_TOKEN to GitHub secrets

4. **Optional: Simplify CI:**
   - Remove `npm test` step
   - Keep only `npm run test:coverage`

### Commands Summary

```bash
# Development
npm test                  # Quick test run
npm run test:ui          # Visual test UI
npm run test:coverage    # With coverage report

# CI (GitHub Actions)
npm test                 # Fast check
npm run test:coverage    # Detailed analysis
```

Your test coverage setup is now production-ready! 🎉
