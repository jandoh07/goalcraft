"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { verifySession } from "@/lib/firebase/session";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (loading || authUser || !isOnline) {
      return;
    }

    let cancelled = false;

    const redirectIfSessionInvalid = async () => {
      const { authenticated } = await verifySession();

      if (!cancelled && !authenticated) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    };

    void redirectIfSessionInvalid();

    return () => {
      cancelled = true;
    };
  }, [isOnline, loading, authUser, pathname, router]);

  return <>{children}</>;
};

export default ProtectedRoute;
