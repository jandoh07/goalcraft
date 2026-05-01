"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { subscribeTodayNonNegotiablesWithTasks } from "@/lib/firebase/non-negotiable";
import { InProgressNonNegotiableWithTasks } from "@/types/goal";
import useQuery from "./use-query";

export const useGetInProgressNonNegotiablesWithTasks = () => {
  const { user } = useAuth();
  const query = useQuery<InProgressNonNegotiableWithTasks[]>(async () => []);
  const { setQueryState } = query;

  useEffect(() => {
    if (!user?.uid) {
      setQueryState({ data: [], isLoading: false, error: null });
      return;
    }

    let cancelled = false;
    setQueryState({ isLoading: true, error: null });

    const unsubscribe = subscribeTodayNonNegotiablesWithTasks(
      user.uid,
      (data) => {
        if (!cancelled) {
          setQueryState({ data, isLoading: false, error: null });
        }
      },
      (error) => {
        console.log("Error subscribing to today's non-negotiables:", error);
        if (!cancelled) {
          setQueryState({ error, isLoading: false });
        }
      },
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [setQueryState, user?.uid]);

  return query;
};
