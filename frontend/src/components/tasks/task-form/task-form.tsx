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
import { Form } from "@/components/ui/form";

interface AddTaskFormProps extends ComponentProps<"form"> {
  taskForm: ReturnType<typeof useTasksForm>;
}

export default function TaskForm({ className, taskForm }: AddTaskFormProps) {
  const { form, subtasks, onSubmit, mode } = taskForm;

  const title = form.watch("title");
  const description = form.watch("description");
  const associatedGoal = form.watch("associatedGoal");
  const dueDate = form.watch("dueDate");
  const time = form.watch("time");
  const priority = form.watch("priority");
  const isRecurring = form.watch("isRecurring");
  const frequency = form.watch("frequency");
  const recurringMasterId = form.watch("recurringMasterId");
  const stopRecurring = form.watch("stopRecurring");

  return (
    <Form {...form}>
      <form
        id="task-form"
        className={cn("grid items-start gap-6 pb-3 md:pb-2", className)}
        onSubmit={onSubmit}
      >
        <InputBox
          label="Task Title"
          value={title}
          onChange={(e) => form.setValue("title", e.target.value)}
          placeholder="Enter task title"
          id="title"
        />
        <InputBox
          label="Description"
          value={description || ""}
          onChange={(e) => form.setValue("description", e.target.value)}
          placeholder="Add task description (optional)"
          id="description"
        />
        <AssociatedGoal
          associatedGoal={associatedGoal ?? null}
          setAssociatedGoal={(value) => {
            if (typeof value === "function") {
              const currentValue = associatedGoal ?? null;
              const newValue = value(currentValue);
              form.setValue(
                "associatedGoal",
                newValue === null ? undefined : newValue
              );
            } else {
              form.setValue(
                "associatedGoal",
                value === null ? undefined : value
              );
            }
          }}
        />
        <DueDateAndTime
          time={time || ""}
          setTime={(value) => form.setValue("time", value)}
          date={dueDate}
          setDate={(value) => form.setValue("dueDate", value)}
          mode={mode}
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
          isRecurring={isRecurring ?? false}
          setIsRecurring={(value) => form.setValue("isRecurring", value)}
          frequency={frequency || ""}
          setFrequency={(value) => form.setValue("frequency", value)}
          recurringMasterId={recurringMasterId || ""}
          setStopRecurring={(value) => form.setValue("stopRecurring", value)}
          stopRecurring={stopRecurring ?? false}
        />
        <Priority
          priority={priority || ""}
          setPriority={(value) => {
            if (typeof value === "function") {
              const currentValue = priority || "";
              form.setValue("priority", value(currentValue));
            } else {
              form.setValue("priority", value);
            }
          }}
        />
      </form>
    </Form>
  );
}
