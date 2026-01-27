import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
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

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

if (typeof window !== "undefined") {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN =
    process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN;

  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "",
    ),
    isTokenAutoRefreshEnabled: true,
  });
}

const ai = getAI(app, { backend: new GoogleAIBackend() });
export const flashModel = getGenerativeModel(ai, { model: "gemini-2.5-flash" });
export const flashLiteModel = getGenerativeModel(ai, {
  model: "gemini-2.5-flash-lite",
});

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const functions = getFunctions(app);

if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

export default app;
