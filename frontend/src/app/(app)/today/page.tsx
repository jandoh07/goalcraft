"use client";

import MobileHeader from "@/components/layout/mobile/header";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { NonNegotiablesList } from "@/components/today/non-negotiables-list";

const TodayContent = () => {
  return (
    <div className="max-w-7xl h-full mx-auto p-3 relative flex flex-col">
      {/* Header */}
      <div className="md:flex items-center justify-between mb-3">
        <div>
          <p className="hidden md:block text-lg font-semibold">Today</p>
          <MobileHeader title="Today" />
        </div>
      </div>

      {/* Non-negotiables */}
      <div className="flex-1 mb-13 md:mb-5 overflow-auto">
        <NonNegotiablesList />
      </div>
    </div>
  );
};

const Today = () => {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <TodayContent />
    </Suspense>
  );
};

export default Today;
