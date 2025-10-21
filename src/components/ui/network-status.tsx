"use client";

import { useEffect, useState } from "react";
import { CloudOff, Wifi } from "lucide-react";

/**
 * Network status indicator component
 * Shows when app is offline and using cached data
 */
export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Don't show anything if online
  if (isOnline && !showOfflineMessage) return null;

  // Show "Back online" message briefly
  if (isOnline && showOfflineMessage) {
    setTimeout(() => setShowOfflineMessage(false), 3000);
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-2 text-center text-sm flex items-center justify-center gap-2 animate-in slide-in-from-top">
        <Wifi className="h-4 w-4" />
        <span>Back online! Changes synced successfully.</span>
      </div>
    );
  }

  // Show offline message
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 text-center text-sm flex items-center justify-center gap-2 animate-in slide-in-from-top">
      <CloudOff className="h-4 w-4" />
      <span>
        You&apos;re offline. Changes will sync when you&apos;re back online.
      </span>
    </div>
  );
}
