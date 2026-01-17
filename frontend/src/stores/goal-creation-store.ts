import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Phase1Data,
  Phase2Data,
  Phase3Data,
  Phase4Data,
  AIMilestone,
  OneTimeTask,
  NonNegotiable,
  GoalCreationPhase,
  ChatDisplayMessage,
  ChatHistoryMessage,
  Goal,
} from "@/types";

interface GoalCreationState {
  // Current phase
  phase: GoalCreationPhase;

  // Edit mode - if set, we're editing an existing goal
  editingGoalId: string | null;

  // Hash of original data when editing (to detect actual changes)
  editingOriginalHash: string | null;

  // Phase 1 data (can be filled by AI or manually)
  phase1Data: Phase1Data;

  // Phase 2 data (why statement)
  phase2Data: Phase2Data;

  // Phase 3 data (milestones)
  phase3Data: Phase3Data;

  // Phase 4 data (one-time tasks + non-negotiables)
  phase4Data: Phase4Data;

  // Chat state (separate for each phase)
  messages: ChatDisplayMessage[];
  chatHistory: ChatHistoryMessage[];
  phase2Messages: ChatDisplayMessage[];
  phase2ChatHistory: ChatHistoryMessage[];
  phase3Messages: ChatDisplayMessage[];
  phase3ChatHistory: ChatHistoryMessage[];
  phase4Messages: ChatDisplayMessage[];
  phase4ChatHistory: ChatHistoryMessage[];
  isLoading: boolean;
  error: string | null;

  // UI state
  isDataPanelOpen: boolean;
}

// Export GoalCreationState type for use in hasUnsavedChanges
export type { GoalCreationState };

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

  // Phase 3 data updates
  updatePhase3Data: (data: Partial<Phase3Data>) => void;
  setPhase3Data: (data: Phase3Data) => void;
  addMilestone: (milestone: AIMilestone) => void;
  updateMilestone: (index: number, milestone: AIMilestone) => void;
  removeMilestone: (index: number) => void;

  // Phase 4 data updates
  updatePhase4Data: (data: Partial<Phase4Data>) => void;
  setPhase4Data: (data: Phase4Data) => void;
  addOneTimeTask: (task: OneTimeTask) => void;
  updateOneTimeTask: (index: number, task: OneTimeTask) => void;
  removeOneTimeTask: (index: number) => void;
  addNonNegotiable: (task: NonNegotiable) => void;
  updateNonNegotiable: (index: number, task: NonNegotiable) => void;
  removeNonNegotiable: (index: number) => void;

  // Chat actions (Phase 1)
  addMessage: (message: ChatDisplayMessage) => void;
  setChatHistory: (history: ChatHistoryMessage[]) => void;

  // Chat actions (Phase 2)
  addPhase2Message: (message: ChatDisplayMessage) => void;
  setPhase2ChatHistory: (history: ChatHistoryMessage[]) => void;

  // Chat actions (Phase 3)
  addPhase3Message: (message: ChatDisplayMessage) => void;
  setPhase3ChatHistory: (history: ChatHistoryMessage[]) => void;

  // Chat actions (Phase 4)
  addPhase4Message: (message: ChatDisplayMessage) => void;
  setPhase4ChatHistory: (history: ChatHistoryMessage[]) => void;

  // Shared chat state
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // UI actions
  setDataPanelOpen: (open: boolean) => void;
  toggleDataPanel: () => void;

  // Initialize from existing goal (for edit mode)
  initializeFromGoal: (goal: Goal) => void;

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

const initialPhase3Data: Phase3Data = {
  milestones: [],
};

const initialPhase4Data: Phase4Data = {
  oneTimeTasks: [],
  nonNegotiables: [],
};

/**
 * Compute a simple hash of the relevant state for change detection
 */
const computeStateHash = (state: GoalCreationState): string => {
  const relevantData = {
    phase1Data: state.phase1Data,
    phase2Data: state.phase2Data,
    phase3Data: state.phase3Data,
    phase4Data: state.phase4Data,
    messagesCount: state.messages.length,
    phase2MessagesCount: state.phase2Messages.length,
    phase3MessagesCount: state.phase3Messages.length,
    phase4MessagesCount: state.phase4Messages.length,
  };
  return JSON.stringify(relevantData);
};

const initialState: GoalCreationState = {
  phase: "phase1",
  editingGoalId: null,
  editingOriginalHash: null,
  phase1Data: initialPhase1Data,
  phase2Data: initialPhase2Data,
  phase3Data: initialPhase3Data,
  phase4Data: initialPhase4Data,
  messages: [],
  chatHistory: [],
  phase2Messages: [],
  phase2ChatHistory: [],
  phase3Messages: [],
  phase3ChatHistory: [],
  phase4Messages: [],
  phase4ChatHistory: [],
  isLoading: false,
  error: null,
  isDataPanelOpen: false,
};

export const useGoalCreationStore = create<
  GoalCreationState & GoalCreationActions
>()(
  persist(
    (set, get) => ({
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

      // Phase 3 data updates
      updatePhase3Data: (data) =>
        set((state) => ({
          phase3Data: { ...state.phase3Data, ...data },
        })),

      setPhase3Data: (data) => set({ phase3Data: data }),

      addMilestone: (milestone) =>
        set((state) => ({
          phase3Data: {
            ...state.phase3Data,
            milestones: [
              ...state.phase3Data.milestones,
              { ...milestone, weight: milestone.weight ?? 0 },
            ],
          },
        })),

      updateMilestone: (index, milestone) =>
        set((state) => ({
          phase3Data: {
            ...state.phase3Data,
            milestones: state.phase3Data.milestones.map((m, i) =>
              i === index ? milestone : m
            ),
          },
        })),

      removeMilestone: (index) =>
        set((state) => ({
          phase3Data: {
            ...state.phase3Data,
            milestones: state.phase3Data.milestones.filter(
              (_, i) => i !== index
            ),
          },
        })),

      // Phase 4 data updates
      updatePhase4Data: (data) =>
        set((state) => ({
          phase4Data: { ...state.phase4Data, ...data },
        })),

      setPhase4Data: (data) => set({ phase4Data: data }),

      addOneTimeTask: (task) =>
        set((state) => ({
          phase4Data: {
            ...state.phase4Data,
            oneTimeTasks: [...state.phase4Data.oneTimeTasks, task],
          },
        })),

      updateOneTimeTask: (index, task) =>
        set((state) => ({
          phase4Data: {
            ...state.phase4Data,
            oneTimeTasks: state.phase4Data.oneTimeTasks.map((t, i) =>
              i === index ? task : t
            ),
          },
        })),

      removeOneTimeTask: (index) =>
        set((state) => ({
          phase4Data: {
            ...state.phase4Data,
            oneTimeTasks: state.phase4Data.oneTimeTasks.filter(
              (_, i) => i !== index
            ),
          },
        })),

      addNonNegotiable: (task) =>
        set((state) => ({
          phase4Data: {
            ...state.phase4Data,
            nonNegotiables: [...state.phase4Data.nonNegotiables, task],
          },
        })),

      updateNonNegotiable: (index, task) =>
        set((state) => ({
          phase4Data: {
            ...state.phase4Data,
            nonNegotiables: state.phase4Data.nonNegotiables.map((t, i) =>
              i === index ? task : t
            ),
          },
        })),

      removeNonNegotiable: (index) =>
        set((state) => ({
          phase4Data: {
            ...state.phase4Data,
            nonNegotiables: state.phase4Data.nonNegotiables.filter(
              (_, i) => i !== index
            ),
          },
        })),

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

      // Chat actions (Phase 3)
      addPhase3Message: (message) =>
        set((state) => ({
          phase3Messages: [...state.phase3Messages, message],
        })),

      setPhase3ChatHistory: (history) => set({ phase3ChatHistory: history }),

      // Chat actions (Phase 4)
      addPhase4Message: (message) =>
        set((state) => ({
          phase4Messages: [...state.phase4Messages, message],
        })),

      setPhase4ChatHistory: (history) => set({ phase4ChatHistory: history }),

      // Shared chat state
      setIsLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      // UI actions
      setDataPanelOpen: (open) => set({ isDataPanelOpen: open }),

      toggleDataPanel: () =>
        set((state) => ({ isDataPanelOpen: !state.isDataPanelOpen })),

      // Initialize from existing goal (for edit mode)
      initializeFromGoal: (goal: Goal) => {
        const newState = {
          editingGoalId: goal.id || null,
          phase: "phase1" as GoalCreationPhase,
          phase1Data: {
            title: goal.title,
            category: goal.category,
            duration: "", // Duration is not stored in Goal, will need to be re-set or derived from dueDate
          },
          phase2Data: {
            whyStatement: goal.relevance || "",
            skipped: !goal.relevance,
          },
          phase3Data: {
            milestones: (goal.milestones || []).map((m) => ({
              title: m.title,
              description: m.description || "",
              weight: m.weight,
            })),
          },
          phase4Data: {
            oneTimeTasks: [] as OneTimeTask[],
            nonNegotiables: [] as NonNegotiable[],
          },
          // Restore chat history if available
          messages: goal.aiDisplayMessages?.phase1 || [],
          chatHistory: goal.aiChatHistory?.phase1 || [],
          phase2Messages: goal.aiDisplayMessages?.phase2 || [],
          phase2ChatHistory: goal.aiChatHistory?.phase2 || [],
          phase3Messages: goal.aiDisplayMessages?.phase3 || [],
          phase3ChatHistory: goal.aiChatHistory?.phase3 || [],
          phase4Messages: goal.aiDisplayMessages?.phase4 || [],
          phase4ChatHistory: goal.aiChatHistory?.phase4 || [],
          isLoading: false,
          error: null,
          isDataPanelOpen: false,
        };

        // Compute hash of the initial state to detect actual changes later
        const editingOriginalHash = computeStateHash(
          newState as GoalCreationState
        );

        set({ ...newState, editingOriginalHash });
      },

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: "goal-creation-draft",
      // Only persist data fields, not transient UI state
      partialize: (state) => ({
        phase: state.phase,
        editingGoalId: state.editingGoalId,
        editingOriginalHash: state.editingOriginalHash,
        phase1Data: state.phase1Data,
        phase2Data: state.phase2Data,
        phase3Data: state.phase3Data,
        phase4Data: state.phase4Data,
        messages: state.messages,
        chatHistory: state.chatHistory,
        phase2Messages: state.phase2Messages,
        phase2ChatHistory: state.phase2ChatHistory,
        phase3Messages: state.phase3Messages,
        phase3ChatHistory: state.phase3ChatHistory,
        phase4Messages: state.phase4Messages,
        phase4ChatHistory: state.phase4ChatHistory,
      }),
    }
  )
);

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

/**
 * Check if Phase 3 is complete (at least one milestone)
 */
export const isPhase3Valid = (data: Phase3Data): boolean => {
  return data.milestones.length > 0;
};

/**
 * Check if Phase 4 is complete (at least one task of either type)
 */
export const isPhase4Valid = (data: Phase4Data): boolean => {
  return data.oneTimeTasks.length > 0 || data.nonNegotiables.length > 0;
};

/**
 * Check if there are unsaved changes in any phase
 */
export const hasUnsavedChanges = (state: GoalCreationState): boolean => {
  // If we're in edit mode and have an original hash, compare against it
  if (state.editingGoalId && state.editingOriginalHash) {
    const currentHash = computeStateHash(state);
    return currentHash !== state.editingOriginalHash;
  }

  // For new goals, check if any data exists
  const {
    phase1Data,
    phase2Data,
    phase3Data,
    phase4Data,
    messages,
    phase2Messages,
    phase3Messages,
    phase4Messages,
  } = state;

  // Check Phase 1
  const hasPhase1Data = !!(
    phase1Data.title.trim() ||
    phase1Data.category.trim() ||
    phase1Data.duration.trim()
  );

  // Check Phase 2
  const hasPhase2Data = !!(
    phase2Data.whyStatement.trim() || phase2Data.skipped
  );

  // Check Phase 3
  const hasPhase3Data = phase3Data.milestones.length > 0;

  // Check Phase 4
  const hasPhase4Data =
    phase4Data.oneTimeTasks.length > 0 || phase4Data.nonNegotiables.length > 0;

  // Check if any chat messages exist (beyond initial system messages)
  const hasChatHistory =
    messages.length > 0 ||
    phase2Messages.length > 0 ||
    phase3Messages.length > 0 ||
    phase4Messages.length > 0;

  return (
    hasPhase1Data ||
    hasPhase2Data ||
    hasPhase3Data ||
    hasPhase4Data ||
    hasChatHistory
  );
};

/**
 * Calculate total weight of all milestones
 */
export const getTotalMilestoneWeight = (data: Phase3Data): number => {
  return data.milestones.reduce((sum, m) => sum + (m.weight || 0), 0);
};

/**
 * Check if milestone weights are valid (sum to 100)
 */
export const areMilestoneWeightsValid = (data: Phase3Data): boolean => {
  if (data.milestones.length === 0) return true;
  const total = getTotalMilestoneWeight(data);
  return total === 100;
};
