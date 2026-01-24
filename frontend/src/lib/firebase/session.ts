/**
 * Client-side session management utilities
 * These functions sync the Firebase client-side auth state with server-side session cookies
 */

/**
 * Create a server session after successful authentication
 * Call this after signIn, signUp, or signInWithGoogle
 * @param idToken - Firebase ID token from getIdToken()
 */
export async function createSession(idToken: string): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
      credentials: "same-origin", // Ensure cookies are included
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Session creation failed:", response.status, errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to create session:", error);
    return false;
  }
}

/**
 * Clear the server session on logout
 * Call this before or after signOut
 */
export async function clearSession(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/session", {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to clear session:", error);
    return false;
  }
}

/**
 * Verify the current session is valid
 * Useful for checking if the session is still active
 */
export async function verifySession(): Promise<{
  authenticated: boolean;
  uid?: string;
  email?: string;
}> {
  try {
    const response = await fetch("/api/auth/verify");
    return await response.json();
  } catch (error) {
    console.error("Failed to verify session:", error);
    return { authenticated: false };
  }
}
