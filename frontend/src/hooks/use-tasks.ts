import {
  addTask,
  updateTask,
  fetchUserTasks,
  removeTask,
  subscribeToUserTasks,
  toggleTaskStatus,
} from "@/lib/firebase/tasks";
import { removeEmptyFields } from "@/lib/utils";
import { Task } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

export const useGetTasks = (
  userId: string,
  filters?: { status?: string; goalId?: string }
) => {
  const queryClient = useQueryClient();
  // const queryKey = ["tasks", userId, filters];
  const queryKey = useMemo(
    () => ["tasks", userId, filters] as const,
    // We only care about the actual filter values, not the object reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, filters?.status, filters?.goalId]
  );

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToUserTasks(userId, filters, (tasks) => {
      queryClient.setQueryData(queryKey, tasks);
    });

    return () => unsubscribe();
    // We only care about the actual filter values, not the object reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, filters?.status, filters?.goalId, queryClient, queryKey]);

  return useQuery({
    queryKey,
    queryFn: () => fetchUserTasks(userId, filters),
    enabled: !!userId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

export const useAddTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) =>
      addTask(
        removeEmptyFields(task) as Omit<Task, "id" | "createdAt" | "updatedAt">
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
                : task
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
    }: {
      taskId: string;
      currentStatus: string;
    }) => toggleTaskStatus(taskId, currentStatus),
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
                : task
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
