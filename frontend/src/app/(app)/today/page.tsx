"use client";

import MobileHeader from "@/components/layout/mobile/header";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { NonNegotiableCard } from "@/components/today/non-negotiable-card";

const TodayContent = () => {
  return (
    <div className="max-w-7xl h-full mx-auto p-3 relative flex flex-col">
      <div className="md:flex items-center justify-between mb-3">
        <div>
          <p className="hidden md:block text-lg font-semibold">Today</p>
          <MobileHeader title="Today" />
        </div>
      </div>

      <div className="flex-1 mb-13 md:mb-5 overflow-auto">
        <NonNegotiableCard
          nonNegotiable={{
            id: "1",
            title: "Non-negotiable title 1",
            totalDuration: 60,
            tasks: [
              {
                id: "1",
                title: "Non-negotiable task 1",
                duration: 30,
                completed: false,
              },
              {
                id: "2",
                title: "Non-negotiable task 2",
                duration: 30,
                completed: true,
              },
            ],
          }}
          onToggleTask={() => {}}
          onDeleteTask={() => {}}
          onAddTask={() => {}}
        />
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
