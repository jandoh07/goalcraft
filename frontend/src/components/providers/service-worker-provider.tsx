"use client";

import { useEffect } from "react";
import { SW_VERSION } from "./sw-version";
import { Workbox } from "workbox-window";
import { toast } from "sonner";

export function ServiceWorkerProvider() {
  useEffect(() => {
    if (
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }

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

    wb.register();
  }, []);

  return null;
}
