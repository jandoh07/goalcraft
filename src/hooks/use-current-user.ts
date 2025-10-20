import { useAuth, AppUser } from "@/contexts/auth-context";

/**
 * Custom hook to access current user with Firestore data
 *
 * @returns The current user with all Firestore fields, or null if not authenticated
 *
 * @example
 * ```tsx
 * const user = useCurrentUser();
 *
 * if (user) {
 *   console.log(user.name); // From Firestore
 *   console.log(user.subscription); // "free" or "premium"
 *   console.log(user.preferences); // { darkMode, pushNotifications }
 *   console.log(user.email); // From Firebase Auth
 * }
 * ```
 */
export function useCurrentUser(): AppUser | null {
  const { user } = useAuth();
  return user;
}

/**
 * Custom hook to check if user has premium subscription
 *
 * @returns true if user has premium subscription
 *
 * @example
 * ```tsx
 * const isPremium = useIsPremium();
 *
 * if (isPremium) {
 *   // Show premium features
 * }
 * ```
 */
export function useIsPremium(): boolean {
  const { user } = useAuth();
  return user?.subscription === "premium";
}

/**
 * Custom hook to check authentication status
 *
 * @returns Object with isAuthenticated and isLoading states
 *
 * @example
 * ```tsx
 * const { isAuthenticated, isLoading } = useAuthStatus();
 *
 * if (isLoading) return <Spinner />;
 * if (!isAuthenticated) return <LoginPrompt />;
 * ```
 */
export function useAuthStatus() {
  const { user, loading } = useAuth();

  return {
    isAuthenticated: !!user,
    isLoading: loading,
  };
}
