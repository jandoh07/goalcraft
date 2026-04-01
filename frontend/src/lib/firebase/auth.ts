import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { AppUser } from "@/types";
import { USER_DATA_COOKIE_NAME } from "./cookies";
import { clearSession, createSession, updateUserDataCookie } from "./session";
import Cookies from "js-cookie";

function getCookieTheme(): string | null {
  const rawCookie = Cookies.get(USER_DATA_COOKIE_NAME);

  if (!rawCookie) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawCookie) as { theme?: string };
    return parsed.theme ?? null;
  } catch {
    return null;
  }
}

function toAppUser(
  authUser: User,
  options: {
    name?: string;
    subscription?: "free" | "premium";
    createdAt?: Date;
    theme?: "dark" | "light" | "system";
    pushNotifications?: boolean;
    customCategories?: string[];
    timezone?: string;
    notificationTime?: number;
  },
  fallbackTheme: string,
): AppUser {
  const appUser = authUser as AppUser;

  appUser.name = options.name ?? authUser.displayName ?? undefined;
  appUser.subscription = options.subscription ?? "free";
  appUser.createdAt = options.createdAt;
  appUser.theme =
    options.theme ?? (fallbackTheme as "dark" | "light" | "system");
  appUser.pushNotifications = options.pushNotifications ?? false;
  appUser.customCategories = options.customCategories ?? [];
  appUser.timezone =
    options.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  appUser.notificationTime = options.notificationTime;

  return appUser;
}

export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (
  email: string,
  password: string,
  theme: string,
) => {
  return createUserWithEmailAndPassword(auth, email, password).then(
    async (userCredential) => {
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date(),
        subscription: "free",
        theme,
        pushNotifications: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      return userCredential;
    },
  );
};

export const signInWithGoogle = async (theme: string) => {
  const provider = new GoogleAuthProvider();

  return signInWithPopup(auth, provider).then(async (userCredential) => {
    const user = userCredential.user;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          createdAt: new Date(),
          photoURL: user.photoURL,
          subscription: "free",
          theme,
          pushNotifications: false,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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

export const firebaseLogout = async () => {
  return signOut(auth);
};

export const setupAuthListener = (
  setUser: (user: AppUser | null) => void,
  setTheme: (theme: string) => void,
  setLoading: (loading: boolean) => void,
  fallbackTheme: string = "system",
) => {
  let userDocUnsubscribe: (() => void) | undefined;
  let redirectTimer: ReturnType<typeof setTimeout> | undefined;

  const refreshSessionIfNeeded = async (authUser: User) => {
    const idToken = await authUser.getIdToken();

    const userData = Cookies.get(USER_DATA_COOKIE_NAME);
    if (!userData) {
      await createSession(idToken);
      return;
    }

    let sessionCreatedAt: string | undefined;
    try {
      ({ sessionCreatedAt } = JSON.parse(userData) as {
        sessionCreatedAt?: string;
      });
    } catch {
      await createSession(idToken);
      return;
    }

    if (!sessionCreatedAt) {
      await createSession(idToken);
      return;
    }

    const sessionAge = Date.now() - new Date(sessionCreatedAt).getTime();
    const maxSessionAge = 1000 * 60 * 60 * 24 * 7;

    if (sessionAge >= maxSessionAge) {
      await createSession(idToken);
    }
  };

  const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
    if (authUser) {
      try {
        refreshSessionIfNeeded(authUser);
        const userDocRef = doc(db, "users", authUser.uid);

        let userDocExists = false;
        userDocUnsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
          userDocExists = docSnapshot.exists();
          if (docSnapshot.exists()) {
            const firestoreData = docSnapshot.data();

            const updatedUser = toAppUser(
              authUser,
              {
                name: firestoreData.name || authUser.displayName || undefined,
                subscription: firestoreData.subscription || "free",
                createdAt: firestoreData.createdAt?.toDate(),
                theme: firestoreData.theme || "system",
                pushNotifications: firestoreData.pushNotifications ?? false,
                customCategories: firestoreData.customCategories || [],
                timezone:
                  firestoreData.timezone ||
                  Intl.DateTimeFormat().resolvedOptions().timeZone,
                notificationTime: firestoreData.notificationTime,
              },
              fallbackTheme,
            );

            setUser(updatedUser);

            if (firestoreData.theme) {
              setTheme(firestoreData.theme);

              const cookieTheme = getCookieTheme();
              if (cookieTheme !== firestoreData.theme) {
                void updateUserDataCookie({ theme: firestoreData.theme });
              }
            }
          }
        });

        if (!userDocExists) {
          const userData = JSON.parse(
            Cookies.get(USER_DATA_COOKIE_NAME) || "{}",
          );

          console.log("No user document found, creating with cookie data:", {
            userId: authUser.uid,
            cookieData: userData,
          });
          setDoc(
            userDocRef,
            {
              name: authUser.displayName,
              email: authUser.email,
              modifiedAt: new Date(),
              subscription: userData.subscription || "free",
              theme: userData.theme || fallbackTheme,
              pushNotifications: userData.pushNotifications ?? false,
              timezone:
                userData.timezone ||
                Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            { merge: true },
          ).catch((error) => {
            console.error(
              "Error creating user document on auth state change:",
              error,
            );
          });
        }
      } catch (error) {
        console.error("Firestore user sync failed:", error);
        setUser(null);
      }
    } else {
      console.log("User is not authenticated");
      setUser(null);
      if (userDocUnsubscribe) userDocUnsubscribe();

      redirectTimer = setTimeout(() => {
        const redirectPaths = ["/today", "/goals", "/settings", "/inbox"];
        if (redirectPaths.includes(window.location.pathname)) {
          clearSession().then(() => {
            window.location.href = "/login";
          });
        }
      }, 5000);
    }
    setLoading(false);
  });

  return () => {
    unsubscribe();
    if (userDocUnsubscribe) userDocUnsubscribe();
    if (redirectTimer) clearTimeout(redirectTimer);
  };
};
