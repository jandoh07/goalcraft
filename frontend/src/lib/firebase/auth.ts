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
import { AppUser } from "@/types/user";
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

export const toAppUser = (
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
): AppUser => {
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
};

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
  setAuthUser: (user: User | null) => void,
  setLoading: (loading: boolean) => void,
) => {
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

  return onAuthStateChanged(auth, async (authUser) => {
    if (authUser) {
      console.log("User is authenticated");
      void refreshSessionIfNeeded(authUser);
      setAuthUser(authUser);
      setLoading(false);
    } else {
      console.log("User is not authenticated");
      setAuthUser(null);
      clearSession();
      setLoading(false);
    }
  });
};

export const subscribeToUserDocument = (
  authUser: User,
  setUser: (user: AppUser | null) => void,
  setTheme: (theme: string) => void,
  fallbackTheme: string,
) => {
  const userDocRef = doc(db, "users", authUser.uid);

  return onSnapshot(
    userDocRef,
    (docSnapshot) => {
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
      } else {
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
      }
    },
    (error) => {
      console.error("Firestore user snapshot error:", error);
      setUser(toAppUser(authUser, {}, fallbackTheme));
    },
  );
};
