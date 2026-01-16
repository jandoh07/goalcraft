import { create } from "zustand";
import {
  Phase1Data,
  Phase2Data,
  GoalCreationPhase,
  ChatDisplayMessage,
  ChatHistoryMessage,
} from "@/types";

interface GoalCreationState {
  // Current phase
  phase: GoalCreationPhase;

  // Phase 1 data (can be filled by AI or manually)
  phase1Data: Phase1Data;

  // Phase 2 data (why statement)
  phase2Data: Phase2Data;

  // Chat state (separate for each phase)
  messages: ChatDisplayMessage[];
  chatHistory: ChatHistoryMessage[];
  phase2Messages: ChatDisplayMessage[];
  phase2ChatHistory: ChatHistoryMessage[];
  isLoading: boolean;
  error: string | null;

  // UI state
  isDataPanelOpen: boolean;
}

interface GoalCreationActions {
  // Phase navigation
  setPhase: (phase: GoalCreationPhase) => void;
  nextPhase: () => void;
  prevPhase: () => void;

  // Phase 1 data updates
  updatePhase1Data: (data: Partial<Phase1Data>) => void;
  setPhase1Data: (data: Phase1Data) => void;

  // Phase 2 data updates
  updatePhase2Data: (data: Partial<Phase2Data>) => void;
  setPhase2Data: (data: Phase2Data) => void;

  // Chat actions (Phase 1)
  addMessage: (message: ChatDisplayMessage) => void;
  setChatHistory: (history: ChatHistoryMessage[]) => void;

  // Chat actions (Phase 2)
  addPhase2Message: (message: ChatDisplayMessage) => void;
  setPhase2ChatHistory: (history: ChatHistoryMessage[]) => void;

  // Shared chat state
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // UI actions
  setDataPanelOpen: (open: boolean) => void;
  toggleDataPanel: () => void;

  // Reset
  reset: () => void;
}

const initialPhase1Data: Phase1Data = {
  title: "",
  category: "",
  duration: "",
};

const initialPhase2Data: Phase2Data = {
  whyStatement: "",
  skipped: false,
};

const initialState: GoalCreationState = {
  phase: "phase1",
  phase1Data: initialPhase1Data,
  phase2Data: initialPhase2Data,
  messages: [],
  chatHistory: [],
  phase2Messages: [],
  phase2ChatHistory: [],
  isLoading: false,
  error: null,
  isDataPanelOpen: false,
};

export const useGoalCreationStore = create<
  GoalCreationState & GoalCreationActions
>((set, get) => ({
  ...initialState,

  // Phase navigation
  setPhase: (phase) => set({ phase }),

  nextPhase: () => {
    const { phase } = get();
    const phases: GoalCreationPhase[] = [
      "phase1",
      "phase2",
      "phase3",
      "phase4",
    ];
    const currentIndex = phases.indexOf(phase);
    if (currentIndex < phases.length - 1) {
      set({ phase: phases[currentIndex + 1] });
    }
  },

  prevPhase: () => {
    const { phase } = get();
    const phases: GoalCreationPhase[] = [
      "phase1",
      "phase2",
      "phase3",
      "phase4",
    ];
    const currentIndex = phases.indexOf(phase);
    if (currentIndex > 0) {
      set({ phase: phases[currentIndex - 1] });
    }
  },

  // Phase 1 data updates
  updatePhase1Data: (data) =>
    set((state) => ({
      phase1Data: { ...state.phase1Data, ...data },
    })),

  setPhase1Data: (data) => set({ phase1Data: data }),

  // Phase 2 data updates
  updatePhase2Data: (data) =>
    set((state) => ({
      phase2Data: { ...state.phase2Data, ...data },
    })),

  setPhase2Data: (data) => set({ phase2Data: data }),

  // Chat actions (Phase 1)
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setChatHistory: (history) => set({ chatHistory: history }),

  // Chat actions (Phase 2)
  addPhase2Message: (message) =>
    set((state) => ({
      phase2Messages: [...state.phase2Messages, message],
    })),

  setPhase2ChatHistory: (history) => set({ phase2ChatHistory: history }),

  // Shared chat state
  setIsLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  // UI actions
  setDataPanelOpen: (open) => set({ isDataPanelOpen: open }),

  toggleDataPanel: () =>
    set((state) => ({ isDataPanelOpen: !state.isDataPanelOpen })),

  // Reset
  reset: () => set(initialState),
}));

/**
 * Check if Phase 1 is complete (all required fields filled)
 */
export const isPhase1Valid = (data: Phase1Data): boolean => {
  return !!(data.title.trim() && data.category.trim() && data.duration.trim());
};

/**
 * Check if Phase 2 is complete (why statement provided or skipped)
 */
export const isPhase2Valid = (data: Phase2Data): boolean => {
  return data.skipped || !!data.whyStatement.trim();
};
