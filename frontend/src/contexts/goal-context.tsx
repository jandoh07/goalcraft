"use client";

import { Goal } from "@/types/goal";
import React, { createContext, useContext, useState } from "react";

export type GoalMode = "create" | "view" | "edit";
export type GoalDialogType = "goal" | "objective";

interface GoalContextType {
  mode: GoalMode | null;
  setMode: (mode: GoalMode | null) => void;
  dialogType: GoalDialogType;
  setDialogType: (type: GoalDialogType) => void;
  goal: Goal | null;
  setGoal: (goal: Goal | null) => void;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export function GoalProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<GoalMode | null>(null);
  const [dialogType, setDialogType] = useState<GoalDialogType>("goal");
  const [goal, setGoal] = useState<Goal | null>(null);

  return (
    <GoalContext.Provider
      value={{ mode, setMode, dialogType, setDialogType, goal, setGoal }}
    >
      {children}
    </GoalContext.Provider>
  );
}

export function useGoal() {
  const context = useContext(GoalContext);

  if (context === undefined) {
    throw new Error("useGoal must be used within a GoalProvider");
  }

  return context;
}
