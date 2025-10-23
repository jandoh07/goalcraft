"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ComponentProps, useState } from "react";
import AssociatedGoal from "./associated-goal";
import useTasksForm from "@/hooks/use-tasks-form";
import DueDateAndTime from "./due-date-and-time";
import SubTasks from "./sub-tasks";
import RecurringTask from "./recurring-task";
import Priority from "./priority";
import InputBox from "@/components/ui/input-box";
import DeleteAlertDialog from "@/components/ui/confirmation-dialog";

interface AddTaskFormProps extends ComponentProps<"form"> {
  mode?: "add" | "edit";
  taskForm: ReturnType<typeof useTasksForm>;
  onDelete?: () => void;
}

export default function TaskForm({
  className,
  mode = "add",
  taskForm,
  onDelete,
}: AddTaskFormProps) {
  const { formData, setters, subtasks, handleSubmit, mutation } = taskForm;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <form
      id="task-form"
      className={cn("grid items-start gap-6 pb-3 md:pb-0", className)}
      onSubmit={handleSubmit}
    >
      <InputBox
        label="Task Title"
        value={formData.title}
        onChange={(e) => setters.setTitle(e.target.value)}
        placeholder="Enter task title"
        id="title"
      />
      <InputBox
        label="Description"
        value={formData.description}
        onChange={(e) => setters.setDescription(e.target.value)}
        placeholder="Add task description (optional)"
        id="description"
      />
      <AssociatedGoal
        associatedGoal={formData.associatedGoal}
        setAssociatedGoal={setters.setAssociatedGoal}
      />
      <DueDateAndTime
        time={formData.time}
        setTime={setters.setTime}
        date={formData.dueDate}
        setDate={setters.setDueDate}
      />
      <SubTasks
        subtasks={subtasks.items}
        newSubtask={subtasks.newSubtask}
        setNewSubtask={subtasks.setNewSubtask}
        addSubtask={subtasks.addSubtask}
        removeSubtask={subtasks.removeSubtask}
      />
      <RecurringTask
        isRecurring={formData.isRecurring}
        setIsRecurring={setters.setIsRecurring}
        frequency={formData.frequency}
        setFrequency={setters.setFrequency}
      />
      <Priority
        priority={formData.priority}
        setPriority={setters.setPriority}
      />
      <div className="hidden md:flex gap-2">
        <Button type="submit" className="flex-1">
          {!mutation.isPending &&
            (mode === "edit" ? "Update Task" : "Add Task")}
          {mutation.isPending &&
            (mode === "edit" ? "Updating..." : "Adding...")}
        </Button>
        {mode === "edit" && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </Button>
        )}
      </div>
      {mode === "edit" && (
        <DeleteAlertDialog
          isOpen={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={() => {
            if (onDelete) {
              onDelete();
            }
          }}
          onCancel={() => setShowDeleteDialog(false)}
          preset="deleteTask"
        />
      )}
    </form>
  );
}
