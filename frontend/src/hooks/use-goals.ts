import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserGoals,
  getGoal,
  addGoal,
  updateGoal,
  deleteGoal,
  subscribeToUserGoals,
  updateMilestone,
} from "@/lib/firebase/goals";
import { Goal, UpdateGoalParams } from "@/types";
import { removeEmptyFields } from "@/lib/utils";
import { useEffect } from "react";
import { toast } from "sonner";

export const useGoals = (userId: string, status?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToUserGoals(userId, status, (goals) => {
      queryClient.setQueryData(["goals", userId, status], goals);
    });

    return () => unsubscribe();
  }, [userId, status, queryClient]);

  return useQuery({
    queryKey: ["goals", userId, status],
    queryFn: () => getUserGoals(userId, status),
    enabled: !!userId, // only run when userId is defined
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

export const useGoal = (goalId: string) => {
  return useQuery({
    queryKey: ["goal", goalId],
    queryFn: () => getGoal(goalId!),
    enabled: !!goalId,
  });
};

export const useAddGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      goalData,
    }: {
      userId: string;
      goalData: Omit<
        Goal,
        "id" | "createdAt" | "updatedAt" | "userId" | "status"
      >;
    }) =>
      addGoal(
        userId,
        removeEmptyFields(goalData) as Omit<
          Goal,
          "id" | "createdAt" | "updatedAt" | "userId" | "status"
        >
      ),
    onMutate: async ({ userId, goalData }) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });

      const tempGoal: Goal = {
        ...goalData,
        id: `temp-${Date.now()}`,
        userId,
        status: "in-progress",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const previousQueries = new Map();

      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["goals"] })
        .forEach((query) => {
          const oldData = query.state.data as Goal[] | undefined;
          previousQueries.set(query.queryKey, oldData);

          if (oldData) {
            queryClient.setQueryData(query.queryKey, [tempGoal, ...oldData]);
          }
        });

      return { previousQueries, tempGoal };
    },
    onError: (err, variables, context) => {
      console.error("Failed to add goal:", err);

      // Rollback all queries
      context?.previousQueries.forEach((data, queryKey) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to add goal. Please try again.");
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, updates, milestone }: UpdateGoalParams) =>
      milestone
        ? updateMilestone(
            goalId,
            milestone.milestoneIndex,
            milestone.completed,
            milestone.progress
          )
        : updateGoal(goalId, removeEmptyFields(updates)),
    onMutate: async ({ goalId, updates }) => {
      queryClient.cancelQueries({ queryKey: ["goals"] });

      const previousQueries = new Map();

      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["goals"] })
        .forEach((query) => {
          const oldData = query.state.data as Goal[] | undefined;
          previousQueries.set(query.queryKey, oldData);

          if (oldData) {
            const updatedData = oldData.map((goal) =>
              goal.id === goalId
                ? { ...goal, ...updates, updatedAt: new Date() }
                : goal
            );
            queryClient.setQueryData(query.queryKey, updatedData);
          }
        });

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      console.error("Failed to update goal:", err);

      // Rollback all queries
      context?.previousQueries.forEach((data, queryKey) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to update goal. Please try again.");
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goalId: string) => deleteGoal(goalId),
    onMutate: async (goalId: string) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });

      const previousQueries = new Map();

      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["goals"] })
        .forEach((query) => {
          const oldData = query.state.data as Goal[] | undefined;
          previousQueries.set(query.queryKey, oldData);

          if (oldData) {
            const updatedData = oldData.filter((goal) => goal.id !== goalId);
            queryClient.setQueryData(query.queryKey, updatedData);
          }
        });

      return { previousQueries };
    },
    onError: (err, goalId, context) => {
      console.error("Failed to delete goal:", err);

      // Rollback all queries
      context?.previousQueries.forEach((data, queryKey) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to delete goal. Please try again.");
    },
  });
};
