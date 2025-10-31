import { addSubtask, deleteSubtask } from "@/lib/firebase/tasks";
import { SubTask, Task } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAddSubtask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      subtask,
    }: {
      taskId: string;
      subtask: SubTask;
      userId: string;
    }) => addSubtask(taskId, subtask),
    onMutate: async ({ taskId, subtask, userId }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousQueries = new Map();

      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["tasks", userId] })
        .forEach((query) => {
          const oldData = query.state.data as Task[] | undefined;
          previousQueries.set(query.queryKey, oldData);

          if (oldData) {
            const updatedData = oldData.map((task) =>
              task.id === taskId
                ? { ...task, subtasks: [...(task.subtasks ?? []), subtask] }
                : task
            );
            queryClient.setQueryData(query.queryKey, updatedData);
          }
        });

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      console.error("Failed to add subtask:", err);
      toast.error("Failed to add subtask. Please try again.");

      // Rollback all queries
      context?.previousQueries.forEach((data, queryKey) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });
};

export const useDeleteSubtask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      subtask,
    }: {
      taskId: string;
      subtask: SubTask;
      userId: string;
    }) => deleteSubtask(taskId, subtask),
    onMutate: async ({ taskId, subtask, userId }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previousQueries = new Map();

      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["tasks", userId] })
        .forEach((query) => {
          const oldData = query.state.data as Task[] | undefined;
          previousQueries.set(query.queryKey, oldData);

          if (oldData) {
            const updatedData = oldData.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    subtasks: (task.subtasks ?? []).filter(
                      (st) => st.title !== subtask.title
                    ),
                  }
                : task
            );
            queryClient.setQueryData(query.queryKey, updatedData);
          }
        });

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      console.error("Failed to delete subtask:", err);
      toast.error("Failed to delete subtask. Please try again.");

      // Rollback all queries
      context?.previousQueries.forEach((data, queryKey) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });
};
