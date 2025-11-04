import { Task } from "@/types";
import { useState } from "react";

export const useTaskDialog = (
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const [activeTask, setActiveTask] = useState<Task | undefined>(undefined);
  const [mode, setMode] = useState<"add" | "edit" | "view">("view");

  const handleTaskClick = (data: Task) => {
    setActiveTask(data);
    setOpen(true);
    setMode("view");
  };

  const handleAddNew = () => {
    setActiveTask(undefined);
    setOpen(true);
    setMode("add");
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => setActiveTask(undefined), 300);
    }
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
