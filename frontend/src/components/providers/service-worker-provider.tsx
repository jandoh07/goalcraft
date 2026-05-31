"use client";

import { useEffect } from "react";
import { SW_VERSION } from "./sw-version";
import { Workbox } from "workbox-window";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

export function ServiceWorkerProvider() {
  const pathname = usePathname();

  const isAppRoute =
    pathname.startsWith("/goals") ||
    pathname.startsWith("/today") ||
    pathname.startsWith("/review") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/brain-dump");

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      const wb = new Workbox(`/sw.js?v=${SW_VERSION}`, {
        updateViaCache: "none",
      });

      wb.addEventListener("waiting", () => {
        toast("A new version is available!", {
          action: {
            label: "Update",
            onClick: () => {
              wb.messageSkipWaiting();
              wb.addEventListener("controlling", () => {
                window.location.reload();
              });
            },
          },
          duration: Infinity,
        });
      });

      wb.register().catch(console.error);
    }

    let deferredPrompt: BeforeInstallPromptEvent | null = null;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;

      if (isAppRoute && !localStorage.getItem("pwa-prompt-dismissed")) {
        toast("Install GoalCraft", {
          description: "Install our web app for a better experience.",
          action: {
            label: "Install",
            onClick: async () => {
              if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;

                if (outcome === "accepted") {
                  console.log("User accepted the install prompt");
                }
                deferredPrompt = null;
              }
            },
          },
          cancel: {
            label: "Dismiss",
            onClick: () => {
              localStorage.setItem("pwa-prompt-dismissed", "true");
            },
          },
          position: "top-center",
          duration: 15000,
        });

        localStorage.setItem("pwa-prompt-dismissed", "true");
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const isIos = /iphone|ipad|ipod/.test(
      window.navigator.userAgent.toLowerCase(),
    );
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error - Apple specific property
      window.navigator.standalone === true;

    if (
      isIos &&
      !isStandalone &&
      !localStorage.getItem("ios-pwa-prompt-dismissed") &&
      isAppRoute
    ) {
      toast("Install GoalCraft web app on your iPhone", {
        description:
          "Tap the Share icon below and select 'Add to Home Screen'.",
        cancel: {
          label: "Dismiss",
          onClick: () => {
            localStorage.setItem("ios-pwa-prompt-dismissed", "true");
          },
        },
        duration: 15000,
      });

      localStorage.setItem("ios-pwa-prompt-dismissed", "true");
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, [isAppRoute]);

  return null;
}
