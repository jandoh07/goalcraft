import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  USER_DATA_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE,
  verifySessionCookie,
} from "@/lib/firebase/admin";

interface UserDataCookie {
  uid: string;
  email?: string;
  name?: string;
  theme?: string;
  subscription?: string;
  sessionCreatedAt: Date;
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedClaims = await verifySessionCookie(sessionCookie);

    if (!decodedClaims) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const updates = await request.json();

    const existingCookie = request.cookies.get(USER_DATA_COOKIE_NAME)?.value;
    let userData: UserDataCookie = {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      sessionCreatedAt: new Date(),
    };

    if (existingCookie) {
      try {
        userData = JSON.parse(existingCookie);
      } catch {
        // Use default if parsing fails
      }
    }

    const updatedUserData: UserDataCookie = {
      ...userData,
      ...updates,
      uid: decodedClaims.uid,
    };

    const response = NextResponse.json({ success: true });

    response.cookies.set(
      USER_DATA_COOKIE_NAME,
      JSON.stringify(updatedUserData),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_COOKIE_MAX_AGE / 1000,
        path: "/",
      },
    );

    return response;
  } catch (error) {
    console.error("Error updating user data cookie:", error);
    return NextResponse.json(
      { error: "Failed to update user data" },
      { status: 500 },
    );
  }
}
