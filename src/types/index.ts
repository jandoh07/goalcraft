export interface Goal {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  dueDate?: Date;
  status: "in-progress" | "completed" | "archived";
  progress?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type AssociatedGoal = {
  id: string;
  title: string;
} | null;

export interface Task {
  id?: string;
  userId: string;
  goalId?: string;
  associatedGoal: AssociatedGoal;
  title: string;
  description?: string;
  dueDate?: Date;
  time?: string;
  priority?: "high" | "medium" | "low" | "";
  status: "in-progress" | "completed";
  subtasks?: string[];
  isRecurring?: boolean;
  frequency?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PresetType = "deleteGoal" | "deleteTask";

export type GoalCategory =
  | "Health & Fitness"
  | "Career"
  | "Relationships"
  | "Finance"
  | "Education"
  | "Hobbies";
