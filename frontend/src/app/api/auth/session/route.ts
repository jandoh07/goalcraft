import { NextRequest, NextResponse } from "next/server";
import {
  createSessionCookie,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE,
} from "@/lib/firebase/admin";

/**
 * POST /api/auth/session
 * Creates a session cookie from a Firebase ID token
 * Called after client-side authentication (sign in/sign up)
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    // Create session cookie using Firebase Admin SDK
    const sessionCookie = await createSessionCookie(idToken);

    // Create response with session cookie
    const response = NextResponse.json({ success: true });

    // Set the session cookie
    // httpOnly: prevents JavaScript access (XSS protection)
    // secure: only sent over HTTPS in production
    // sameSite: lax allows cookie to be sent on navigation
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_COOKIE_MAX_AGE / 1000, // Convert to seconds
      path: "/",
    });

    console.log("Session cookie created successfully");
    return response;
  } catch (error) {
    console.error("Error creating session:", error);
    // Return more detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create session", details: errorMessage },
      { status: 401 }
    );
  }
}

/**
 * DELETE /api/auth/session
 * Clears the session cookie (logout)
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });

  // Clear the session cookie by setting it to empty with immediate expiry
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
