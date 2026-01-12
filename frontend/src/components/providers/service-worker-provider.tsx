"use client";

import { useEffect } from "react";
import { SW_VERSION } from "./sw-version";

export function ServiceWorkerProvider() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register(`/sw.js?v=${SW_VERSION}`, {
          updateViaCache: "none",
        })
        .then(() => console.log("✅ Service worker registered"))
        .catch(console.error);
    }
  }, []);

  return null;
}
