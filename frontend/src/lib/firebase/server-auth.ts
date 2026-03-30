import { cookies } from "next/headers";
import {
  verifySessionCookie,
  SESSION_COOKIE_NAME,
  USER_DATA_COOKIE_NAME,
} from "./admin";

export interface ServerUser {
  uid: string;
  email: string | undefined;
  name?: string;
  theme?: string;
  subscription?: string;
  sessionCreatedAt?: Date;
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

    const userDataCookie = cookieStore.get(USER_DATA_COOKIE_NAME)?.value;
    if (userDataCookie) {
      try {
        const userData = JSON.parse(userDataCookie) as ServerUser;

        if (userData.uid === decodedClaims.uid) {
          return userData;
        }
      } catch {
        // Silently fail and return minimal data below
      }
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
