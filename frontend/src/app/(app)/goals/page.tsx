"use client";

import MobileHeader from "@/components/layout/mobile/header";
import GoalModeDialog from "@/components/goals/goal-mode-dialog";
import OpenGoalDialogButton from "@/components/goals/open-goal-dialog-button";
import { GoalProvider } from "@/contexts/goal-context";
import GoalCard from "@/components/goals/goal-card";
import { useGetGoals } from "@/hooks/use-goals";

const Goals = () => {
  const { data: goals, isLoading, error } = useGetGoals();

  return (
    <GoalProvider>
      <div>
        <div className="max-w-7xl h-full mx-auto p-2 md:p-3 relative flex flex-col">
          <div>
            <p className="hidden md:block text-lg font-semibold mb-5">Goals</p>
            <MobileHeader title="Goals" />
          </div>

          <div className="space-y-2">
            {isLoading && (
              <p className="text-sm text-muted-foreground">Loading goals...</p>
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
  );
};

export default Goals;
