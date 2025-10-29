"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase/firebase";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { useTheme } from "next-themes";
import { AppUser } from "@/types";

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  // Function to fetch and merge Firestore user data
  const fetchUserData = useCallback(
    async (authUser: User): Promise<AppUser> => {
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
          } as AppUser;
        } else {
          // If no Firestore doc exists, return auth user with defaults
          return {
            ...authUser,
            subscription: "free",
            theme: theme,
            pushNotifications: true,
          } as AppUser;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Return auth user with defaults on error
        return {
          ...authUser,
          subscription: "free",
          theme,
          pushNotifications: true,
        } as AppUser;
      }
    },
    [theme]
  ); // Only recreate if theme changes

  // Function to refresh user data from Firestore
  const refreshUser = async () => {
    if (auth.currentUser) {
      const updatedUser = await fetchUserData(auth.currentUser);
      setUser(updatedUser);
      setTheme(updatedUser.theme || "system");
    }
  };

  useEffect(() => {
    let userDocUnsubscribe: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // Fetch and merge Firestore data
        const appUser = await fetchUserData(authUser);
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

    return () => {
      unsubscribe();
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
      }
    };
  }, [fetchUserData, setTheme]);

  const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
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

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
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
            theme: theme,
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

  const logout = async () => {
    return signOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
