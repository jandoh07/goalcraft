"use client";

import { useState, useCallback, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GoalCard from "@/components/goals/goal-card";
import GoalsHeader from "@/components/goals/goals-header";
import MobileHeader from "@/components/layout/mobile/header";
import AddButton from "@/components/ui/add-button";
import ResponsiveDialog from "@/components/ui/responsive-dialog";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import GoalDialogContent, {
  type DialogMode,
} from "@/components/goals/goal-dialog-content";
import { Spinner } from "@/components/ui/spinner";
import { useGoals } from "@/hooks/use-goals";
import { useAuth } from "@/contexts/auth-context";
import { Goal } from "@/types";
import useGoalsForm from "@/hooks/use-goals-form";
import {
  useGoalCreationStore,
  hasUnsavedChanges,
  GoalCreationState,
} from "@/stores/goal-creation-store";

const GoalsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const modeParam = searchParams.get("mode") as "add" | "edit" | null;
  const open = modeParam === "add" || modeParam === "edit";

  // Goal creation store for checking unsaved changes
  const goalCreationStore = useGoalCreationStore();
  const reset = useGoalCreationStore((state) => state.reset);
  const initializeFromGoal = useGoalCreationStore(
    (state) => state.initializeFromGoal,
  );
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

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
    [router],
  );

  const handleCloseDialog = useCallback(() => {
    updateURL(null);
    reset();
  }, [updateURL, reset]);

  const setOpen = useCallback(
    (isOpen: boolean, skipUnsavedCheck?: boolean) => {
      if (!isOpen) {
        // Skip unsaved changes check if explicitly requested (e.g., after successful save)
        if (skipUnsavedCheck) {
          handleCloseDialog();
          return;
        }
        // Check for unsaved changes before closing
        if (hasUnsavedChanges(goalCreationStore as GoalCreationState)) {
          setShowDiscardDialog(true);
          return;
        }
        handleCloseDialog();
      }
    },
    [goalCreationStore, handleCloseDialog],
  );

  const handleDiscardConfirm = useCallback(() => {
    setShowDiscardDialog(false);
    handleCloseDialog();
  }, [handleCloseDialog]);

  const handleDiscardCancel = useCallback(() => {
    // User chose to continue later - close the main dialog first, then hide confirmation
    // This order prevents the flash where confirmation hides but dialog is still visible
    updateURL(null);
    // Use setTimeout to ensure state updates happen in correct order
    setTimeout(() => {
      setShowDiscardDialog(false);
    }, 0);
  }, [updateURL]);

  const { user } = useAuth();
  const [goalFilter, setGoalFilter] = useState<
    "all" | "in-progress" | "completed" | "overdue"
  >("in-progress");
  const { data: goals, isFetching } = useGoals(user?.uid || "", goalFilter);
  const [initialData, setInitialData] = useState<Goal | undefined>(undefined);
  const [dialogMode, setDialogMode] = useState<DialogMode>("ai");
  const goalsForm = useGoalsForm({
    initialData,
    setInitialData,
    mode: initialData ? "edit" : "add",
    setOpen,
  });

  const handleAddNew = () => {
    // If there's an existing draft (not from editing), resume it instead of resetting
    const hasDraft = hasUnsavedChanges(goalCreationStore as GoalCreationState);
    const isEditingDraft = goalCreationStore.editingGoalId !== null;

    if (hasDraft && !isEditingDraft) {
      // Resume the existing draft
      setInitialData(undefined);
      setDialogMode("ai");
      updateURL("add");
      return;
    }

    // No draft or it's an edit draft - start fresh
    setInitialData(undefined);
    setDialogMode("ai");
    goalsForm.form.reset();
    reset(); // Reset the AI creation store
    updateURL("add");
  };

  const handleEditGoal = (goal: Goal) => {
    // Initialize the AI goal creation store with existing goal data
    initializeFromGoal(goal);
    setInitialData(goal);
    setDialogMode("ai"); // Use AI mode for editing
    updateURL("edit");
  };

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

      {!isFetching && !goals ? (
        <div className="flex-1 flex justify-center items-center">
          <Spinner className="size-8 text-primary" />
        </div>
      ) : (
        <>
          <GoalsHeader
            setGoalFilter={setGoalFilter}
            goalFilter={goalFilter}
            isFetching={isFetching}
          />
          <div className={`pb-50 md:pb-5`}>
            {goals && goals.length > 0 ? (
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
            size={!initialData && dialogMode === "ai" ? "2xl" : "default"}
          >
            <GoalDialogContent
              setOpen={setOpen}
              goalForm={goalsForm}
              isEditMode={!!initialData}
              onModeChange={setDialogMode}
            />
          </ResponsiveDialog>

          <ConfirmationDialog
            isOpen={showDiscardDialog}
            onOpenChange={setShowDiscardDialog}
            onConfirm={handleDiscardConfirm}
            onCancel={handleDiscardCancel}
            preset="discardChanges"
          />
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
