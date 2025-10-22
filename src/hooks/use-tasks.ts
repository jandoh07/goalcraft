import {
  addTask,
  editTask,
  fetchTask,
  fetchUserTasks,
  removeTask,
  toggleTaskStatus,
} from "@/lib/firebase/tasks";
import { Task } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const useUserTasks = (
  userId: string,
  filters?: { status?: string; goalId?: string }
) => {
  return useQuery({
    queryKey: ["tasks", userId, filters],
    queryFn: () => fetchUserTasks(userId, filters),
    enabled: !!userId,
  });
};

export const useTask = (taskId: string) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => fetchTask(taskId),
    enabled: !!taskId,
  });
};

export const useAddTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTask,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.userId] });
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
    }) => editTask(taskId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.taskId] });
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

export const useTaskDialog = (
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const [activeTask, setActiveTask] = useState<Task | undefined>(undefined);

  const handleTaskClick = (data: Task) => {
    setActiveTask(data);
    setOpen(true);
  };

  const handleAddNew = () => {
    setActiveTask(undefined);
    setOpen(true);
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => setActiveTask(undefined), 300);
    }
  };

  const handleExternalFormSubmit = () => {
    const form = document.getElementById("task-form");

    if (form) {
      form.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  };

  return {
    activeTask,
    handleTaskClick,
    handleAddNew,
    handleClose,
    handleExternalFormSubmit,
  };
};
