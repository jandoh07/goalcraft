"use client";

import { useAuth } from "@/contexts/auth-context";
import { verifySession } from "@/lib/firebase/session";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || user) {
      return;
    }

    let cancelled = false;

    const validateAndRedirect = async () => {
      const session = await verifySession();
      if (!cancelled && !session.authenticated) {
        const loginUrl = pathname
          ? `/login?redirect=${encodeURIComponent(pathname)}`
          : "/login";
        router.replace(loginUrl);
      }
    };

    void validateAndRedirect();

    return () => {
      cancelled = true;
    };
  }, [user, loading, router, pathname]);

  return <>{children}</>;
}
