"use client";

import { useCallback, useRef } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/firebase";
import { ChatMessagesList } from "./chat-messages-list";
import { ChatInput } from "./chat-input";
import { GoalCreationLayout } from "./goal-creation-layout";
import { Phase2DataPanel } from "./phase2-data-panel";
import {
  ThinkingLevel,
  ChatDisplayMessage,
  ChatHistoryMessage,
  Phase2Output,
  Phase2Response,
} from "@/types";
import { useGoalCreationStore } from "@/stores/goal-creation-store";
import { useAuth } from "@/contexts/auth-context";
import { Heart, Target } from "lucide-react";

/**
 * Generate a unique message ID
 */
const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Extract display text from Phase 2 output
 */
const formatPhase2Response = (output: Phase2Output): string => {
  const parts: string[] = [];

  if (output.comments) {
    parts.push(output.comments);
  }

  if (output.why_statement) {
    parts.push("");
    parts.push(`**Your Why:** ${output.why_statement}`);
  }

  if (output.skipped) {
    parts.push("");
    parts.push(
      "No problem! You can always come back and add your motivation later."
    );
  }

  return parts.join("\n");
};

/**
 * Welcome message for Phase 2
 */
function Phase2WelcomeMessage({
  onQuickStart,
}: {
  onQuickStart?: (message: string) => void;
}) {
  const { phase1Data } = useGoalCreationStore();

  const QUICK_START_EXAMPLES = [
    "I want to feel proud of myself",
    "To prove I can do it",
    "For my family",
    "Skip - I'll figure it out later",
  ];

  return (
    <div className="flex-1 flex flex-col py-2 md:py-8 px-2 text-left space-y-6">
      {/* Goal context */}
      <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
        <Target className="size-4 text-primary" />
        <span className="text-sm font-medium">{phase1Data.title}</span>
      </div>

      <div className="space-y-2 w-full">
        <h3 className="font-semibold text-lg md:text-2xl flex items-center gap-2">
          <Heart className="size-6 text-red-500" />
          Why does this goal matter to you?
        </h3>
        <p className="text-muted-foreground max-w-sm text-left md:text-lg">
          Let&apos;s dig a little deeper. A powerful &quot;why&quot; becomes
          your anchor when motivation fades. What would achieving this goal
          really mean for you?
        </p>
      </div>

      {onQuickStart && (
        <div className="space-y-2 w-full max-w-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Try one of these:
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_START_EXAMPLES.map((example) => (
              <button
                key={example}
                onClick={() => onQuickStart(example)}
                className="text-sm px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Chat panel component for Phase 2 - handles the AI conversation about motivation
 */
function Phase2ChatPanel() {
  const {
    phase1Data,
    phase2Messages,
    phase2ChatHistory,
    chatHistory: phase1ChatHistory, // Get Phase 1 history for context
    isLoading,
    error,
    addPhase2Message,
    setPhase2ChatHistory,
    setIsLoading,
    setError,
    updatePhase2Data,
    nextPhase,
  } = useGoalCreationStore();

  const historyRef = useRef<ChatHistoryMessage[]>(phase2ChatHistory);
  historyRef.current = phase2ChatHistory;

  const sendMessage = useCallback(
    async (userMessage: string, thinkingLevel: ThinkingLevel = "LOW") => {
      if (!userMessage.trim()) {
        setError("Please enter a message");
        return;
      }

      // Handle skip request
      if (userMessage.toLowerCase().includes("skip")) {
        updatePhase2Data({ skipped: true, whyStatement: "" });
        nextPhase();
        return;
      }

      setIsLoading(true);
      setError(null);

      // Add user message
      const userMsg: ChatDisplayMessage = {
        id: generateMessageId(),
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      };
      addPhase2Message(userMsg);

      try {
        const goalPhase2 = httpsCallable<
          {
            title: string;
            category: string;
            duration: string;
            userMessage: string;
            thinkingLevel: ThinkingLevel;
            history?: ChatHistoryMessage[];
            previousPhaseHistory?: ChatHistoryMessage[];
          },
          Phase2Response
        >(functions, "goalPhase2");

        const result = await goalPhase2({
          title: phase1Data.title,
          category: phase1Data.category,
          duration: phase1Data.duration,
          userMessage,
          thinkingLevel,
          // Include current phase history + previous phase history for context
          history: historyRef.current,
          previousPhaseHistory: phase1ChatHistory,
        });

        const { output, history } = result.data;

        // Update chat history
        setPhase2ChatHistory(history);
        historyRef.current = history;

        // Add assistant response
        const assistantMsg: ChatDisplayMessage = {
          id: generateMessageId(),
          role: "assistant",
          content: formatPhase2Response(output),
          timestamp: new Date(),
        };
        addPhase2Message(assistantMsg);

        // Update Phase 2 data if AI provided values
        if (output.why_statement) {
          updatePhase2Data({
            whyStatement: output.why_statement,
            skipped: false,
          });
        } else if (!output.skipped && userMessage.trim()) {
          // If AI didn't return a why_statement but user provided a good response,
          // use the user's message as the why statement
          updatePhase2Data({
            whyStatement: userMessage.trim(),
            skipped: false,
          });
        }

        if (output.skipped) {
          updatePhase2Data({ skipped: true });
        }

        return output;
      } catch (err) {
        console.error("Error in Phase 2:", err);
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);

        const errorMsg: ChatDisplayMessage = {
          id: generateMessageId(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        addPhase2Message(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [
      phase1Data,
      phase1ChatHistory,
      addPhase2Message,
      setPhase2ChatHistory,
      setError,
      setIsLoading,
      updatePhase2Data,
      nextPhase,
    ]
  );

  const handleSend = useCallback(
    (message: string, thinkingLevel: ThinkingLevel) => {
      sendMessage(message, thinkingLevel);
    },
    [sendMessage]
  );

  const handleQuickStart = useCallback(
    (message: string) => {
      sendMessage(message, "LOW");
    },
    [sendMessage]
  );

  const { user } = useAuth();
  const isPremium = user?.subscription === "premium";

  const hasMessages = phase2Messages.length > 0;

  return (
    <div className="flex flex-col h-full flex-1 relative">
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto pb-40 md:pb-0 custom-scrollbar">
        {!hasMessages ? (
          <Phase2WelcomeMessage onQuickStart={handleQuickStart} />
        ) : (
          <ChatMessagesList messages={phase2Messages} isLoading={isLoading} />
        )}
      </div>

      {/* Input area - fixed to bottom */}
      <div className="sticky bottom-0 left-0 right-0 border-t bg-background">
        {/* Error message */}
        {error && (
          <div className="px-4 pt-2">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Chat input */}
        <div className="px-2 py-2 md:pb-0">
          <ChatInput
            onSend={handleSend}
            isLoading={isLoading}
            isPremium={isPremium}
            placeholder={
              hasMessages
                ? "Tell me more about your motivation..."
                : "Why does this goal matter to you?"
            }
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Main AI Goal Chat component for Phase 2 of goal creation
 * Two-column layout: Chat (70%) + Data Panel (30%)
 */
const AIGoalPhase2 = () => {
  return (
    <GoalCreationLayout
      chatPanel={<Phase2ChatPanel />}
      dataPanel={<Phase2DataPanel />}
    />
  );
};

export default AIGoalPhase2;
