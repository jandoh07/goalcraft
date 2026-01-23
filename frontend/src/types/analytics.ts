import { Goal } from "./goal";
import { Task } from "./task";

export interface ContributionData {
  [dateKey: string]: number;
}

export interface AnalyticsStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  activeGoals: number;
  completedGoals: number;
  currentStreak: number;
  longestStreak: number;
  thisWeekCompleted: number;
  lastWeekCompleted: number;
  weeklyGrowth: number;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
}

export interface GoalProgressItemProps {
  goal: Goal;
}

export interface ContributionHeatmapProps {
  tasks: Task[];
  useDummyData?: boolean;
  year: number;
}
