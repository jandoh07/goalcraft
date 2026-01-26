"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { IdTokenResult, UserCredential } from "firebase/auth";
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

export interface InitialUser {
  uid: string;
  email: string | undefined;
  name?: string;
  theme?: string;
  subscription?: string;
}

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

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: InitialUser | null;
}

export const AuthProvider = ({ children, initialUser }: AuthProviderProps) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    if (initialUser) {
      return {
        uid: initialUser.uid,
        email: initialUser.email ?? null,
        displayName: initialUser.name ?? null,
        name: initialUser.name,
        subscription: initialUser.subscription ?? "free",
        theme: initialUser.theme ?? "system",
        emailVerified: false,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: "",
        tenantId: null,
        delete: async () => {},
        getIdToken: async () => "",
        getIdTokenResult: async () => ({}) as IdTokenResult,
        reload: async () => {},
        toJSON: () => ({}),
        phoneNumber: null,
        photoURL: null,
        providerId: "",
      } as AppUser;
    }
    return null;
  });

  const [loading, setLoading] = useState(!initialUser);
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
      theme,
    );
    return cleanup;
  }, [theme, setTheme]);

  const signIn = async (email: string, password: string) => {
    const credential = await firebaseSignIn(email, password);
    const idToken = await credential.user.getIdToken();
    const sessionCreated = await createSession(idToken);
    if (!sessionCreated) {
      console.error("Failed to create session cookie");
    }
    return credential;
  };

  const signUp = async (email: string, password: string) => {
    const credential = await firebaseSignUp(email, password, theme || "system");
    const idToken = await credential.user.getIdToken();
    const sessionCreated = await createSession(idToken);
    if (!sessionCreated) {
      console.error("Failed to create session cookie");
    }
    return credential;
  };

  const signInWithGoogle = async () => {
    const credential = await firebaseSignInWithGoogle(theme || "system");
    const idToken = await credential.user.getIdToken();
    const sessionCreated = await createSession(idToken);
    if (!sessionCreated) {
      console.error("Failed to create session cookie");
    }
    return credential;
  };

  const logout = async () => {
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
