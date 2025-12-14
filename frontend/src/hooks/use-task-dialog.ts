import { Task } from "@/types";
import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const useTaskDialog = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const modeParam = searchParams.get("mode") as "add" | "edit" | "view" | null;

  const [activeTask, setActiveTask] = useState<Task | undefined>(undefined);

  // Derive dialog open state from URL params
  const open =
    modeParam === "add" || modeParam === "edit" || modeParam === "view";
  const mode = modeParam || "view";

  const updateURL = useCallback(
    (newMode: string | null) => {
      if (newMode === null) {
        // Clear all params
        router.push("?", { scroll: false });
        return;
      }

      const newParams = new URLSearchParams();
      newParams.set("mode", newMode);

      router.push(`?${newParams.toString()}`, { scroll: false });
    },
    [router]
  );

  const handleTaskClick = (data: Task) => {
    setActiveTask(data);
    updateURL("view");
  };

  const handleAddNew = () => {
    setActiveTask(undefined);
    updateURL("add");
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      updateURL(null);
      setTimeout(() => setActiveTask(undefined), 300);
    }
  };

  const setMode = (newMode: "add" | "edit" | "view") => {
    updateURL(newMode);
  };

  const handleExternalFormSubmit = () => {
    if (typeof document === "undefined") return;

    const form = document.getElementById("task-form");

    if (form) {
      form.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  };

  const getTitle = () => {
    if (activeTask && mode === "view") return "Task Details";
    if (activeTask && mode === "edit") return "Edit Task";

    return "Add New Task";
  };

  const getSubmitLabel = () => {
    if (activeTask) {
      return "Update Task";
    }
    return "Add Task";
  };

  const hideSubmitButton = () => {
    return mode === "view";
  };

  const deleteTask = (handleDeleteTask: () => void) => {
    if (mode === "view") return undefined;
    if (activeTask) return handleDeleteTask;

    return undefined;
  };

  const getDescription = () => {
    if (activeTask && mode === "view") return "View the details of your task.";
    if (activeTask && mode === "edit")
      return "Make changes to your existing task.";

    if (mode === "add") return "Fill out the form to add a new task.";

    return "";
  };

  return {
    open,
    activeTask,
    handleTaskClick,
    handleAddNew,
    handleClose,
    handleExternalFormSubmit,
    getTitle,
    getSubmitLabel,
    getDescription,
    hideSubmitButton,
    deleteTask,
    mode,
    setMode,
  };
};
