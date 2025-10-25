import {
  addTask,
  editTask,
  fetchUserTasks,
  removeTask,
  toggleTaskStatus,
} from "@/lib/firebase/tasks";
import { removeEmptyFields } from "@/lib/utils";
import { Task } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetTasks = (
  userId: string,
  filters?: { status?: string; goalId?: string }
) => {
  return useQuery({
    queryKey: ["tasks", userId, filters],
    queryFn: () => fetchUserTasks(userId, filters),
    enabled: !!userId,
  });
};

export const useAddTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) =>
      addTask(
        removeEmptyFields(task) as Omit<Task, "id" | "createdAt" | "updatedAt">
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
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
    }) => editTask(taskId, removeEmptyFields(updates)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
