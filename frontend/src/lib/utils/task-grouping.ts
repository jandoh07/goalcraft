import { Task } from "@/types";

export type TaskGroup =
  | "overdue"
  | "today"
  | "tomorrow"
  | "this-week"
  | "later"
  | "no-date";

export interface GroupedTasks {
  overdue: Task[];
  today: Task[];
  tomorrow: Task[];
  "this-week": Task[];
  later: Task[];
  "no-date": Task[];
}

/**
 * Groups tasks based on their due dates
 * @param tasks - Array of tasks to group
 * @returns Grouped tasks object
 */
export const groupTasksByDate = (tasks: Task[]): GroupedTasks => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const endOfWeek = new Date(today);
  // Get the next Sunday (or current if today is Sunday)
  const daysUntilSunday = 7 - today.getDay();
  endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);

  const grouped: GroupedTasks = {
    overdue: [],
    today: [],
    tomorrow: [],
    "this-week": [],
    later: [],
    "no-date": [],
  };

  tasks.forEach((task) => {
    // Skip completed tasks
    // if (task.status === "completed") {
    //   return;
    // }

    // Handle tasks without due dates
    if (!task.dueDate) {
      grouped["no-date"].push(task);
      return;
    }

    const dueDate = new Date(task.dueDate);
    const dueDateOnly = new Date(
      dueDate.getFullYear(),
      dueDate.getMonth(),
      dueDate.getDate()
    );

    if (dueDateOnly < today) {
      grouped.overdue.push(task);
    } else if (dueDateOnly.getTime() === today.getTime()) {
      grouped.today.push(task);
    } else if (dueDateOnly.getTime() === tomorrow.getTime()) {
      grouped.tomorrow.push(task);
    } else if (dueDateOnly <= endOfWeek) {
      grouped["this-week"].push(task);
    } else {
      grouped.later.push(task);
    }
  });

  return grouped;
};

/**
 * Gets the display label for a task group
 * @param group - The task group type
 * @param count - Number of tasks in the group
 * @returns Display label string
 */
export const getGroupLabel = (group: TaskGroup, count: number): string => {
  const labels: Record<TaskGroup, string> = {
    overdue: `Overdue (${count})`,
    today: `Today (${count})`,
    tomorrow: `Tomorrow (${count})`,
    "this-week": `This Week (${count})`,
    later: `Later (${count})`,
    "no-date": `No Date (${count})`,
  };
  return labels[group];
};

/**
 * Determines the task type based on its due date
 * @param dueDate - The task's due date
 * @returns The task group type
 */
export const getTaskType = (dueDate?: Date): TaskGroup => {
  if (!dueDate) return "no-date";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const endOfWeek = new Date(today);
  const daysUntilSunday = 7 - today.getDay();
  endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);

  const dueDateOnly = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );

  if (dueDateOnly < today) {
    return "overdue";
  } else if (dueDateOnly.getTime() === today.getTime()) {
    return "today";
  } else if (dueDateOnly.getTime() === tomorrow.getTime()) {
    return "tomorrow";
  } else if (dueDateOnly <= endOfWeek) {
    return "this-week";
  } else {
    return "later";
  }
};
