import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// Firebase Admin SDK for server-side authentication
// Used for session cookie management and verification in middleware/API routes

let app: App | undefined;
let adminAuth: Auth | undefined;
let adminDb: Firestore | undefined;

function getAdminApp(): App {
  if (!app) {
    const apps = getApps();
    if (apps.length > 0) {
      app = apps[0];
    } else {
      // In production, use GOOGLE_APPLICATION_CREDENTIALS or explicit service account
      // For Firebase hosting/Cloud Functions, default credentials are used automatically
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
            }
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

// Session cookie configuration
export const SESSION_COOKIE_NAME = "__session";
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds

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
 * @param sessionCookie - The session cookie to verify
 * @returns Decoded token claims or null if invalid
 */
export async function verifySessionCookie(sessionCookie: string) {
  try {
    const auth = getAdminAuth();
    // checkRevoked: true ensures the session is invalidated if user signs out elsewhere
    const decodedClaims = await auth.verifySessionCookie(
      sessionCookie,
      true // Check if token is revoked
    );
    return decodedClaims;
  } catch (error) {
    console.error("Session verification failed:", error);
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
