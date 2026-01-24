import { NextRequest, NextResponse } from "next/server";
import {
  verifySessionCookie,
  SESSION_COOKIE_NAME,
} from "@/lib/firebase/admin";

/**
 * GET /api/auth/verify
 * Verifies the current session cookie and returns user info
 * Useful for client-side session validation
 */
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { authenticated: false, error: "No session cookie" },
        { status: 401 }
      );
    }

    const decodedClaims = await verifySessionCookie(sessionCookie);

    if (!decodedClaims) {
      return NextResponse.json(
        { authenticated: false, error: "Invalid session" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      uid: decodedClaims.uid,
      email: decodedClaims.email,
    });
  } catch (error) {
    console.error("Error verifying session:", error);
    return NextResponse.json(
      { authenticated: false, error: "Verification failed" },
      { status: 401 }
    );
  }
}
