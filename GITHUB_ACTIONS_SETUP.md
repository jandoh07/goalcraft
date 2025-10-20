# GitHub Actions CI/CD Setup Guide

## The Problem

You're seeing this error during CI builds:
```
Error [FirebaseError]: Firebase: Error (auth/invalid-api-key).
```

This happens because GitHub Actions doesn't have access to your Firebase environment variables (which are in your local `.env.local` file).

## Quick Fix (5 Minutes)

### Step 1: Get Your Firebase Config Values

Open your local `.env.local` file and copy the values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=goalcraft-70789.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=goalcraft-70789
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=goalcraft-70789.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123
```

### Step 2: Add Secrets to GitHub

1. **Go to your repository**: https://github.com/jandoh07/goalcraft

2. **Navigate to Settings**:
   - Click **Settings** tab (top right)
   - Click **Secrets and variables** (left sidebar)
   - Click **Actions**

3. **Add each secret**:
   - Click **New repository secret**
   - Add each variable one by one:

   | Name | Value (from your .env.local) |
   |------|------------------------------|
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | Your API key |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Your auth domain |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your project ID |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Your storage bucket |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | Your app ID |
   | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Your measurement ID |

### Step 3: Verify CI Workflow

The CI workflow has been updated to use these secrets. It now includes:

```yaml
env:
  NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
  # ... etc
```

### Step 4: Test

1. Commit and push this change to GitHub
2. Go to **Actions** tab in your repository
3. Watch the workflow run - it should now pass! ✅

## Understanding the CI Pipeline

Your CI pipeline now runs these steps on every push:

```yaml
1. ✅ Checkout code
2. ✅ Setup Node.js 20
3. ✅ Install dependencies (npm ci)
4. ✅ Type check (TypeScript)
5. ✅ Lint (ESLint)
6. ✅ Run tests (Vitest)
7. ✅ Build application (Next.js)
```

## Alternative: Use Mock Firebase Config for CI

If you don't want to use real Firebase credentials in CI, you can use mock values:

### Option A: Add Mock Values to CI

Update `.github/workflows/ci.yml`:

```yaml
env:
  # Mock Firebase config for CI builds
  NEXT_PUBLIC_FIREBASE_API_KEY: "mock-api-key-for-ci"
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "mock-project.firebaseapp.com"
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "mock-project-id"
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "mock-project.appspot.com"
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456789"
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:abc123"
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-ABC123"
```

**Pros**: No secrets needed
**Cons**: Build won't be exactly like production

### Option B: Skip Firebase Initialization in Build

Update `src/lib/firebase.ts`:

```typescript
// Initialize Firebase only in browser or with valid config
const shouldInitialize = 
  typeof window !== 'undefined' || 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const app = shouldInitialize && getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApps()[0];
```

**Pros**: Build won't fail
**Cons**: Might hide configuration errors

## Best Practice: Use Real Secrets (Recommended)

✅ **Recommended approach**: Add real Firebase credentials as GitHub Secrets

**Why?**
1. Build tests actual configuration
2. Catches configuration errors early
3. Matches production environment
4. More secure than committing config

**Security Note**: 
- Firebase API keys are safe to expose in client-side code
- Firestore security rules protect your data
- GitHub Secrets prevent accidental exposure in logs

## Deployment Environments

### Development (Local)
```bash
# Uses .env.local
npm run dev
```

### CI/CD (GitHub Actions)
```bash
# Uses GitHub Secrets
# Set in: Settings → Secrets → Actions
```

### Production (Vercel/Netlify)
```bash
# Add environment variables in dashboard
# Vercel: Settings → Environment Variables
# Netlify: Site settings → Environment variables
```

## Troubleshooting

### Build still fails after adding secrets

1. **Check secret names match exactly**:
   ```yaml
   # Must match your secret name in GitHub
   NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
   ```

2. **Secrets are case-sensitive**:
   - `NEXT_PUBLIC_FIREBASE_API_KEY` ✅
   - `next_public_firebase_api_key` ❌

3. **No spaces in secret values**:
   - `AIzaSy...` ✅
   - ` AIzaSy...` ❌ (leading space)

### How to verify secrets are set

1. Go to your repository
2. Settings → Secrets and variables → Actions
3. You should see 7 secrets listed

### Secrets not working

- Make sure you clicked **Update secret** or **Add secret**
- Try re-running the workflow (don't just push again)
- Check for typos in secret names

### Build passes but app doesn't work

- Verify you're using the same Firebase project
- Check Firestore security rules are deployed
- Verify all 7 environment variables are set

## Security Checklist

- ✅ `.env.local` is in `.gitignore` (never commit it!)
- ✅ Firebase secrets added to GitHub Secrets
- ✅ Firestore security rules properly configured
- ✅ No hardcoded credentials in source code
- ✅ Different Firebase projects for dev/staging/prod (optional)

## Next Steps

1. Add secrets to GitHub (Step 2 above)
2. Push the updated CI workflow
3. Verify build passes in Actions tab
4. Set up deployment (Vercel/Netlify)
5. Add environment variables to deployment platform

## Additional CI/CD Features (Optional)

### Add Test Coverage

```yaml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
```

### Add Build Caching

```yaml
- name: Cache Next.js build
  uses: actions/cache@v3
  with:
    path: .next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('package-lock.json') }}
```

### Deploy on Success

```yaml
- name: Deploy to Vercel
  if: github.ref == 'refs/heads/main'
  run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Firebase Security Best Practices](https://firebase.google.com/docs/projects/api-keys)
