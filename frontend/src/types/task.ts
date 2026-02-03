export type AssociatedGoal = {
  goalId: string;
  goalTitle: string;
} | null;

export type SubTask = {
  id: string;
  title: string;
  completed: boolean;
};

export type TaskStatus = "in-progress" | "completed" | "archived";

export interface Task {
  id?: string;
  userId: string;
  goalId?: string;
  goalTitle?: string;
  goalCategory?: string;
  title: string;
  description?: string;
  dueDate?: Date | null;
  time?: string;
  priority?: "high" | "medium" | "low" | "" | null;
  status: TaskStatus;
  subtasks?: SubTask[];
  frequency?: string;
  nextRun?: Date;
  timeZone?: string;
  recurringMasterId?: string;
  // Eisenhower Matrix tags
  isImportant?: boolean;
  isUrgent?: boolean;
  // Order for drag-and-drop sorting
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}
