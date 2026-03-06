"use client";

import { cn } from "@/lib/utils";
import { ComponentProps, useState, useEffect, useRef } from "react";
import AddTaskOptions from "../add-task-options";
import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer";
import { useAddTaskOptions } from "@/hooks/use-add-task-options";
import HighlightedInput from "../highlighted-input";
import { useAddTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useAddSubtask, useDeleteSubtask } from "@/hooks/use-sub-task";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { Task, SubTask } from "@/types";
import { Button } from "@/components/ui/button";

interface TaskFormProps extends ComponentProps<"form"> {
  open: boolean;
  setOpen: (open: boolean) => void;
  task?: Task;
  mode?: "add" | "view";
}

export default function TaskForm({
  className,
  open,
  setOpen,
  task,
  mode = "add",
}: TaskFormProps) {
  const [taskTitle, setTaskTitle] = useState("");
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const taskOptions = useAddTaskOptions();
  const addTaskMutation = useAddTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const addSubtaskMutation = useAddSubtask();
  const deleteSubtaskMutation = useDeleteSubtask();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const isEditing = mode === "view" && !!task;

  // Prefill when editing an existing task
  useEffect(() => {
    if (task && open && mode === "view") {
      setTaskTitle(task.title);
      setSubtasks(task.subtasks ?? []);
      taskOptions.prefillFromTask(task);
    } else if (!task && open && mode === "add") {
      setTaskTitle("");
      setSubtasks([]);
      setNewSubtask("");
      taskOptions.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id, open, mode]);

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    const subtask: SubTask = {
      id: crypto.randomUUID(),
      title: newSubtask.trim(),
      completed: false,
    };
    if (isEditing && task?.id && user?.uid) {
      addSubtaskMutation.mutate({
        taskId: task.id,
        subtask,
        userId: user.uid,
      });
    }
    setSubtasks((prev) => [...prev, subtask]);
    setNewSubtask("");
  };

  const handleRemoveSubtask = (subtaskId: string) => {
    const subtask = subtasks.find((s) => s.id === subtaskId);
    if (isEditing && task?.id && user?.uid && subtask) {
      deleteSubtaskMutation.mutate({
        taskId: task.id,
        subtask,
        userId: user.uid,
      });
    }
    setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s,
    );
    setSubtasks(updatedSubtasks);
    if (isEditing && task?.id) {
      updateTaskMutation.mutate({
        taskId: task.id,
        updates: { subtasks: updatedSubtasks },
      });
    }
  };

  const handleDelete = () => {
    if (!task?.id) return;
    deleteTaskMutation.mutate(task.id);
    toast.success("Task deleted");
    setOpen(false);
  };

  const handleTitleChange = (value: string) => {
    setTaskTitle(value);
    taskOptions.parseTitle(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const cleanTitle = taskOptions.getCleanTitle(taskTitle);

    if (isEditing && task?.id) {
      updateTaskMutation.mutate({
        taskId: task.id,
        updates: {
          title: cleanTitle,
          dueDate: taskOptions.options.dueDate || null,
          time: taskOptions.options.time || "",
          isImportant: taskOptions.options.isImportant,
          isUrgent: taskOptions.options.isUrgent,
          tags:
            taskOptions.options.tags.length > 0
              ? taskOptions.options.tags
              : undefined,
        },
      });
      toast.success(
        isOnline
          ? "Task updated successfully"
          : "Task updated! Will sync when online.",
      );
    } else {
      addTaskMutation.mutate({
        userId: user?.uid || "",
        title: cleanTitle,
        status: "in-progress",
        dueDate: taskOptions.options.dueDate,
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
        subtasks: subtasks.length > 0 ? subtasks : undefined,
      });
      toast.success(
        isOnline
          ? "Task added successfully"
          : "Task added! Will sync when online.",
      );
    }

    setTaskTitle("");
    setSubtasks([]);
    setNewSubtask("");
    taskOptions.reset();
    setOpen(false);
  };

  const highlights = taskOptions.getHighlightRanges(taskTitle);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent hideBar title={isEditing ? "Edit Task" : "Add Task"}>
        <form
          id="task-form"
          className={cn("grid items-start gap-4 py-3 px-3", className)}
          onSubmit={handleSubmit}
        >
          {isEditing && (
            <DrawerHeader className="flex flex-row flex-1 justify-between items-center p-0 -mb-2">
              <Button
                variant={"ghost"}
                type="button"
                size="sm"
                className="h-7 w-10 text-xs text-red-500"
                onClick={handleDelete}
              >
                Delete
              </Button>
              <Button
                variant={"ghost"}
                type="submit"
                size="sm"
                className="h-7 w-10 text-xs px-0"
              >
                Save
              </Button>
            </DrawerHeader>
          )}
          <HighlightedInput
            ref={inputRef}
            value={taskTitle}
            onChange={handleTitleChange}
            highlights={highlights}
            placeholder={
              isEditing ? "Edit task title" : "Enter task you want to add"
            }
            className="font-medium"
            autoFocus={mode === "add"}
            onFocus={() => taskOptions.setIsFocused(true)}
            onBlur={() => taskOptions.setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit(e);
              }
            }}
          />
          <div className="items-start justify-between">
            <AddTaskOptions
              taskOptions={taskOptions}
              subtaskProps={{
                subtasks,
                newSubtask,
                setNewSubtask,
                addSubtask: handleAddSubtask,
                removeSubtask: handleRemoveSubtask,
                toggleSubtask: handleToggleSubtask,
              }}
            />
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
