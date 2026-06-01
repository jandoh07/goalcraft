"use client";

import { Download } from "lucide-react";
import { useInstallPWA } from "@/hooks/use-install-pwa";

const InstallPwaButton = () => {
  const { isInstallable, installPWA } = useInstallPWA();

  if (!isInstallable) {
    return null;
  }

  return (
    <div
      className="w-full flex justify-between items-center bg-card p-2 rounded-lg cursor-pointer hover:bg-card/50"
      onClick={installPWA}
    >
      <div className="flex items-center">
        <div className="size-10 flex items-center justify-center shrink-0">
          <Download className="size-4 text-primary" />
        </div>
        <div className="font-medium text-sm text-primary">
          Install GoalCraft Web App
        </div>
      </div>
    </div>
  );
};

export default InstallPwaButton;
