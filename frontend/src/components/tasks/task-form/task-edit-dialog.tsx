"use client";

import { Task, SubTask } from "@/types";
import { useState, useEffect } from "react";
import { useAddTaskOptions } from "@/hooks/use-add-task-options";
import { useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useAddSubtask, useDeleteSubtask } from "@/hooks/use-sub-task";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import HighlightedInput from "../highlighted-input";
import AddTaskOptions from "../add-task-options";
import { Button } from "@/components/ui/button";

interface TaskEditDialogProps {
  task: Task | undefined;
  open: boolean;
  onClose: () => void;
}

export default function TaskEditDialog({
  task,
  open,
  onClose,
}: TaskEditDialogProps) {
  const [taskTitle, setTaskTitle] = useState("");
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const taskOptions = useAddTaskOptions();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const addSubtaskMutation = useAddSubtask();
  const deleteSubtaskMutation = useDeleteSubtask();
  const { user } = useAuth();

  // Prefill when task changes
  useEffect(() => {
    if (task && open) {
      setTaskTitle(task.title);
      setSubtasks(task.subtasks ?? []);
      taskOptions.prefillFromTask(task);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id, open]);

  const handleTitleChange = (value: string) => {
    setTaskTitle(value);
    taskOptions.parseTitle(value);
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    const subtask: SubTask = {
      id: crypto.randomUUID(),
      title: newSubtask.trim(),
      completed: false,
    };
    if (task?.id && user?.uid) {
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
    if (task?.id && user?.uid && subtask) {
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
    if (task?.id) {
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
    onClose();
  };

  const handleSave = () => {
    if (!task?.id || !taskTitle.trim()) return;

    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const cleanTitle = taskOptions.getCleanTitle(taskTitle);

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
    onClose();
  };

  const highlights = taskOptions.getHighlightRanges(taskTitle);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Make changes to your task.</DialogDescription>
          </DialogHeader>
        </VisuallyHidden>

        <div className="space-y-4">
          <HighlightedInput
            value={taskTitle}
            onChange={handleTitleChange}
            highlights={highlights}
            placeholder="Task title"
            className="font-medium text-base"
            autoFocus
            onFocus={() => taskOptions.setIsFocused(true)}
            onBlur={() => taskOptions.setIsFocused(false)}
          />

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
        <DialogFooter>
          <div className="flex justify-between items-center gap-2 pt-5">
            <Button
              variant="destructive"
              size="sm"
              className="h-7 text-xs"
              onClick={handleDelete}
            >
              Delete
            </Button>
            <Button size="sm" className="h-7 text-xs" onClick={handleSave}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
