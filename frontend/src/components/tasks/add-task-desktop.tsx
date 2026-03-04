"use client";

import { useState } from "react";
import { useAddTask } from "@/hooks/use-tasks";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import AddTaskOptions from "./add-task-options";
import { useAddTaskOptions } from "@/hooks/use-add-task-options";
import HighlightedInput from "./highlighted-input";

const AddTaskDesktop = () => {
  const [taskTitle, setTaskTitle] = useState("");
  const { user } = useAuth();
  const addTaskMutation = useAddTask();
  const taskOptions = useAddTaskOptions();

  const handleTitleChange = (value: string) => {
    setTaskTitle(value);
    taskOptions.parseTitle(value);
  };

  const handleAddTask = async () => {
    if (!taskTitle.trim()) return;

    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const cleanTitle = taskOptions.getCleanTitle(taskTitle);

    addTaskMutation.mutate({
      userId: user?.uid || "",
      title: cleanTitle,
      status: "in-progress",
      dueDate: taskOptions.options.dueDate || new Date(),
      time: taskOptions.options.time || undefined,
      isImportant: taskOptions.options.isImportant || undefined,
      isUrgent: taskOptions.options.isUrgent || undefined,
      frequency: taskOptions.options.isRecurring
        ? taskOptions.options.frequency
        : undefined,
      isRecurring: taskOptions.options.isRecurring || undefined,
      tags:
        taskOptions.options.tags.length > 0
          ? taskOptions.options.tags
          : undefined,
    });

    toast.success(
      isOnline
        ? "Task added successfully"
        : "Task added! Will sync when online.",
    );
    setTaskTitle("");
    taskOptions.reset();
  };

  const highlights = taskOptions.getHighlightRanges(taskTitle);

  return (
    <div className="my-2 border border-border rounded-lg hidden md:flex justify-between items-center gap-3 px-2 shadow-sm bg-background overflow-hidden text-sm">
      <HighlightedInput
        value={taskTitle}
        onChange={handleTitleChange}
        highlights={highlights}
        placeholder="Add task to inbox..."
        className="px-1 py-3"
        onFocus={() => taskOptions.setIsFocused(true)}
        onBlur={() => taskOptions.setIsFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleAddTask();
          }
        }}
      />
      <AddTaskOptions taskOptions={taskOptions} />
    </div>
  );
};

export default AddTaskDesktop;
