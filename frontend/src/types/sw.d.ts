/// <reference lib="webworker" />

import { MessagePayload } from "firebase/messaging/sw";

declare const self: ServiceWorkerGlobalScope;

declare global {
  const firebase: {
    initializeApp(config): void;
    messaging(): {
      onBackgroundMessage(callback: (payload: MessagePayload) => void): void;
    };
  };

  function importScripts(...urls: string[]): void;
}

export {};
