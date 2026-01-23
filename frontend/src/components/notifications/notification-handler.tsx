"use client";

import { useEffect } from "react";
import { getMessaging, onMessage } from "firebase/messaging";
import { toast } from "sonner";

export function NotificationHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    console.log({
      ianaName: Intl.DateTimeFormat().resolvedOptions().timeZone,
      offsetMinutes: new Date().getTimezoneOffset(),
      localTime: new Date().toString(),
      isoTime: new Date().toISOString(),
    });

    const messaging = getMessaging();

    const unsubscribe = onMessage(messaging, (payload) => {
      const title = payload.notification?.title || "GoalCraft";
      const body = payload.notification?.body || "";
      const url = payload.data?.url || "/";

      toast(title, {
        description: body,
        action:
          url !== "/"
            ? {
                label: "View",
                onClick: () => (window.location.href = url),
              }
            : undefined,
      });
    });

    return () => unsubscribe();
  }, []);

  return null;
}
