export interface Goal {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  dueDate?: Date;
  status: "active" | "completed" | "archived";
  progress?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id?: string;
  userId: string;
  goalId?: string;
  title: string;
  description?: string;
  dueDate?: Date;
  time?: string;
  priority?: "high" | "medium" | "low";
  status: "pending" | "completed";
  subtasks?: string[];
  isRecurring?: boolean;
  frequency?: string;
  createdAt: Date;
  updatedAt: Date;
}
