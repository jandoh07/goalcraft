"use client";

import { useEffect } from "react";
import { getMessaging, onMessage, isSupported } from "firebase/messaging";
import { toast } from "sonner";

export function NotificationHandler() {
  useEffect(() => {
    const setupMessaging = async () => {
      const supported = await isSupported();

      if (!supported) {
        console.warn("FCM is not supported in this browser/environment.");
        return;
      }

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

      return unsubscribe;
    };

    let unsubscribeFn: (() => void) | undefined;
    setupMessaging().then((unsub) => {
      unsubscribeFn = unsub;
    });

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, []);

  return null;
}
