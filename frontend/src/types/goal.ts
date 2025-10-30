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
