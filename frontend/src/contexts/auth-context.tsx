"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserCredential } from "firebase/auth";
import { useTheme } from "next-themes";
import { AppUser } from "@/types/user";
import {
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  signInWithGoogle as firebaseSignInWithGoogle,
  firebaseLogout,
  setupAuthListener,
  subscribeToUserDocument,
} from "@/lib/firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { createSession, clearSession } from "@/lib/firebase/session";

export interface InitialUser {
  uid: string;
  email: string | undefined;
  name?: string;
  theme?: string;
  subscription?: string;
  sessionCreatedAt?: Date;
}

interface AuthContextType {
  user: AppUser | null;
  authUser: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
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
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const authUid = authUser?.uid ?? null;

  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  const themeRef = React.useRef(theme || "system");
  useEffect(() => {
    themeRef.current = theme || "system";
  }, [theme]);

  useEffect(() => {
    const unsubscribe = setupAuthListener(
      (authUser) => setAuthUser(authUser),
      (isLoading) => setLoading(isLoading),
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const currentAuthUser = auth.currentUser;
    if (!authUid || !currentAuthUser || currentAuthUser.uid !== authUid) {
      return;
    }

    const unsubscribe = subscribeToUserDocument(
      currentAuthUser,
      setUser,
      setTheme,
      themeRef.current,
    );

    return unsubscribe;
  }, [authUid, setTheme]);

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
    setUser(null);
    setAuthUser(null);
    await clearSession();
    return firebaseLogout();
  };

  const value = {
    user,
    authUser,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
