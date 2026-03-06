import {
  addTask,
  updateTask,
  removeTask,
  subscribeToUserTasks,
  toggleTaskStatus,
  getMasterTask,
  getMasterTasksByIds,
  updateTaskRecurrence,
  getNonNegotiablesByGoalId,
  batchArchiveTasks,
} from "@/lib/firebase/tasks";
import { removeEmptyFields } from "@/lib/utils";
import { Task } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

export const useTasks = (
  userId: string,
  date: Date | null,
) => {
  const queryClient = useQueryClient();
  const dateKey = date ? date.toISOString().split('T')[0] : 'current';
  const queryKey = useMemo(() => ["tasks", userId, dateKey] as const, [userId, dateKey]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToUserTasks(userId, (tasks) => {
      const sortedTasks = tasks.sort((a, b) => {
    if (a.status === 'in-progress' && b.status !== 'in-progress') return -1;
    if (a.status !== 'in-progress' && b.status === 'in-progress') return 1;

    return b.createdAt.getTime() - a.createdAt.getTime();
  });

      queryClient.setQueryData(queryKey, sortedTasks);
    });


    return () => unsubscribe();
  }, [userId, queryClient, queryKey, date]);

  return useQuery({
    queryKey,
    queryFn: () => [],
    enabled: false,
    initialData: () => queryClient.getQueryData(queryKey) || [],
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

export const useAddTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      task: Omit<Task, "id" | "createdAt" | "updatedAt"> & {
        isRecurring?: boolean;
      },
    ) =>
      addTask(
        removeEmptyFields(task) as Omit<Task, "id" | "createdAt" | "updatedAt">,
      ),
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const tempTask: Task = {
        ...newTask,
        id: `temp-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const previousQueries = new Map();

      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["tasks"] })
        .forEach((query) => {
          const oldData = query.state.data as Task[] | undefined;
          previousQueries.set(query.queryKey, oldData);

          if (oldData) {
            queryClient.setQueryData(query.queryKey, [tempTask, ...oldData]);
          }
        });

      return { previousQueries, tempTask };
    },
    onError: (err, newTask, context) => {
      console.error("Failed to add task:", err);

      // Rollback all queries
      context?.previousQueries.forEach((data, queryKey) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      updates,
    }: {
      taskId: string;
      updates: Partial<Task>;
    }) => updateTask(taskId, removeEmptyFields(updates)),
    onMutate: async ({ taskId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousQueries = new Map();

      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["tasks"] })
        .forEach((query) => {
          const oldData = query.state.data as Task[] | undefined;
          previousQueries.set(query.queryKey, oldData);

          if (oldData) {
            const updatedData = oldData.map((task) =>
              task.id === taskId
                ? { ...task, ...updates, updatedAt: new Date() }
                : task,
            );
            queryClient.setQueryData(query.queryKey, updatedData);
          }
        });

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      console.error("Failed to update task:", err);

      // Rollback all queries
      context?.previousQueries.forEach((data, queryKey) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeTask,
    onMutate: async (taskId: string) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousQueries = new Map();

      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["tasks"] })
        .forEach((query) => {
          const oldData = query.state.data as Task[] | undefined;
          previousQueries.set(query.queryKey, oldData);

          if (oldData) {
            const updatedData = oldData.filter((task) => task.id !== taskId);
            queryClient.setQueryData(query.queryKey, updatedData);
          }
        });

      return { previousQueries };
    },
    onError: (err, taskId, context) => {
      console.error("Failed to delete task:", err);

      // Rollback all queries
      context?.previousQueries.forEach((data, queryKey) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });
};

export const useToggleTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      currentStatus,
      goalId,
    }: {
      taskId: string;
      currentStatus: string;
      goalId?: string;
    }) => toggleTaskStatus(taskId, currentStatus, goalId),
    onMutate: async ({ taskId, currentStatus }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const newStatus =
        currentStatus === "completed" ? "in-progress" : "completed";
      const previousQueries = new Map();

      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["tasks"] })
        .forEach((query) => {
          const oldData = query.state.data as Task[] | undefined;
          previousQueries.set(query.queryKey, oldData);

          if (oldData) {
            const updatedData = oldData.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    status: newStatus as "in-progress" | "completed",
                    updatedAt: new Date(),
                  }
                : task,
            );
            queryClient.setQueryData(query.queryKey, updatedData);
          }
        });

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      console.error("Failed to toggle task status:", err);

      // Rollback all queries
      context?.previousQueries.forEach((data, queryKey) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });
};

export const useGetMasterTask = (masterTaskId: string) => {
  return useQuery({
    queryKey: ["masterTask", masterTaskId],
    queryFn: () => getMasterTask(masterTaskId),
    enabled: !!masterTaskId,
    staleTime: 0,
  });
};

export const useGetNonNegotiables = (masterTaskIds: string[]) => {
  return useQuery({
    queryKey: ["nonNegotiables", masterTaskIds],
    queryFn: () => getMasterTasksByIds(masterTaskIds),
    enabled: masterTaskIds.length > 0,
    staleTime: 0,
  });
};

export const useGetNonNegotiablesByGoalId = (
  goalId: string,
  userId: string,
) => {
  return useQuery({
    queryKey: ["nonNegotiables", "goal", goalId, userId],
    queryFn: () => getNonNegotiablesByGoalId(goalId, userId),
    enabled: !!goalId && !!userId,
    staleTime: 0,
  });
};

export const useUpdateTaskRecurrence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      masterTaskId,
      recurringStatus,
    }: {
      masterTaskId: string;
      recurringStatus: string;
    }) => updateTaskRecurrence(masterTaskId, recurringStatus),
    onMutate: async ({ masterTaskId, recurringStatus }) => {
      await queryClient.cancelQueries({
        queryKey: ["masterTask", masterTaskId],
      });

      const previousMasterTask = queryClient.getQueryData<Task>([
        "masterTask",
        masterTaskId,
      ]);

      if (previousMasterTask) {
        const updatedMasterTask = {
          ...previousMasterTask,
          recurringStatus,
          updatedAt: new Date(),
        };
        queryClient.setQueryData(
          ["masterTask", masterTaskId],
          updatedMasterTask,
        );
      }

      return { previousMasterTask };
    },
    onError: (err, variables, context) => {
      console.error("Failed to update task recurrence:", err);

      // Rollback master task query
      if (context?.previousMasterTask) {
        queryClient.setQueryData(
          ["masterTask", variables.masterTaskId],
          context.previousMasterTask,
        );
      }
    },
  });
};

export const useBatchArchiveTasks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskIds: string[]) => batchArchiveTasks(taskIds),
    onMutate: async (taskIds) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousQueries = new Map();

      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["tasks"] })
        .forEach((query) => {
          const oldData = query.state.data as Task[] | undefined;
          previousQueries.set(query.queryKey, oldData);

          if (oldData) {
            const updatedData = oldData.map((task) =>
              taskIds.includes(task.id!)
                ? {
                    ...task,
                    status: "archived" as const,
                    updatedAt: new Date(),
                  }
                : task,
            );
            queryClient.setQueryData(query.queryKey, updatedData);
          }
        });

      return { previousQueries };
    },
    onError: (err, taskIds, context) => {
      console.error("Failed to batch archive tasks:", err);

      // Rollback all queries
      context?.previousQueries.forEach((data, queryKey) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });
};
