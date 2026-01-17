"use client";

import { useCallback } from "react";
import { useAddGoal, useUpdateGoal } from "./use-goals";
import { useGoalCreationStore } from "@/stores/goal-creation-store";
import { useAuth } from "@/contexts/auth-context";
import { Goal, Task } from "@/types";
import { parseDurationToDate } from "@/lib/utils/parse-duration";
import { parseFrequency } from "@/lib/utils/frequency-parser";

/**
 * Hook for creating/updating goals from AI goal creation flow
 * Collects all phase data from the store and handles the mutation
 */
export function useAIGoalCreation() {
  const { user } = useAuth();
  const addGoalMutation = useAddGoal();
  const updateGoalMutation = useUpdateGoal();

  const {
    editingGoalId,
    phase1Data,
    phase2Data,
    phase3Data,
    phase4Data,
    messages,
    chatHistory,
    phase2Messages,
    phase2ChatHistory,
    phase3Messages,
    phase3ChatHistory,
    phase4Messages,
    phase4ChatHistory,
    reset,
  } = useGoalCreationStore();

  const createGoal = useCallback(async () => {
    if (!user?.uid) {
      throw new Error("User not authenticated");
    }

    // Calculate due date from duration
    const dueDate = phase1Data.duration
      ? parseDurationToDate(phase1Data.duration)
      : undefined;

    // Build milestones with proper structure
    const milestones = phase3Data.milestones.map((m, index) => ({
      id: `milestone-${index + 1}`,
      title: m.title,
      description: m.description || undefined,
      weight: m.weight,
      completed: false,
    }));

    // Build tasks from one-time tasks and non-negotiables
    const tasks: (Omit<
      Task,
      "id" | "createdAt" | "updatedAt" | "userId" | "goalId"
    > & {
      isRecurring?: boolean;
    })[] = [];

    // Add one-time tasks
    phase4Data.oneTimeTasks.forEach((task) => {
      tasks.push({
        title: task.title,
        description: task.description || undefined,
        status: "in-progress",
        isRecurring: false,
      });
    });

    // Add non-negotiables as recurring tasks
    phase4Data.nonNegotiables.forEach((task) => {
      const frequency = parseFrequency(task.frequency);
      tasks.push({
        title: task.title,
        description: task.description || undefined,
        status: "in-progress",
        isRecurring: true,
        frequency: frequency || undefined,
        // Set dueDate to today for recurring tasks - used to calculate first instance
        dueDate: new Date(),
      });
    });

    // Build goal data
    const goalData: Omit<
      Goal,
      "id" | "createdAt" | "updatedAt" | "userId" | "status"
    > = {
      title: phase1Data.title,
      category: phase1Data.category,
      relevance: phase2Data.whyStatement || undefined,
      dueDate,
      milestones,
      // Store AI chat history for continuing conversations later
      aiChatHistory: {
        phase1: chatHistory,
        phase2: phase2ChatHistory,
        phase3: phase3ChatHistory,
        phase4: phase4ChatHistory,
      },
      aiDisplayMessages: {
        phase1: messages,
        phase2: phase2Messages,
        phase3: phase3Messages,
        phase4: phase4Messages,
      },
    };

    if (editingGoalId) {
      // Update existing goal
      await updateGoalMutation.mutateAsync({
        goalId: editingGoalId,
        updates: goalData,
      });
      return editingGoalId;
    } else {
      // Create new goal
      const goalId = await addGoalMutation.mutateAsync({
        userId: user.uid,
        goalData,
        tasks: tasks.length > 0 ? tasks : undefined,
      });
      return goalId;
    }
  }, [
    user,
    editingGoalId,
    phase1Data,
    phase2Data,
    phase3Data,
    phase4Data,
    messages,
    chatHistory,
    phase2Messages,
    phase2ChatHistory,
    phase3Messages,
    phase3ChatHistory,
    phase4Messages,
    phase4ChatHistory,
    addGoalMutation,
    updateGoalMutation,
  ]);

  return {
    createGoal,
    reset,
    isLoading: addGoalMutation.isPending || updateGoalMutation.isPending,
    isEditing: !!editingGoalId,
    error: addGoalMutation.error || updateGoalMutation.error,
  };
}
