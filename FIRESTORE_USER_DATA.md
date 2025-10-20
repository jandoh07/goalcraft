# Using Firestore User Data in GoalCraft

This guide explains how the user authentication and Firestore integration work together in your app.

## Overview

The app now fetches user data from both **Firebase Auth** (authentication) and **Firestore** (user profile data), and merges them into a single `user` object.

## User Data Structure

### AppUser Type

The `AppUser` interface extends Firebase Auth's `User` with additional Firestore fields:

```typescript
interface AppUser extends User {
  // From Firebase Auth (built-in)
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  
  // From Firestore (custom fields)
  name?: string;                    // User's display name
  subscription?: "free" | "premium"; // Subscription tier
  createdAt?: Date;                  // Account creation date
  preferences?: {
    darkMode?: boolean;              // Theme preference
    pushNotifications?: boolean;     // Notification preference
  };
}
```

## How It Works

### 1. User Signs Up

When a user creates an account:

```typescript
// Email/Password signup
await signUp(email, password);
```

**What happens:**
1. Creates Firebase Auth account
2. Creates Firestore document at `/users/{uid}`:
   ```json
   {
     "email": "user@example.com",
     "createdAt": "2025-10-20T...",
     "subscription": "free",
     "preferences": {
       "darkMode": false,
       "pushNotifications": true
     }
   }
   ```

### 2. User Signs In

When a user logs in:

```typescript
await signIn(email, password);
```

**What happens:**
1. Firebase Auth authenticates the user
2. Auth context fetches Firestore document
3. Merges both data sources into `AppUser` object
4. User is now available throughout the app

### 3. User Data is Available Everywhere

```typescript
import { useAuth } from "@/contexts/auth-context";

function MyComponent() {
  const { user } = useAuth();
  
  return (
    <div>
      <p>Email: {user?.email}</p>
      <p>Name: {user?.name}</p>
      <p>Subscription: {user?.subscription}</p>
      <p>Dark Mode: {user?.preferences?.darkMode ? 'On' : 'Off'}</p>
    </div>
  );
}
```

## Using User Data

### Method 1: Using useAuth Hook

```typescript
import { useAuth } from "@/contexts/auth-context";

function ProfileComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;
  
  return (
    <div>
      <h1>Welcome, {user.name || user.email}!</h1>
      <p>Subscription: {user.subscription}</p>
      <p>Joined: {user.createdAt?.toLocaleDateString()}</p>
    </div>
  );
}
```

### Method 2: Using Helper Hooks

```typescript
import { useCurrentUser, useIsPremium } from "@/hooks/use-current-user";

function FeatureComponent() {
  const user = useCurrentUser();
  const isPremium = useIsPremium();
  
  return (
    <div>
      <h2>Hello, {user?.name}!</h2>
      {isPremium ? (
        <PremiumFeature />
      ) : (
        <UpgradeToPremiumButton />
      )}
    </div>
  );
}
```

## Updating User Data

### Update User Preferences

```typescript
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";

function SettingsComponent() {
  const { user, refreshUser } = useAuth();
  
  const updateNotifications = async (enabled: boolean) => {
    if (!user?.uid) return;
    
    await updateDoc(doc(db, "users", user.uid), {
      "preferences.pushNotifications": enabled,
    });
    
    // Refresh user data to reflect changes
    await refreshUser();
  };
  
  return (
    <Switch
      checked={user?.preferences?.pushNotifications ?? true}
      onCheckedChange={updateNotifications}
    />
  );
}
```

### Update Subscription

```typescript
const upgradeTopremium = async () => {
  if (!user?.uid) return;
  
  await updateDoc(doc(db, "users", user.uid), {
    subscription: "premium",
  });
  
  await refreshUser();
};
```

### Update User Profile

```typescript
const updateProfile = async (name: string) => {
  if (!user?.uid) return;
  
  await updateDoc(doc(db, "users", user.uid), {
    name: name,
  });
  
  await refreshUser();
};
```

## Firestore Data Structure

### Users Collection

```
/users/{userId}
  ├── email: string
  ├── name?: string
  ├── photoURL?: string
  ├── createdAt: Timestamp
  ├── subscription: "free" | "premium"
  └── preferences: {
      ├── darkMode: boolean
      └── pushNotifications: boolean
  }
```

### Example Document

```json
{
  "email": "john@example.com",
  "name": "John Doe",
  "photoURL": "https://...",
  "createdAt": Timestamp,
  "subscription": "premium",
  "preferences": {
    "darkMode": true,
    "pushNotifications": true
  }
}
```

## Common Patterns

### Checking Subscription Status

```typescript
function PremiumFeature() {
  const { user } = useAuth();
  
  if (user?.subscription !== "premium") {
    return <UpgradePrompt />;
  }
  
  return <PremiumContent />;
}
```

### Displaying User Info

```typescript
function UserAvatar() {
  const { user } = useAuth();
  
  return (
    <div>
      <img src={user?.photoURL || '/default-avatar.png'} />
      <p>{user?.name || user?.displayName || 'User'}</p>
    </div>
  );
}
```

### Formatting Join Date

```typescript
function MemberSince() {
  const { user } = useAuth();
  
  const joinDate = user?.createdAt
    ? user.createdAt.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    : 'Recently';
  
  return <p>Member since {joinDate}</p>;
}
```

## Best Practices

### 1. Always Check for User

```typescript
// ✅ Good
if (user?.subscription === "premium") {
  // Do something
}

// ❌ Bad - will crash if user is null
if (user.subscription === "premium") {
  // Do something
}
```

### 2. Use Optional Chaining

```typescript
// ✅ Good
const darkMode = user?.preferences?.darkMode ?? false;

// ❌ Bad
const darkMode = user.preferences.darkMode || false;
```

### 3. Handle Loading States

```typescript
// ✅ Good
const { user, loading } = useAuth();

if (loading) return <Spinner />;
if (!user) return <LoginPrompt />;

return <Content user={user} />;
```

### 4. Refresh After Updates

```typescript
// ✅ Good
await updateDoc(doc(db, "users", user.uid), { ... });
await refreshUser(); // Refresh to see changes

// ❌ Bad - changes won't reflect immediately
await updateDoc(doc(db, "users", user.uid), { ... });
// User data still has old values
```

## Security Rules (Firestore)

Add these security rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can only read/write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /goals/{goalId} {
      // Users can only read/write their own goals
      allow read, write: if request.auth != null && 
                            resource.data.userId == request.auth.uid;
    }
    
    match /tasks/{taskId} {
      // Users can only read/write their own tasks
      allow read, write: if request.auth != null && 
                            resource.data.userId == request.auth.uid;
    }
  }
}
```

## Troubleshooting

### User data is null after login
- Check that Firestore document was created during signup
- Verify Firestore security rules allow reads
- Check console for errors

### Changes don't reflect immediately
- Call `refreshUser()` after updating Firestore
- Make sure you're updating the correct document path

### Can't update user data
- Verify user is authenticated (`user?.uid` exists)
- Check Firestore security rules
- Ensure you have the correct document path

## Next Steps

- Add more custom fields to user profile
- Implement profile picture upload
- Add user preferences for more settings
- Create admin dashboard for user management
