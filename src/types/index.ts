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

export interface Task {
  id?: string;
  userId: string;
  goalId?: string;
  associatedGoal?: string;
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
