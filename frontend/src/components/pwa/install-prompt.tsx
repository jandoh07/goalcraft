"use client";

import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";
import { Button } from "../ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error - iOS Safari specific
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Detect iOS
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
    setIsIOS(iOS);

    // Check if user dismissed the prompt before
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const daysSinceDismissed =
      (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show again after 7 days
    if (dismissed && daysSinceDismissed < 7) {
      return;
    }

    // For iOS, show custom instructions after a delay
    if (iOS && !standalone) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // For Android/Desktop Chrome, capture the beforeinstallprompt event
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show after a short delay for better UX
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  // Don't show if already installed or no prompt available (and not iOS)
  if (isStandalone || !showPrompt) {
    return null;
  }

  // iOS-specific instructions (Safari doesn't support beforeinstallprompt)
  if (isIOS) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-300">
        <div className="bg-primary text-primary-foreground px-4 py-3 shadow-lg">
          <div className="flex items-start gap-3 max-w-lg mx-auto">
            <div className="shrink-0 mt-0.5">
              <Share className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Install GoalCraft</p>
              <p className="text-xs opacity-90 mt-0.5">
                Tap <Share className="inline h-3 w-3 mx-0.5" /> then &quot;Add
                to Home Screen&quot;
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="shrink-0 p-1 hover:bg-primary-foreground/10 rounded"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Android/Desktop Chrome prompt
  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-300">
      <div className="bg-primary text-primary-foreground px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="shrink-0">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">Install GoalCraft</p>
            <p className="text-xs opacity-90">
              Add to your home screen for quick access
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleInstall}
              className="h-8 text-xs"
            >
              Install
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-primary-foreground/10 rounded"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
