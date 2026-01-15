import { create } from "zustand";
import {
  Phase1Data,
  GoalCreationPhase,
  ChatDisplayMessage,
  ChatHistoryMessage,
} from "@/types";

interface GoalCreationState {
  // Current phase
  phase: GoalCreationPhase;

  // Phase 1 data (can be filled by AI or manually)
  phase1Data: Phase1Data;

  // Chat state
  messages: ChatDisplayMessage[];
  chatHistory: ChatHistoryMessage[];
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

  // Chat actions
  addMessage: (message: ChatDisplayMessage) => void;
  setChatHistory: (history: ChatHistoryMessage[]) => void;
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

const initialState: GoalCreationState = {
  phase: "phase1",
  phase1Data: initialPhase1Data,
  messages: [],
  chatHistory: [],
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

  // Chat actions
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setChatHistory: (history) => set({ chatHistory: history }),

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
