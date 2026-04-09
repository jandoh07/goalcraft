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

function isBrowserOffline(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return navigator.onLine === false;
}

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
  const appUser = Object.assign(
    Object.create(Object.getPrototypeOf(authUser)),
    authUser,
    {
      name: options.name ?? authUser.displayName ?? undefined,
      subscription: options.subscription ?? "free",
      createdAt: options.createdAt,
      theme: options.theme ?? (fallbackTheme as "dark" | "light" | "system"),
      pushNotifications: options.pushNotifications ?? false,
      customCategories: options.customCategories ?? [],
      timezone:
        options.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      notificationTime: options.notificationTime,
    },
  ) as AppUser;

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

let globalLastKnownUid: string | null = null;

export const resetGlobalAuthTracker = () => {
  globalLastKnownUid = null;
};

export const setupAuthListener = (
  setUser: (user: AppUser | null) => void,
  setTheme: (theme: string) => void,
  setLoading: (loading: boolean) => void,
  fallbackTheme: string = "system",
  initialServerUid?: string,
) => {
  let userDocUnsubscribe: (() => void) | undefined;
  let pendingLogoutTimeout: ReturnType<typeof setTimeout> | undefined;

  if (initialServerUid && !globalLastKnownUid) {
    globalLastKnownUid = initialServerUid;
  }

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
      if (pendingLogoutTimeout) {
        clearTimeout(pendingLogoutTimeout);
        pendingLogoutTimeout = undefined;
      }

      globalLastKnownUid = authUser.uid;

      try {
        refreshSessionIfNeeded(authUser);
        const userDocRef = doc(db, "users", authUser.uid);

        userDocUnsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const firestoreData = docSnapshot.data();
            console.log("User document exists");

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
            setLoading(false);
          } else {
            if (docSnapshot.metadata.fromCache) {
              console.log(
                "Ignoring cached missing user document, waiting for server",
              );
              return;
            }

            console.log(
              "No user document found on server, creating default profile",
            );

            void setDoc(
              userDocRef,
              {
                name: authUser.displayName,
                email: authUser.email,
                createdAt: new Date(),
                theme: fallbackTheme,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
              { merge: true },
            ).catch((error) => {
              console.error("Failed to create missing user document:", error);
            });

            setUser(toAppUser(authUser, {}, fallbackTheme));
            setLoading(false);
          }
        });
      } catch (error) {
        console.error("Firestore user sync failed:", error);
        setUser(null);
        setLoading(false);
      }
    } else {
      if (isBrowserOffline()) {
        console.log("Auth state is null while offline, skipping logout flow");
        setLoading(false);
        return;
      }

      if (globalLastKnownUid) {
        if (pendingLogoutTimeout) {
          clearTimeout(pendingLogoutTimeout);
        }

        pendingLogoutTimeout = setTimeout(() => {
          pendingLogoutTimeout = undefined;

          if (isBrowserOffline()) {
            return;
          }

          if (auth.currentUser) {
            return;
          }

          console.log("User is not authenticated after recovery window");
          globalLastKnownUid = null;
          setUser(null);
          void clearSession();
          if (userDocUnsubscribe) userDocUnsubscribe();
          setLoading(false);
        }, 1500);

        return;
      }

      console.log("User is not authenticated");
      setUser(null);
      void clearSession();
      if (userDocUnsubscribe) userDocUnsubscribe();
      setLoading(false);
    }
  });

  return () => {
    if (pendingLogoutTimeout) {
      clearTimeout(pendingLogoutTimeout);
    }

    unsubscribe();
    if (userDocUnsubscribe) userDocUnsubscribe();
  };
};
