export type AssociatedGoal = {
  goalId: string;
  goalTitle: string;
} | null;

export type SubTask = {
  id: string;
  title: string;
  completed: boolean;
};

export interface Task {
  id?: string;
  userId: string;
  goalId?: string;
  goalTitle?: string;
  goalCategory?: string;
  title: string;
  description?: string;
  dueDate?: Date;
  time?: string;
  priority?: "high" | "medium" | "low" | "";
  status: "in-progress" | "completed";
  subtasks?: SubTask[];
  isRecurring?: boolean;
  frequency?: string;
  nextRun?: Date;
  timeZone?: string;
  recurringStatus?: "active" | "paused";
  recurringMasterId?: string;
  createdAt: Date;
  updatedAt: Date;
}
