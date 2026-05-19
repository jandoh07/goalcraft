"use client";

import MobileHeader from "@/components/layout/mobile/header";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { NonNegotiableCard } from "@/components/today/non-negotiable-card";
import { NonNegotiableModeDialog } from "@/components/today/non-negotiable-mode-dialog";
import { useGetInProgressNonNegotiablesWithTasks } from "@/hooks/use-today-non-negotiables";

const TodayContent = () => {
  const { data, isLoading, error } = useGetInProgressNonNegotiablesWithTasks();

  return (
    <div className="max-w-7xl h-full mx-auto p-3 relative flex flex-col">
      <div className="md:flex items-center justify-between mb-3">
        <div>
          <p className="hidden md:block text-lg font-semibold">Today</p>
          <MobileHeader title="Today" />
        </div>
      </div>

      <div className="flex-1 mb-13 md:mb-5 overflow-auto space-y-3">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">
            Failed to load your non-negotiables.
          </p>
        ) : data && data.length > 0 ? (
          data.map((item) => (
            <NonNegotiableCard key={item.nonNegotiable.id} data={item} />
          ))
        ) : (
          <div className="max-w-3xl h-120 mx-auto flex items-center justify-center">
            <p className="text-muted-foreground text-center">
              No in-progress non-negotiables found. You can can create
              non-negotiables when creating goals, which will then show up here
              depending on their recurrence.
            </p>
          </div>
        )}
      </div>

      <NonNegotiableModeDialog items={data ?? []} />
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
