import { AssociatedGoal, SubTask, Task } from "@/types";
import { useEffect, useState } from "react";
import {
  useAddTask,
  useDeleteTask,
  useGetMasterTask,
  useUpdateTask,
} from "./use-tasks";
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
  const [associatedGoal, setAssociatedGoal] = useState<AssociatedGoal>({
    goalId: initialData?.goalId || "",
    goalTitle: initialData?.goalTitle || "",
  });
  const [time, setTime] = useState(initialData?.time || "");
  const [priority, setPriority] = useState<"high" | "medium" | "low" | "">(
    initialData?.priority || ""
  );
  const [subtasks, setSubtasks] = useState<SubTask[]>(
    initialData?.subtasks || []
  );
  const [newSubtask, setNewSubtask] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialData?.dueDate || undefined
  );
  const [frequency, setFrequency] = useState(initialData?.frequency || "");
  const [recurringMasterId, setRecurringMasterId] = useState(
    initialData?.recurringMasterId || ""
  );
  const [stopRecurring, setStopRecurring] = useState(false);
  const { user } = useAuth();
  const addTaskMutation = useAddTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  // Fetch master task if in edit mode and task has a recurringMasterId
  const { data: masterTask } = useGetMasterTask(
    mode === "edit" && initialData?.recurringMasterId
      ? initialData.recurringMasterId
      : ""
  );

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssociatedGoal({
      goalId: "",
      goalTitle: "",
    });
    setTime("");
    setPriority("");
    setSubtasks([]);
    setIsRecurring(false);
    setFrequency("");
    setDueDate(undefined);
    setRecurringMasterId("");
    setStopRecurring(false);
  };

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setAssociatedGoal({
        goalId: initialData.goalId || "",
        goalTitle: initialData.goalTitle || "",
      });
      setTime(initialData.time || "");
      setPriority(initialData.priority || "");
      setSubtasks(initialData.subtasks || []);
      setFrequency(initialData.frequency || "");
      setDueDate(initialData.dueDate || undefined);
      setRecurringMasterId(initialData.recurringMasterId || "");
    } else {
      resetForm();
    }
  }, [initialData]);

  // Set isRecurring based on master task's recurringStatus
  useEffect(() => {
    if (mode === "edit" && masterTask) {
      const recurringStatus = (masterTask as { recurringStatus?: string })
        ?.recurringStatus;
      setIsRecurring(recurringStatus === "active");
    }
  }, [mode, masterTask]);

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

  const taskData = {
    title,
    description,
    goalId: associatedGoal?.goalId,
    goalTitle: associatedGoal?.goalTitle,
    dueDate: dueDate || null,
    time,
    priority: priority || null,
    subtasks,
    isRecurring,
    frequency,
    status: "in-progress" as const,
    recurringMasterId,
    stopRecurring,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

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
  };

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
    formData: {
      title,
      description,
      associatedGoal,
      dueDate,
      time,
      priority,
      isRecurring,
      frequency,
      recurringMasterId,
      stopRecurring,
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
      setRecurringMasterId,
      setStopRecurring,
    },
    subtasks: {
      items: subtasks,
      newSubtask,
      setNewSubtask,
      addSubtask,
      removeSubtask,
    },
    mutation: mode === "add" ? addTaskMutation : updateTaskMutation,
    handleSubmit,
    handleDeleteTask,
    mode,
  };
};

export default useTasksForm;
