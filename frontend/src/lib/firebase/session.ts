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
      credentials: "same-origin",
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
 * Update the user data cookie with new values
 * Call this when user preferences change (e.g., theme)
 * @param updates - Partial user data to update
 */
export async function updateUserDataCookie(updates: {
  theme?: string;
  name?: string;
  subscription?: string;
}): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/user-data", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
      credentials: "same-origin",
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to update user data cookie:", error);
    return false;
  }
}

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
