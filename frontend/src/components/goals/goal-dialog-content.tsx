"use client";

import GoalForm from "./goal-form/goal-form";
import AIGoalChat from "./ai-chat/ai-goal-chat";
import AIGoalPhase2 from "./ai-chat/ai-goal-phase2";
import AIGoalPhase3 from "./ai-chat/ai-goal-phase3";
import AIGoalPhase4 from "./ai-chat/ai-goal-phase4";
import { useGoalCreationStore } from "@/stores/goal-creation-store";
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
  const { phase } = useGoalCreationStore();

  // In edit mode, show the form
  if (isEditMode) {
    return <GoalForm setOpen={setOpen} goalForm={goalForm} />;
  }

  // Render the appropriate phase
  const renderPhase = () => {
    switch (phase) {
      case "phase1":
        return <AIGoalChat />;
      case "phase2":
        return <AIGoalPhase2 />;
      case "phase3":
        return <AIGoalPhase3 />;
      case "phase4":
        return <AIGoalPhase4 />;
      default:
        return <AIGoalChat />;
    }
  };

  return (
    <div className="flex flex-col min-h-[75vh] md:min-h-full">
      {renderPhase()}
    </div>
  );
};

export default GoalDialogContent;
