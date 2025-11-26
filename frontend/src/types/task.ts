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
  dueDate?: Date | null;
  time?: string;
  priority?: "high" | "medium" | "low" | "" | null;
  status: "in-progress" | "completed";
  subtasks?: SubTask[];
  frequency?: string;
  nextRun?: Date;
  timeZone?: string;
  recurringMasterId?: string;
  createdAt: Date;
  updatedAt: Date;
}
