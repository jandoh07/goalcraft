export let deferredPrompt: BeforeInstallPromptEvent | null = null;
export const setDeferredPrompt = (e: BeforeInstallPromptEvent | null) => {
  deferredPrompt = e;
};

export function useInstallPWA() {
  const isInstallable = deferredPrompt !== null;

  const installPWA = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  return { isInstallable, installPWA };
}
