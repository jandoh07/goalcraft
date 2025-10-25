import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserGoals,
  getGoal,
  addGoal,
  updateGoal,
  deleteGoal,
} from "@/lib/firebase/goals";
import { Goal } from "@/types";
import { removeEmptyFields } from "@/lib/utils";

export const useGoals = (userId: string, status?: string) => {
  return useQuery({
    queryKey: ["goals", userId, status],
    queryFn: () => getUserGoals(userId, status),
    enabled: !!userId, // only run when userId is defined
  });
};

export const useGoal = (goalId: string) => {
  return useQuery({
    queryKey: ["goal", goalId],
    queryFn: () => getGoal(goalId!),
    enabled: !!goalId,
  });
};

export const useAddGoal = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      goalData: Omit<
        Goal,
        "id" | "createdAt" | "updatedAt" | "userId" | "status"
      >
    ) =>
      addGoal(
        userId!,
        removeEmptyFields(goalData) as Omit<
          Goal,
          "id" | "createdAt" | "updatedAt" | "userId" | "status"
        >
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
    },
  });
};

export const useUpdateGoal = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      goalId,
      updates,
    }: {
      goalId: string;
      updates: Partial<Goal>;
    }) => updateGoal(goalId, removeEmptyFields(updates)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
    },
  });
};

export const useDeleteGoal = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goalId: string) => deleteGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", userId] });
    },
  });
};
