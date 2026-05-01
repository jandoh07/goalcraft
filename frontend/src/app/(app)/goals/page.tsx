"use client";

import { Suspense } from "react";
import MobileHeader from "@/components/layout/mobile/header";
import GoalModeDialog from "@/components/goals/goal-mode-dialog";
import OpenGoalDialogButton from "@/components/goals/open-goal-dialog-button";
import { GoalProvider } from "@/contexts/goal-context";
import GoalCard from "@/components/goals/goal-card";
import { useGetGoals } from "@/hooks/use-goals";
import { Loader2 } from "lucide-react";

const GoalsFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const Goals = () => {
  const { data: goals, isLoading, error } = useGetGoals();

  return (
    <Suspense fallback={<GoalsFallback />}>
      <GoalProvider>
        <div>
          <div className="max-w-7xl h-full mx-auto p-2 md:p-3 relative flex flex-col">
            <div>
              <p className="hidden md:block text-lg font-semibold mb-5">
                Goals
              </p>
              <MobileHeader title="Goals" />
            </div>

            <div className="space-y-2">
              {isLoading && (
                <div className="flex-1 flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive">
                  Failed to load goals. Please try again.
                </p>
              )}

              {!isLoading && !error && goals?.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No goals yet. Create your first goal to get started.
                </p>
              )}

              {!isLoading &&
                !error &&
                goals?.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goalId={goal.id}
                    title={goal.title}
                    dueDate={goal.dueDate}
                    progress={goal.progress}
                  />
                ))}
            </div>
          </div>
          <OpenGoalDialogButton />
          <GoalModeDialog goals={goals ?? []} />
        </div>
      </GoalProvider>
    </Suspense>
  );
};

export default Goals;
