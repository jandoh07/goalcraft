export {};

declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: string;
  }

  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  }
}
