"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * ProtectedRoute - Client-side auth guard as a fallback for edge middleware
 * 
 * Primary auth verification happens in middleware.ts at the edge.
 * This component serves as:
 * 1. A fallback for offline scenarios where middleware might not run
 * 2. A safety net for cases where the session cookie expires mid-session
 * 3. Handles the loading state while checking auth
 */
export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [offline, setOffline] = useState(false);

  // Track online/offline state after hydration to avoid mismatch
  useEffect(() => {
    setOffline(!navigator.onLine);

    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    // Only redirect if:
    // - Auth check is complete (not loading)
    // - No user is authenticated
    // - We're online (offline users should still see cached content)
    if (!loading && !user && !offline) {
      router.push("/login");
    }
  }, [user, loading, router, offline]);

  // Always render children to avoid hydration mismatch
  // The redirect will happen via useEffect if needed
  // Most auth checks are handled by middleware before this component renders
  return <>{children}</>;
}
