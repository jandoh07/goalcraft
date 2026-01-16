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
 * Phase 2 output schema - matches the prompt output
 */
export interface Phase2Output {
  why_statement?: string;
  comments?: string;
  skipped: boolean;
}

/**
 * Phase 2 API response
 */
export interface Phase2Response {
  output: Phase2Output;
  history: ChatHistoryMessage[];
}

/**
 * AI-generated milestone object (for goal creation flow)
 */
export interface AIMilestone {
  title: string;
  description: string;
  weight: number; // Percentage contribution to goal (0-100, all milestones should sum to 100)
}

/**
 * Phase 3 output schema - matches the prompt output
 */
export interface Phase3Output {
  milestones?: AIMilestone[];
  comments?: string;
  follow_up?: string;
}

/**
 * Phase 3 API response
 */
export interface Phase3Response {
  output: Phase3Output;
  history: ChatHistoryMessage[];
}

/**
 * One-time task object
 */
export interface OneTimeTask {
  title: string;
  description: string;
}

/**
 * Non-negotiable (recurring task) object
 */
export interface NonNegotiable {
  title: string;
  description: string;
  frequency: string;
}

/**
 * Phase 4 output schema - matches the prompt output
 */
export interface Phase4Output {
  oneTimeTasks?: OneTimeTask[];
  nonNegotiables?: NonNegotiable[];
  comments?: string;
  follow_up?: string;
}

/**
 * Phase 4 API response
 */
export interface Phase4Response {
  output: Phase4Output;
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
 * Phase 2 completed data
 */
export interface Phase2Data {
  whyStatement: string;
  skipped: boolean;
}

/**
 * Phase 3 completed data
 */
export interface Phase3Data {
  milestones: AIMilestone[];
}

/**
 * Phase 4 completed data
 */
export interface Phase4Data {
  oneTimeTasks: OneTimeTask[];
  nonNegotiables: NonNegotiable[];
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
