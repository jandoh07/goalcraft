/**
 * Types for AI-powered goal creation chat
 */

export type AIModel = "basic" | "pro";

export type ThinkingLevel = "MINIMAL" | "LOW" | "MEDIUM" | "HIGH";

/**
 * Message content part - matches Genkit's format
 */
export interface ChatMessageContent {
  text: string;
}

/**
 * Chat message format that matches what the backend expects
 */
export interface ChatHistoryMessage {
  role: "user" | "model";
  content: ChatMessageContent[];
}

/**
 * Display-friendly message format for the UI
 */
export interface ChatDisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * Phase 1 output schema - matches the prompt output
 */
export interface Phase1Output {
  title: string | null;
  category: string | null;
  duration: string | null;
  comments: string;
  follow_up?: string;
}

/**
 * Phase 1 API response
 */
export interface Phase1Response {
  output: Phase1Output;
  history: ChatHistoryMessage[];
}

/**
 * Goal creation phases
 */
export type GoalCreationPhase =
  | "phase1" // Title, Category, Duration
  | "phase2" // Why statement
  | "phase3" // Milestones
  | "phase4"; // Tasks

/**
 * Phase 1 completed data that gets passed to the next phase
 */
export interface Phase1Data {
  title: string;
  category: string;
  duration: string;
}

/**
 * State for the goal AI chat
 */
export interface GoalAIChatState {
  phase: GoalCreationPhase;
  isLoading: boolean;
  error: string | null;
  messages: ChatDisplayMessage[];
  history: ChatHistoryMessage[];
  phase1Data: Phase1Data | null;
}
