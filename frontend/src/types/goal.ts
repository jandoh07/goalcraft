export interface Goal {
  id?: string;
  userId: string;
  title: string;
  relevance?: string;
  category: string;
  dueDate?: Date;
  status: "in-progress" | "completed";
  progress?: number;
  milestones?: Milestone[];
  nonNegotiables?: NonNegotiable[];
  totalTasks?: number;
  completedTasks?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NonNegotiable {
  id: string;
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
  | "PersonalGrowth"
  | "Productivity";
