"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ComponentProps } from "react";
import AssociatedGoal from "./associated-goal";
import { Task } from "@/types";
import useTasksForm from "@/hooks/use-tasks-form";
import DueDateAndTime from "./due-date-and-time";
import SubTasks from "./sub-tasks";
import RecurringTask from "./recurring-task";
import Priority from "./priority";
import InputBox from "@/components/ui/input-box";

interface AddTaskFormProps extends ComponentProps<"form"> {
  initialData?: Task;
  mode?: "add" | "edit";
  openDialog: (isOpen: boolean) => void;
  triggerSubmit: boolean;
  setTriggerSubmit: (value: boolean) => void;
}

export default function TaskForm({
  className,
  initialData,
  mode = "add",
  openDialog,
  triggerSubmit,
  setTriggerSubmit,
}: AddTaskFormProps) {
  const {
    associatedGoal,
    setAssociatedGoal,
    time,
    setTime,
    subtasks,
    newSubtask,
    setNewSubtask,
    addSubtask,
    removeSubtask,
    isRecurring,
    setIsRecurring,
    frequency,
    setFrequency,
    priority,
    setPriority,
    title,
    setTitle,
    description,
    setDescription,
    handleSubmit,
    dueDate,
    setDueDate,
    addTaskMutation,
  } = useTasksForm({
    initialData,
    mode,
    openDialog,
    triggerSubmit,
    setTriggerSubmit,
  });

  return (
    <form
      className={cn("grid items-start gap-6", className)}
      onSubmit={handleSubmit}
    >
      <InputBox
        label="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter task title"
        id="title"
      />
      <InputBox
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add task description (optional)"
        id="description"
      />
      <AssociatedGoal
        associatedGoal={associatedGoal}
        setAssociatedGoal={setAssociatedGoal}
      />
      <DueDateAndTime
        time={time}
        setTime={setTime}
        date={dueDate}
        setDate={setDueDate}
      />
      <SubTasks
        subtasks={subtasks}
        newSubtask={newSubtask}
        setNewSubtask={setNewSubtask}
        addSubtask={addSubtask}
        removeSubtask={removeSubtask}
      />
      <RecurringTask
        isRecurring={isRecurring}
        setIsRecurring={setIsRecurring}
        frequency={frequency}
        setFrequency={setFrequency}
      />
      <Priority priority={priority} setPriority={setPriority} />
      <Button type="submit" className="hidden md:block">
        {!addTaskMutation.isPending &&
          (mode === "edit" ? "Update Task" : "Add Task")}
        {addTaskMutation.isPending &&
          (mode === "edit" ? "Updating..." : "Adding...")}
      </Button>
    </form>
  );
}
