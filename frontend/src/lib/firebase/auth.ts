import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
  linkWithCredential,
  EmailAuthProvider,
  linkWithPopup,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { AppUser } from "@/types";

// Function to fetch and merge Firestore user data with Firebase Auth user
export const fetchUserData = async (
  authUser: User,
  fallbackTheme: string = "system"
): Promise<AppUser> => {
  try {
    const userDoc = await getDoc(doc(db, "users", authUser.uid));

    if (userDoc.exists()) {
      const firestoreData = userDoc.data();

      // Merge Firebase Auth user with Firestore data
      return {
        ...authUser,
        name: firestoreData.name || authUser.displayName || undefined,
        subscription: firestoreData.subscription || "free",
        createdAt: firestoreData.createdAt?.toDate(),
        theme: firestoreData.theme || "system",
        pushNotifications: firestoreData.pushNotifications ?? true,
        customCategories: firestoreData.customCategories || [],
      } as AppUser;
    } else {
      // If no Firestore doc exists, return auth user with defaults
      return {
        ...authUser,
        subscription: "free",
        theme: fallbackTheme,
        pushNotifications: true,
      } as AppUser;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    // Return auth user with defaults on error
    return {
      ...authUser,
      subscription: "free",
      theme: fallbackTheme,
      pushNotifications: true,
    } as AppUser;
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  theme: string
) => {
  const currentUser = auth.currentUser;

  // If current user is anonymous, link the account instead of creating new
  if (currentUser?.isAnonymous) {
    const credential = EmailAuthProvider.credential(email, password);
    const userCredential = await linkWithCredential(currentUser, credential);
    const user = userCredential.user;

    // Create or update user document
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      createdAt: new Date(),
      subscription: "free",
      theme,
      pushNotifications: true,
    });

    return userCredential;
  }

  // Normal sign up flow for non-anonymous users
  return createUserWithEmailAndPassword(auth, email, password).then(
    async (userCredential) => {
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date(),
        subscription: "free",
        theme,
        pushNotifications: true,
      });
      return userCredential;
    }
  );
};

// Sign in with Google
export const signInWithGoogle = async (theme: string) => {
  const provider = new GoogleAuthProvider();
  const currentUser = auth.currentUser;

  // If current user is anonymous, link the account instead of signing in
  if (currentUser?.isAnonymous) {
    try {
      const userCredential = await linkWithPopup(currentUser, provider);
      const user = userCredential.user;

      // Create user document for the linked account
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        createdAt: new Date(),
        photoURL: user.photoURL,
        subscription: "free",
        theme,
        pushNotifications: true,
      });

      return userCredential;
    } catch (error) {
      // If linking fails (e.g., account already exists), fall back to regular sign in
      console.error("Error linking anonymous account:", error);
      // Sign out the anonymous user and sign in with Google
      await signOut(auth);
      return signInWithPopup(auth, provider).then(async (userCredential) => {
        const user = userCredential.user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, "users", user.uid), {
            name: user.displayName,
            email: user.email,
            createdAt: new Date(),
            photoURL: user.photoURL,
            subscription: "free",
            theme,
            pushNotifications: true,
          });
        }
        return userCredential;
      });
    }
  }

  // Normal Google sign in flow
  return signInWithPopup(auth, provider).then(async (userCredential) => {
    const user = userCredential.user;

    try {
      // Check if user document already exists
      const userDoc = await getDoc(doc(db, "users", user.uid));

      // Only create document if it doesn't exist (new user)
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          createdAt: new Date(),
          photoURL: user.photoURL,
          subscription: "free",
          theme,
          pushNotifications: true,
        });
      }
    } catch (error) {
      console.error("Error creating/reading user document:", error);
      // If Firestore operation fails, still allow sign-in
      // The fetchUserData function will handle the missing document
    }

    return userCredential;
  });
};

// Sign out
export const logout = async () => {
  return signOut(auth);
};

// Set up auth state listener with real-time Firestore sync
export const setupAuthListener = (
  setUser: (user: AppUser | null) => void,
  setTheme: (theme: string) => void,
  setLoading: (loading: boolean) => void,
  fallbackTheme: string = "system"
) => {
  let userDocUnsubscribe: (() => void) | undefined;

  const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
    if (authUser) {
      // Fetch and merge Firestore data
      const appUser = await fetchUserData(authUser, fallbackTheme);
      setUser(appUser);

      // Set up real-time listener for user document changes
      const userDocRef = doc(db, "users", authUser.uid);
      userDocUnsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const firestoreData = docSnapshot.data();

          // Update user with latest Firestore data
          const updatedUser = {
            ...authUser,
            name: firestoreData.name || authUser.displayName || undefined,
            subscription: firestoreData.subscription || "free",
            createdAt: firestoreData.createdAt?.toDate(),
            theme: firestoreData.theme || "system",
            pushNotifications: firestoreData.pushNotifications ?? true,
            customCategories: firestoreData.customCategories || [],
          } as AppUser;

          setUser(updatedUser);

          // Sync theme when it changes in Firestore
          if (firestoreData.theme) {
            setTheme(firestoreData.theme);
          }
        }
      });
    } else {
      setUser(null);
      // Clean up user doc listener if user logs out
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
      }
    }
    setLoading(false);
  });

  // Return cleanup function
  return () => {
    unsubscribe();
    if (userDocUnsubscribe) {
      userDocUnsubscribe();
    }
  };
};
