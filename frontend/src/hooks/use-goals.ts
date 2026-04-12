"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  deleteGoal,
  getGoals,
  updateGoal,
  updateGoalWithRelations,
} from "@/lib/firebase/goals";
import { Goal, UpdateGoalWithRelationsPayload } from "@/types/goal";
import useQuery from "./use-query";
import useMutation from "./use-mutation";

export const useGetGoals = () => {
  const { user } = useAuth();
  const query = useQuery<Goal[]>(async () => []);
  const { setQueryState } = query;

  useEffect(() => {
    if (!user?.uid) {
      setQueryState({ data: [], isLoading: false, error: null });
      return;
    }

    setQueryState({ isLoading: true, error: null });

    const unsubscribe = getGoals(
      user.uid,
      (goals) => {
        setQueryState({ data: goals, isLoading: false });
      },
      (error) => {
        setQueryState({ error, isLoading: false });
      },
    );

    return () => unsubscribe();
  }, [setQueryState, user?.uid]);

  return query;
};

export const useDeleteGoal = () => {
  const { user } = useAuth();

  return useMutation(
    (goalId: string) => {
      if (!user?.uid) {
        throw new Error("You must be signed in to delete a goal");
      }

      return deleteGoal(user.uid, goalId);
    },
    {
      onSuccess: "Goal deleted",
      onError: "Failed to delete goal. Please try again.",
    },
  );
};

export const useUpdateGoal = () => {
  const { user } = useAuth();

  return useMutation(
    (goal: Goal) => {
      if (!user?.uid) {
        throw new Error("You must be signed in to update a goal");
      }

      return updateGoal(user.uid, goal);
    },
    {
      onSuccess: "Goal updated",
      onError: "Failed to update goal. Please try again.",
    },
  );
};

export const useUpdateGoalWithRelations = () => {
  const { user } = useAuth();

  return useMutation(
    (payload: UpdateGoalWithRelationsPayload) => {
      if (!user?.uid) {
        throw new Error("You must be signed in to update a goal");
      }

      return updateGoalWithRelations(user.uid, payload);
    },
    {
      onSuccess: "Goal updated",
      onError: "Failed to update goal. Please try again.",
    },
  );
};
