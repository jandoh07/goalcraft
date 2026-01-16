"use client";

import GoalForm from "./goal-form/goal-form";
import AIGoalChat from "./ai-chat/ai-goal-chat";
import type useGoalsForm from "@/hooks/use-goals-form";

export type DialogMode = "ai" | "form";

interface GoalDialogContentProps {
  setOpen: (open: boolean) => void;
  goalForm: ReturnType<typeof useGoalsForm>;
  isEditMode: boolean;
  onModeChange?: (mode: DialogMode) => void;
}

const GoalDialogContent = ({
  setOpen,
  goalForm,
  isEditMode,
}: GoalDialogContentProps) => {
  // In edit mode, show the form
  if (isEditMode) {
    return <GoalForm setOpen={setOpen} goalForm={goalForm} />;
  }

  // Otherwise, show the AI chat
  return (
    <div className="flex flex-col min-h-[75vh] md:min-h-full">
      <AIGoalChat />
    </div>
  );
};

export default GoalDialogContent;
