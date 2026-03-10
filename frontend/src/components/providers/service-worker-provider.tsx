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
        .catch(console.error);
    }

    if (process.env.NODE_ENV === "production") {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
    }
  }, []);

  return null;
}
