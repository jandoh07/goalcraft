import { NextRequest, NextResponse } from "next/server";
import {
  createSessionCookie,
  SESSION_COOKIE_NAME,
  USER_DATA_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE,
  getAdminAuth,
  getAdminDb,
} from "@/lib/firebase/admin";

interface UserDataCookie {
  uid: string;
  email?: string;
  name?: string;
  theme?: string;
  subscription?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 },
      );
    }

    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    const sessionCookie = await createSessionCookie(idToken);

    let userData: UserDataCookie = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    try {
      const db = getAdminDb();
      const userDoc = await db.collection("users").doc(decodedToken.uid).get();

      if (userDoc.exists) {
        const firestoreData = userDoc.data();
        userData = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: firestoreData?.name,
          theme: firestoreData?.theme ?? "system",
          subscription: firestoreData?.subscription ?? "free",
        };
      }
    } catch (firestoreError) {
      console.error("Error fetching user data for cookie:", firestoreError);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_COOKIE_MAX_AGE / 1000,
      path: "/",
    });

    response.cookies.set(USER_DATA_COOKIE_NAME, JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_COOKIE_MAX_AGE / 1000,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error creating session:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create session", details: errorMessage },
      { status: 401 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  response.cookies.set(USER_DATA_COOKIE_NAME, "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
