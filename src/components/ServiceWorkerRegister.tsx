"use client";

import { useEffect } from "react";

/**
 * Register the service worker for PWA support.
 * Renders nothing — just registers the SW on mount.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("SW registration failed:", err));
    }
  }, []);

  return null;
}
