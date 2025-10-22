import { Task } from "@/types";
import { useState } from "react";

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
