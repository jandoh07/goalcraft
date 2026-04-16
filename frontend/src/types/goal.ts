export interface Goal {
  id: string;
  title: string;
  progress: number;
  status: "in-progress" | "completed";
  dueDate: Date;
  why: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "custom";
export type Weekday = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type NonNegotiable = {
  id: string;
  title: string;
  goalId: string;
  previousInstanceId?: string;
  status: "in-progress" | "completed";
  completedAt?: Date | null;
  showAfter?: Date;
  frequency: RecurrenceFrequency;
  customDays: Weekday[];
};

export type NonNegotiableTask = {
  id: string;
  userId: string;
  title: string;
  duration: number;
  status: "in-progress" | "completed";
  completedAt?: Date | null;
};

export type InProgressNonNegotiableWithTasks = {
  goalId: string;
  nonNegotiable: NonNegotiable & { nonegotiableId: string };
  tasks: NonNegotiableTask[];
};

export type Milestone = {
  id: string;
  title: string;
  weight: string;
  status: "in-progress" | "completed";
};

export interface GoalData {
  title: string;
  dueDate: string;
  why: string;
  nonNegotiables: NonNegotiable[];
  milestones: Milestone[];
}

export interface UpdateGoalWithRelationsPayload {
  goalId: string;
  originalData: GoalData;
  nextData: GoalData;
}
