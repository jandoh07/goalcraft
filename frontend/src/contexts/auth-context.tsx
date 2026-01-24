"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserCredential } from "firebase/auth";
import { useTheme } from "next-themes";
import { AppUser } from "@/types";
import {
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  signInWithGoogle as firebaseSignInWithGoogle,
  logout as firebaseLogout,
  setupAuthListener,
  fetchUserData,
} from "@/lib/firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { createSession, clearSession } from "@/lib/firebase/session";

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

  const refreshUser = async () => {
    if (auth.currentUser) {
      const updatedUser = await fetchUserData(auth.currentUser, theme);
      setUser(updatedUser);
      setTheme(updatedUser.theme || "system");
    }
  };

  useEffect(() => {
    const cleanup = setupAuthListener(
      async (authUser) => {
        if (authUser) {
          setUser(authUser);
        } else {
          setUser(null);
        }
      },
      setTheme,
      setLoading,
      theme
    );
    return cleanup;
  }, [theme, setTheme]);

  // Wrapper functions that use the current theme and sync sessions
  const signIn = async (email: string, password: string) => {
    const credential = await firebaseSignIn(email, password);
    // Sync session cookie after successful sign in
    const idToken = await credential.user.getIdToken();
    const sessionCreated = await createSession(idToken);
    if (!sessionCreated) {
      console.error("Failed to create session cookie");
    }
    return credential;
  };

  const signUp = async (email: string, password: string) => {
    const credential = await firebaseSignUp(email, password, theme || "system");
    // Sync session cookie after successful sign up
    const idToken = await credential.user.getIdToken();
    const sessionCreated = await createSession(idToken);
    if (!sessionCreated) {
      console.error("Failed to create session cookie");
    }
    return credential;
  };

  const signInWithGoogle = async () => {
    const credential = await firebaseSignInWithGoogle(theme || "system");
    // Sync session cookie after successful Google sign in
    const idToken = await credential.user.getIdToken();
    const sessionCreated = await createSession(idToken);
    if (!sessionCreated) {
      console.error("Failed to create session cookie");
    }
    return credential;
  };

  const logout = async () => {
    // Clear server session first, then sign out from Firebase
    await clearSession();
    return firebaseLogout();
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
