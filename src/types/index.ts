import { User } from "firebase/auth";

export interface Goal {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  dueDate?: Date;
  status: "in-progress" | "completed" | "archived";
  progress?: number;
  milestones?: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id?: string;
  title: string;
  weight: number;
  completed?: boolean;
}

export type AssociatedGoal = {
  goalId: string;
  goalTitle: string;
} | null;

export interface Task {
  id?: string;
  userId: string;
  goalId?: string;
  // associatedGoal: AssociatedGoal;
  goalTitle?: string;
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

export type UpdateGoalParams =
  | {
      goalId: string;
      updates: Partial<Goal>;
      milestone?: never;
    }
  | {
      goalId: string;
      updates?: never;
      milestone: {
        milestoneIndex: number;
        completed: boolean;
        progress: number;
      };
    };

export interface AppUser extends User {
  name?: string;
  subscription?: "free" | "premium";
  createdAt?: Date;
  theme?: "dark" | "light" | "system";
  pushNotifications?: boolean;
}
