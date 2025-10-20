# Firestore Security Rules Setup

## The Error You're Seeing

```
Error fetching user data: FirebaseError: Missing or insufficient permissions.
```

This means your Firestore security rules are blocking read/write access to the database. By default, Firebase creates restrictive rules that deny all access.

## Quick Fix (5 Minutes)

### Step 1: Open Firebase Console

1. Go to https://console.firebase.google.com/
2. Select your project: **goalcraft-70789**
3. Click on **Firestore Database** in the left menu
4. Click on the **Rules** tab at the top

### Step 2: Update Rules

Replace the existing rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Goals collection - users can read/write their own goals
    match /goals/{goalId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Tasks collection - users can read/write their own tasks
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

### Step 3: Publish

Click the **Publish** button to save the rules.

### Step 4: Test

Try signing in with Google again. The error should be gone!

---

## Understanding the Rules

### Users Collection
```javascript
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```
- **What it does**: Users can only read/write their own user document
- **Example**: User with uid `abc123` can only access `/users/abc123`
- **Security**: Users cannot see other users' data

### Goals Collection
```javascript
match /goals/{goalId} {
  allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
  allow create: if request.auth != null;
}
```
- **What it does**: Users can only read/write goals where they are the owner
- **Create**: Any authenticated user can create a goal
- **Read/Write**: Only if `resource.data.userId` matches the user's `uid`

### Tasks Collection
```javascript
match /tasks/{taskId} {
  allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
  allow create: if request.auth != null;
}
```
- **What it does**: Same as goals - users own their tasks
- **Security**: Tasks are private to the user who created them

---

## Development Mode (Testing Only)

⚠️ **WARNING**: Only use this for testing! This allows ANY authenticated user to read/write ANY document.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**When to use**:
- Testing authentication
- Developing locally
- Quick prototyping

**Before production**:
- Replace with proper rules (above)
- Test thoroughly

---

## Common Issues

### Issue 1: Still Getting Permission Error

**Solution**: 
1. Make sure you published the rules
2. Wait 10-15 seconds for rules to propagate
3. Refresh your app
4. Clear browser cache if needed

### Issue 2: Rules Published But Not Working

**Check**:
```javascript
// In your code, make sure you're using the correct user ID
await setDoc(doc(db, "users", user.uid), { ... });
//                                ^^^^^^^^ Must match auth user ID
```

### Issue 3: Can't Create New Documents

**Problem**: Rules too restrictive for creation

**Solution**: Add `allow create` separately:
```javascript
match /goals/{goalId} {
  allow create: if request.auth != null;
  allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
}
```

---

## Testing Your Rules

### In Firebase Console

1. Go to **Firestore Database** → **Rules**
2. Click **Rules Playground** button
3. Test different scenarios:

**Test 1: Reading Own User Document**
```
Location: /users/abc123
Authenticated: Yes (uid: abc123)
Operation: get
Result: ✅ Allowed
```

**Test 2: Reading Someone Else's User Document**
```
Location: /users/xyz789
Authenticated: Yes (uid: abc123)
Operation: get
Result: ❌ Denied
```

### In Your App

```typescript
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// This should work (reading own data)
const userDoc = await getDoc(doc(db, "users", currentUser.uid));

// This should fail (reading someone else's data)
const otherUserDoc = await getDoc(doc(db, "users", "some-other-uid"));
```

---

## Production-Ready Rules (Advanced)

For production, you might want more specific validation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn() && isOwner(userId);
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isOwner(userId) && 
        // Only allow updating specific fields
        request.resource.data.keys().hasOnly(['name', 'photoURL', 'preferences', 'subscription']);
      allow delete: if false; // Prevent user deletion
    }
    
    // Goals collection
    match /goals/{goalId} {
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## Next Steps

1. ✅ Update Firestore rules in Firebase Console
2. ✅ Test sign-in with Google
3. ✅ Verify user data loads correctly
4. 📝 Consider adding data validation rules
5. 🔒 Review security before production launch

## Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Rules Testing Guide](https://firebase.google.com/docs/rules/unit-tests)
- [Common Security Patterns](https://firebase.google.com/docs/firestore/security/rules-conditions)
