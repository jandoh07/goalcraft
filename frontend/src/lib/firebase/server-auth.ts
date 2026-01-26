import { cookies } from "next/headers";
import { verifySessionCookie, SESSION_COOKIE_NAME, getAdminDb } from "./admin";

export interface ServerUser {
  uid: string;
  email: string | undefined;
  name?: string;
  theme?: string;
  subscription?: string;
}

export async function getServerUser(): Promise<ServerUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return null;
    }

    const decodedClaims = await verifySessionCookie(sessionCookie);

    if (!decodedClaims) {
      return null;
    }

    try {
      const db = getAdminDb();
      const userDoc = await db.collection("users").doc(decodedClaims.uid).get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        return {
          uid: decodedClaims.uid,
          email: decodedClaims.email,
          name: userData?.name,
          theme: userData?.theme,
          subscription: userData?.subscription,
        };
      }
    } catch (firestoreError) {
      console.error("Error fetching user data from Firestore:", firestoreError);
    }

    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
    };
  } catch (error) {
    console.error("Error getting server user:", error);
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return false;
    }

    const decodedClaims = await verifySessionCookie(sessionCookie);
    return decodedClaims !== null;
  } catch {
    return false;
  }
}
