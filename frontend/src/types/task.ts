export type SubTask = {
  id: string;
  title: string;
  completed: boolean;
};

export type TaskStatus = "in-progress" | "completed" | "archived";

export interface Task {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: Date | null;
  time?: string;
  status: TaskStatus;
  completedAt?: Date | null;
  subtasks?: SubTask[];
  frequency?: string;
  recurringMasterId?: string;
  isImportant?: boolean;
  isUrgent?: boolean;
  tags?: string[];
  order?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskGroup =
  | "overdue"
  | "today"
  | "tomorrow"
  | "upcoming"
  | "no-date"
  | "completed";