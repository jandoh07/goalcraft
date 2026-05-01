"use client";

import { useEffect } from "react";
import { SW_VERSION } from "./sw-version";

// TODO: Try workbox window
export function ServiceWorkerProvider() {
  useEffect(() => {
    if (
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }

    navigator.serviceWorker
      .register(`/sw.js?v=${SW_VERSION}`, {
        updateViaCache: "none",
      })
      .catch(console.error);
  }, []);

  return null;
}
