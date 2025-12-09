import { SubTask, Task } from "@/types";
import { useCallback, useEffect, useState } from "react";
import {
  useAddTask,
  useDeleteTask,
  useGetMasterTask,
  useUpdateTask,
} from "./use-tasks";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define the form schema with zod
const taskFormSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().default(""),
  associatedGoal: z
    .object({
      goalId: z.string(),
      goalTitle: z.string(),
    })
    .default({ goalId: "", goalTitle: "" }),
  dueDate: z.date().optional(),
  time: z.string().default(""),
  priority: z.enum(["high", "medium", "low", ""]).default(""),
  isRecurring: z.boolean().default(false),
  frequency: z.string().default(""),
  recurringMasterId: z.string().default(""),
  stopRecurring: z.boolean().default(false),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

const useTasksForm = ({
  initialData,
  mode,
  openDialog,
}: {
  initialData?: Task;
  mode: "add" | "edit";
  openDialog: (isOpen: boolean) => void;
}) => {
  const [subtasks, setSubtasks] = useState<SubTask[]>(
    initialData?.subtasks || []
  );
  const [newSubtask, setNewSubtask] = useState("");

  const { user } = useAuth();
  const addTaskMutation = useAddTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const form = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      associatedGoal: {
        goalId: initialData?.goalId || "",
        goalTitle: initialData?.goalTitle || "",
      },
      dueDate: initialData?.dueDate || undefined,
      time: initialData?.time || "",
      priority: (initialData?.priority || "") as "high" | "medium" | "low" | "",
      isRecurring: false,
      frequency: initialData?.frequency || "",
      recurringMasterId: initialData?.recurringMasterId || "",
      stopRecurring: false,
    },
  });

  // Fetch master task if in edit mode and task has a recurringMasterId
  const { data: masterTask } = useGetMasterTask(
    mode === "edit" && initialData?.recurringMasterId
      ? initialData.recurringMasterId
      : ""
  );

  const resetForm = useCallback(() => {
    form.reset({
      title: "",
      description: "",
      associatedGoal: { goalId: "", goalTitle: "" },
      dueDate: undefined,
      time: "",
      priority: "",
      isRecurring: false,
      frequency: "",
      recurringMasterId: "",
      stopRecurring: false,
    });
    setSubtasks([]);
    setNewSubtask("");
  }, [form]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        description: initialData.description || "",
        associatedGoal: {
          goalId: initialData.goalId || "",
          goalTitle: initialData.goalTitle || "",
        },
        dueDate: initialData.dueDate || undefined,
        time: initialData.time || "",
        priority: (initialData.priority || "") as
          | "high"
          | "medium"
          | "low"
          | "",
        frequency: initialData.frequency || "",
        recurringMasterId: initialData.recurringMasterId || "",
        stopRecurring: false,
      });
      setSubtasks(initialData.subtasks || []);
    } else {
      resetForm();
    }
  }, [initialData, form, resetForm]);

  // Set isRecurring based on master task's recurringStatus
  useEffect(() => {
    if (mode === "edit" && masterTask) {
      const recurringStatus = (masterTask as { recurringStatus?: string })
        ?.recurringStatus;
      form.setValue("isRecurring", recurringStatus === "active");
    }
  }, [mode, masterTask, form]);

  const addSubtask = () => {
    if (newSubtask.trim()) {
      const newSubtaskObj: SubTask = {
        id: crypto.randomUUID(),
        title: newSubtask.trim(),
        completed: false,
      };
      setSubtasks([...subtasks, newSubtaskObj]);
      setNewSubtask("");
    }
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((subtask) => subtask.id !== id));
  };

  const onSubmit = form.handleSubmit((data) => {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    const taskData = {
      title: data.title,
      description: data.description,
      goalId: data.associatedGoal?.goalId,
      goalTitle: data.associatedGoal?.goalTitle,
      dueDate: data.dueDate || null,
      time: data.time,
      priority: data.priority || null,
      subtasks,
      isRecurring: data.isRecurring,
      frequency: data.frequency,
      status: "in-progress" as const,
      recurringMasterId: data.recurringMasterId,
      stopRecurring: data.stopRecurring,
    };

    const payload = {
      userId: user?.uid || "",
      ...taskData,
    };

    if (mode === "add") {
      addTaskMutation.mutate(payload);
      resetForm();
      openDialog(false);
      toast.success(
        isOnline
          ? "Task added successfully"
          : "Task added! Will sync when online."
      );
    } else if (mode === "edit" && initialData) {
      updateTaskMutation.mutate({
        taskId: initialData.id || "",
        updates: { ...taskData },
      });
      resetForm();
      openDialog(false);
      toast.success(
        isOnline
          ? "Task updated successfully"
          : "Task updated! Will sync when online."
      );
    }
  });

  const handleDeleteTask = (
    taskId: string,
    handleClose: (isOpen: boolean) => void
  ) => {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    deleteTaskMutation.mutate(taskId);
    handleClose(false);
    toast.success(
      isOnline
        ? "Task deleted successfully"
        : "Task deleted! Will sync when online."
    );
  };

  return {
    form,
    subtasks: {
      items: subtasks,
      newSubtask,
      setNewSubtask,
      addSubtask,
      removeSubtask,
    },
    mutation: mode === "add" ? addTaskMutation : updateTaskMutation,
    onSubmit,
    handleDeleteTask,
    mode,
  };
};

export default useTasksForm;
