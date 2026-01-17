import { ChatDisplayMessage, ChatHistoryMessage } from "./ai-goal-chat";

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
  totalTasks?: number;
  completedTasks?: number;
  createdAt: Date;
  updatedAt: Date;
  // AI chat data (for continuing conversations)
  aiChatHistory?: {
    phase1: ChatHistoryMessage[];
    phase2: ChatHistoryMessage[];
    phase3: ChatHistoryMessage[];
    phase4: ChatHistoryMessage[];
  };
  aiDisplayMessages?: {
    phase1: ChatDisplayMessage[];
    phase2: ChatDisplayMessage[];
    phase3: ChatDisplayMessage[];
    phase4: ChatDisplayMessage[];
  };
}

export interface Milestone {
  id?: string;
  title: string;
  description?: string;
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
