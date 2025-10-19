# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for GoalCraft.

## Prerequisites

- A Google account
- Node.js installed on your machine

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter your project name (e.g., "GoalCraft")
4. Disable Google Analytics (optional, you can enable it later)
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web** icon (`</>`)
2. Register your app with a nickname (e.g., "GoalCraft Web")
3. **Don't** check "Set up Firebase Hosting" for now
4. Click "Register app"
5. Copy the Firebase configuration object - you'll need these values

## Step 3: Enable Authentication Methods

1. In the Firebase Console, go to **Build** > **Authentication**
2. Click "Get started"
3. Go to the **Sign-in method** tab
4. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"
5. Enable **Google**:
   - Click on "Google"
   - Toggle "Enable" to ON
   - Select a support email from the dropdown
   - Click "Save"

## Step 4: Configure Your App

1. In your project root, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Firebase configuration values:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. **Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## Step 5: Configure Authorized Domains

For production deployment:

1. In Firebase Console, go to **Authentication** > **Settings** > **Authorized domains**
2. Add your production domain (e.g., `yourdomain.com`)
3. For local development, `localhost` is already authorized by default

## Step 6: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/signup`
3. Try creating an account with email/password
4. Try signing in with Google

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Make sure your domain is added to Authorized domains in Firebase Console
- For local development, ensure you're using `localhost` not `127.0.0.1`

### "Firebase: Error (auth/configuration-not-found)"
- Check that your `.env.local` file exists and has all required values
- Restart your development server after adding environment variables

### Google Sign-In Popup Closes Immediately
- Ensure you've added a support email in the Google authentication settings
- Check that your Firebase project's OAuth consent screen is configured

## Security Best Practices

1. **Never expose your Firebase config in client-side code** - While it's safe to expose API keys in client code (Firebase has security rules), never commit sensitive credentials.

2. **Set up Firestore Security Rules** - If you add Firestore database:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

3. **Enable App Check** (Recommended for production):
   - Protects your Firebase resources from abuse
   - Go to **Build** > **App Check** in Firebase Console
   - Follow the setup instructions for web apps

## Next Steps

- Set up Firestore Database for storing goals and tasks
- Configure Firebase Storage for profile pictures
- Add email verification for new accounts
- Implement password reset functionality
- Set up Firebase Analytics

## Useful Links

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Next.js with Firebase](https://firebase.google.com/docs/web/setup#nextjs)
