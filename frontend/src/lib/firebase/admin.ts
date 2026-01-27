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

export const SESSION_COOKIE_NAME = "__session";
export const USER_DATA_COOKIE_NAME = "__user_data";
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 5 * 1000;

/**
 * Create a session cookie from an ID token
 * @param idToken - Firebase ID token from client-side auth
 * @returns Session cookie string
 */
export async function createSessionCookie(idToken: string): Promise<string> {
  const auth = getAdminAuth();
  return auth.createSessionCookie(idToken, {
    expiresIn: SESSION_COOKIE_MAX_AGE,
  });
}

/**
 * Verify a session cookie and return the decoded claims
 * Uses checkRevoked: false for fast navigation performance.
 *
 * @param sessionCookie - The session cookie to verify
 * @returns Decoded token claims or null if invalid
 */
export async function verifySessionCookie(sessionCookie: string) {
  try {
    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, false);
    return decodedClaims;
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}

/**
 * Verify a session cookie with revocation check
 * Use this for sensitive operations (profile changes, subscription changes, etc.)
 *
 * @param sessionCookie - The session cookie to verify
 * @returns Decoded token claims or null if invalid/revoked
 *
 * TODO: Use this function for sensitive operations:
 * - Changing user profile (name, email)
 * - Changing subscription
 * - Changing password
 * - Deleting account
 */
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

/**
 * Revoke all refresh tokens for a user (used on logout)
 * @param uid - User ID to revoke tokens for
 */
export async function revokeUserTokens(uid: string): Promise<void> {
  const auth = getAdminAuth();
  await auth.revokeRefreshTokens(uid);
}
