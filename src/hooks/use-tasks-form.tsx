import { Task } from "@/types";
import { useEffect, useState } from "react";
import { useAddTask, useDeleteTask, useUpdateTask } from "./use-tasks";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

const useTasksForm = ({
  initialData,
  mode,
  openDialog,
}: {
  initialData?: Task;
  mode: "add" | "edit";
  openDialog: (isOpen: boolean) => void;
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [associatedGoal, setAssociatedGoal] = useState(
    initialData?.associatedGoal || ""
  );
  const [time, setTime] = useState(initialData?.time || "");
  const [priority, setPriority] = useState<"high" | "medium" | "low" | "">(
    initialData?.priority || ""
  );
  const [subtasks, setSubtasks] = useState<string[]>(
    initialData?.subtasks || []
  );
  const [newSubtask, setNewSubtask] = useState("");
  const [isRecurring, setIsRecurring] = useState(
    initialData?.isRecurring || false
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialData?.dueDate || undefined
  );
  const [frequency, setFrequency] = useState(initialData?.frequency || "");
  const { user } = useAuth();
  const addTaskMutation = useAddTask();
  const editTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setAssociatedGoal(initialData.associatedGoal || "");
      setTime(initialData.time || "");
      setPriority(initialData.priority || "low");
      setSubtasks(initialData.subtasks || []);
      setIsRecurring(initialData.isRecurring || false);
      setFrequency(initialData.frequency || "");
      setDueDate(initialData.dueDate || undefined);
    }
  }, [initialData]);

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask]);
      setNewSubtask("");
    }
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssociatedGoal("");
    setTime("");
    setPriority("");
    setSubtasks([]);
    setIsRecurring(false);
    setFrequency("");
    setDueDate(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "add") {
      addTaskMutation.mutate(
        {
          userId: user?.uid || "",
          title,
          description,
          // associatedGoal,
          dueDate: dueDate,
          time,
          priority,
          subtasks,
          isRecurring,
          frequency,
          status: "in-progress",
        },
        {
          onSuccess: () => {
            resetForm();
            openDialog(false);
            toast.success("Task added successfully");
          },
        }
      );
    } else if (mode === "edit" && initialData) {
      editTaskMutation.mutate(
        {
          taskId: initialData.id || "",
          updates: {
            title,
            description,
            associatedGoal,
            dueDate,
            time,
            priority,
            subtasks,
            isRecurring,
            frequency,
            status: "in-progress",
          },
        },
        {
          onSuccess: () => {
            resetForm();
            openDialog(false);
            toast.success("Task updated successfully");
          },
        }
      );
    }
  };

  const handleDeleteTask = (
    taskId: string,
    handleClose: (isOpen: boolean) => void
  ) => {
    deleteTaskMutation.mutate(taskId, {
      onSuccess: () => {
        handleClose(false);
        toast.success("Task deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete task");
      },
    });
  };

  return {
    formData: {
      title,
      description,
      associatedGoal,
      dueDate,
      time,
      priority,
      isRecurring,
      frequency,
    },
    setters: {
      setTitle,
      setDescription,
      setAssociatedGoal,
      setDueDate,
      setTime,
      setPriority,
      setIsRecurring,
      setFrequency,
    },
    subtasks: {
      items: subtasks,
      newSubtask,
      setNewSubtask,
      addSubtask,
      removeSubtask,
    },
    mutation: mode === "add" ? addTaskMutation : editTaskMutation,
    handleSubmit,
    handleDeleteTask,
  };
};

export default useTasksForm;
