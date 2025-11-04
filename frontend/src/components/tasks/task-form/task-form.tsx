"use client";

import { cn } from "@/lib/utils";
import { ComponentProps } from "react";
import AssociatedGoal from "./associated-goal";
import useTasksForm from "@/hooks/use-tasks-form";
import DueDateAndTime from "./due-date-and-time";
import SubTasks from "./sub-tasks";
import RecurringTask from "./recurring-task";
import Priority from "./priority";
import InputBox from "@/components/ui/input-box";

interface AddTaskFormProps extends ComponentProps<"form"> {
  taskForm: ReturnType<typeof useTasksForm>;
}

export default function TaskForm({ className, taskForm }: AddTaskFormProps) {
  const { formData, setters, subtasks, handleSubmit } = taskForm;

  return (
    <form
      id="task-form"
      className={cn("grid items-start gap-6 pb-3 md:pb-2", className)}
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
        mode={taskForm.mode}
        defaultValue="Today"
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
        recurringMasterId={formData.recurringMasterId}
        setRecurringMasterId={setters.setRecurringMasterId}
      />
      <Priority
        priority={formData.priority}
        setPriority={setters.setPriority}
      />
    </form>
  );
}
