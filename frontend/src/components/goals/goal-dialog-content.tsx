"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, FileEdit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const ModeToggle = ({
  mode,
  onModeChange,
}: {
  mode: DialogMode;
  onModeChange: (mode: DialogMode) => void;
}) => (
  <div className="flex justify-end mb-2">
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onModeChange(mode === "ai" ? "form" : "ai")}
      className="size-8 text-muted-foreground hover:text-foreground"
      title={mode === "ai" ? "Switch to manual mode" : "Switch to AI assistant"}
    >
      {mode === "ai" ? (
        <FileEdit className="size-4" />
      ) : (
        <MessageSquare className="size-4" />
      )}
    </Button>
  </div>
);

const GoalDialogContent = ({
  setOpen,
  goalForm,
  isEditMode,
  onModeChange,
}: GoalDialogContentProps) => {
  const [mode, setMode] = useState<DialogMode>("ai");

  const handleModeChange = (newMode: DialogMode) => {
    setMode(newMode);
    onModeChange?.(newMode);
  };

  // In edit mode, always show the form
  if (isEditMode) {
    return <GoalForm setOpen={setOpen} goalForm={goalForm} />;
  }

  return (
    <div className="flex flex-col min-h-[75vh]">
      <ModeToggle mode={mode} onModeChange={handleModeChange} />
      <motion.div
        className="flex-1 flex flex-col"
        initial={false}
        animate={{ height: "auto" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {mode === "ai" ? (
            <motion.div
              key="ai"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AIGoalChat />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <GoalForm setOpen={setOpen} goalForm={goalForm} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default GoalDialogContent;
