import { useState, useCallback, useRef } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/firebase";
import {
  ThinkingLevel,
  ChatDisplayMessage,
  ChatHistoryMessage,
  Phase1Output,
  Phase1Response,
  Phase1Data,
  GoalCreationPhase,
} from "@/types";

interface UseGoalAIChatOptions {
  onPhase1Complete?: (data: Phase1Data) => void;
}

/**
 * Hook for managing AI-powered goal creation chat (Phase 1)
 */
export function useGoalAIChat(options: UseGoalAIChatOptions = {}) {
  // Keep callback in ref to avoid dependency issues
  const onPhase1CompleteRef = useRef(options.onPhase1Complete);
  onPhase1CompleteRef.current = options.onPhase1Complete;

  // State
  const [phase, setPhase] = useState<GoalCreationPhase>("phase1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatDisplayMessage[]>([]);
  const [phase1Data, setPhase1Data] = useState<Phase1Data | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>("");

  // Keep history in ref to avoid re-renders during streaming
  const historyRef = useRef<ChatHistoryMessage[]>([]);

  /**
   * Generate a unique message ID
   */
  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Add a message to the display
   */
  const addMessage = useCallback(
    (role: "user" | "assistant", content: string): ChatDisplayMessage => {
      const message: ChatDisplayMessage = {
        id: generateMessageId(),
        role,
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, message]);
      return message;
    },
    []
  );

  /**
   * Extract display text from Phase 1 output
   */
  const formatPhase1Response = (output: Phase1Output): string => {
    const parts: string[] = [];

    // Add the comment/explanation
    if (output.comments) {
      parts.push(output.comments);
    }

    // Show the extracted metadata if available
    if (output.title && output.category && output.duration) {
      parts.push("");
      parts.push(`**Goal:** ${output.title}`);
      parts.push(`**Category:** ${output.category}`);
      parts.push(`**Duration:** ${output.duration}`);
    }

    // Add follow-up question if present
    if (output.follow_up) {
      parts.push("");
      parts.push(output.follow_up);
    }

    return parts.join("\n");
  };

  /**
   * Check if Phase 1 is complete (all required fields present and no follow-up)
   */
  const isPhase1Complete = (output: Phase1Output): boolean => {
    return !!(
      output.title &&
      output.category &&
      output.duration &&
      !output.follow_up
    );
  };

  /**
   * Send a message in Phase 1 (goal title, category, duration)
   */
  const sendPhase1Message = useCallback(
    async (userMessage: string, thinkingLevel: ThinkingLevel = "LOW") => {
      if (!userMessage.trim()) {
        setError("Please enter a message");
        return;
      }

      setIsLoading(true);
      setError(null);
      setStreamingContent("");

      // Add user message to display
      addMessage("user", userMessage);

      try {
        const goalPhase1 = httpsCallable<
          {
            userGist: string;
            thinkingLevel: ThinkingLevel;
            history?: ChatHistoryMessage[];
          },
          Phase1Response
        >(functions, "goalPhase1");

        const result = await goalPhase1({
          userGist: userMessage,
          thinkingLevel,
          history: historyRef.current,
        });

        const { output, history } = result.data;

        // Update history ref
        historyRef.current = history;

        // Format and add assistant response
        const responseText = formatPhase1Response(output);
        addMessage("assistant", responseText);

        // Check if Phase 1 is complete
        if (isPhase1Complete(output)) {
          const completedData: Phase1Data = {
            title: output.title!,
            category: output.category!,
            duration: output.duration!,
          };
          setPhase1Data(completedData);
          onPhase1CompleteRef.current?.(completedData);
        }

        return output;
      } catch (err) {
        console.error("Error in Phase 1:", err);
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        addMessage(
          "assistant",
          "Sorry, I encountered an error. Please try again."
        );
      } finally {
        setIsLoading(false);
        setStreamingContent("");
      }
    },
    [addMessage]
  );

  /**
   * Confirm and proceed with Phase 1 data (accepts edited data from UI)
   */
  const confirmPhase1 = useCallback(
    (editedData?: Phase1Data) => {
      const dataToUse = editedData || phase1Data;
      if (dataToUse) {
        setPhase("phase2");
        setPhase1Data(dataToUse);
        onPhase1CompleteRef.current?.(dataToUse);
      }
    },
    [phase1Data]
  );

  /**
   * Reset the chat to start over
   */
  const reset = useCallback(() => {
    setPhase("phase1");
    setIsLoading(false);
    setError(null);
    setMessages([]);
    setPhase1Data(null);
    setStreamingContent("");
    historyRef.current = [];
  }, []);

  return {
    // State
    phase,
    isLoading,
    error,
    messages,
    phase1Data,
    streamingContent,

    // Actions
    sendPhase1Message,
    confirmPhase1,
    reset,

    // Helpers
    isPhase1Complete: phase1Data !== null,
  };
}
