"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GoalCard from "@/components/goals/goal-card";
import GoalsHeader from "@/components/goals/goals-header";
import MobileHeader from "@/components/layout/mobile/header";
import AddButton from "@/components/ui/add-button";
import ResponsiveDialog from "@/components/ui/responsive-dialog";
import GoalDialogContent, {
  type DialogMode,
} from "@/components/goals/goal-dialog-content";
import { Spinner } from "@/components/ui/spinner";
import { useGoals } from "@/hooks/use-goals";
import { useAuth } from "@/contexts/auth-context";
import { Goal } from "@/types";
import useGoalsForm from "@/hooks/use-goals-form";

const GoalsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const modeParam = searchParams.get("mode") as "add" | "edit" | null;
  const open = modeParam === "add" || modeParam === "edit";

  const updateURL = useCallback(
    (newMode: string | null) => {
      if (newMode === null) {
        router.push("?", { scroll: false });
        return;
      }
      const newParams = new URLSearchParams();
      newParams.set("mode", newMode);
      router.push(`?${newParams.toString()}`, { scroll: false });
    },
    [router]
  );

  const setOpen = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        updateURL(null);
      }
    },
    [updateURL]
  );

  const { user, loading: authLoading } = useAuth();
  const [goalFilter, setGoalFilter] = useState<
    "all" | "in-progress" | "completed" | "overdue"
  >("in-progress");
  const { data: goals, isLoading } = useGoals(user?.uid || "", goalFilter);
  const [initialData, setInitialData] = useState<Goal | undefined>(undefined);
  const [dialogMode, setDialogMode] = useState<DialogMode>("ai");
  const goalsForm = useGoalsForm({
    initialData,
    setInitialData,
    mode: initialData ? "edit" : "add",
    setOpen,
  });

  const handleAddNew = () => {
    setInitialData(undefined);
    setDialogMode("ai");
    goalsForm.form.reset();
    updateURL("add");
  };

  const handleEditGoal = (goal: Goal) => {
    setInitialData(goal);
    updateURL("edit");
  };

  const isFullyLoaded = !authLoading && !isLoading;

  const getEmptyStateMessage = () => {
    switch (goalFilter) {
      case "all":
        return "You have no goals yet. Click the + button to add your first goal!";
      case "in-progress":
        return "No goals in progress. Start a new goal to get going!";
      case "completed":
        return "No completed goals yet. Keep working towards your active goals!";
      case "overdue":
        return "No overdue goals. Great job staying on track!";
      default:
        return "You have no goals yet. Click the + button to add your first goal!";
    }
  };

  return (
    <div className="max-w-7xl h-full mx-auto p-3 relative flex flex-col">
      <MobileHeader title="Your Goals" />

      {!isFullyLoaded ? (
        <div className="flex-1 flex justify-center items-center">
          <Spinner className="size-8 text-primary" />
        </div>
      ) : (
        <>
          <GoalsHeader setGoalFilter={setGoalFilter} goalFilter={goalFilter} />
          <div className={`pb-50 md:pb-5`}>
            {isLoading ? (
              <div className="flex justify-center items-center w-full h-32">
                <Spinner />
              </div>
            ) : goals && goals.length > 0 ? (
              goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onEdit={handleEditGoal} />
              ))
            ) : (
              <p className="text-center text-muted-foreground mt-20">
                {getEmptyStateMessage()}
              </p>
            )}
          </div>
          <AddButton onClick={handleAddNew} />
          <ResponsiveDialog
            open={open}
            setOpen={setOpen}
            title={initialData ? "Edit Goal" : "Add New Goal"}
            description={
              initialData
                ? "Update the details of your goal."
                : "Fill out the form to create a new goal."
            }
            submitLabel={initialData ? "Update Goal" : "Add Goal"}
            onSubmit={goalsForm.handleExternalFormSubmit}
            isSubmitting={goalsForm.mutation.isPending}
            hideSubmitButton={!initialData && dialogMode === "ai"}
            size={!initialData && dialogMode === "ai" ? "xl" : "default"}
          >
            <GoalDialogContent
              setOpen={setOpen}
              goalForm={goalsForm}
              isEditMode={!!initialData}
              onModeChange={setDialogMode}
            />
          </ResponsiveDialog>
        </>
      )}
    </div>
  );
};

const Goals = () => {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex justify-center items-center h-full">
          <Spinner className="size-8 text-primary" />
        </div>
      }
    >
      <GoalsContent />
    </Suspense>
  );
};

export default Goals;
