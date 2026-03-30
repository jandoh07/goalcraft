import "server-only";
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App | undefined;
let adminAuth: Auth | undefined;
let adminDb: Firestore | undefined;

function getAdminApp(): App {
  if (!app) {
    const apps = getApps();
    if (apps.length > 0) {
      app = apps[0];
    } else {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        : undefined;

      app = initializeApp(
        serviceAccount
          ? {
              credential: cert(serviceAccount),
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            }
          : {
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            },
      );
    }
  }
  return app;
}

export function getAdminAuth(): Auth {
  if (!adminAuth) {
    adminAuth = getAuth(getAdminApp());
  }
  return adminAuth;
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    adminDb = getFirestore(getAdminApp());
  }
  return adminDb;
}

export { SESSION_COOKIE_NAME, USER_DATA_COOKIE_NAME } from "./cookies";
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 14 * 1000;

export async function createSessionCookie(idToken: string): Promise<string> {
  const auth = getAdminAuth();
  return auth.createSessionCookie(idToken, {
    expiresIn: SESSION_COOKIE_MAX_AGE,
  });
}

export async function verifySessionCookie(sessionCookie: string) {
  try {
    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie);
    return decodedClaims;
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}

export async function verifySessionCookieStrict(sessionCookie: string) {
  try {
    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error("Strict session verification failed:", error);
    return null;
  }
}

export async function revokeUserTokens(uid: string): Promise<void> {
  const auth = getAdminAuth();
  await auth.revokeRefreshTokens(uid);
}
