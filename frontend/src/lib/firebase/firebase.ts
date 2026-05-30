import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  clearIndexedDbPersistence,
} from "firebase/firestore";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "firebase/app-check";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const existingApps = getApps();
const app =
  existingApps.length === 0 ? initializeApp(firebaseConfig) : existingApps[0];

if (typeof window !== "undefined") {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN =
    process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN;

  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "",
      ),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (e) {
    console.error("[AppCheck] Failed to initialize:", e);
  }
}

export const auth = getAuth(app);

const initializeDb = () => {
  try {
    return initializeFirestore(app, {
      ...(typeof window !== "undefined" && {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      }),
    });
  } catch (error) {
    console.error(
      "Firestore persistence failed to initialize, falling back to network-only:",
      error,
    );

    const fallbackDb = initializeFirestore(app, {});

    if (typeof window !== "undefined") {
      void clearIndexedDbPersistence(fallbackDb)
        .then(() =>
          console.log(
            "Successfully cleared corrupted IndexedDB persistence. Please refresh the page.",
          ),
        )
        .catch((err) =>
          console.error("Failed to clear corrupted IndexedDB:", err),
        );
    }

    return fallbackDb;
  }
};

export const db = initializeDb();

export const functions = getFunctions(app);

if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

export default app;
