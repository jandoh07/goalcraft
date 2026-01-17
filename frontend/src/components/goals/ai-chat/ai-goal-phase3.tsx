"use client";

import { useCallback, useRef } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/firebase";
import { ChatMessagesList } from "./chat-messages-list";
import { ChatInput } from "./chat-input";
import { GoalCreationLayout } from "./goal-creation-layout";
import { Phase3DataPanel } from "./phase3-data-panel";
import {
  ThinkingLevel,
  ChatDisplayMessage,
  ChatHistoryMessage,
  Phase3Output,
  Phase3Response,
} from "@/types";
import { useGoalCreationStore } from "@/stores/goal-creation-store";
import { useAuth } from "@/contexts/auth-context";
import { Target, Flag } from "lucide-react";

/**
 * Generate a unique message ID
 */
const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Extract display text from Phase 3 output
 */
const formatPhase3Response = (output: Phase3Output): string => {
  const parts: string[] = [];

  if (output.comments) {
    parts.push(output.comments);
  }

  if (output.milestones && output.milestones.length > 0) {
    parts.push("");
    parts.push("**Suggested Milestones:**");
    output.milestones.forEach((m, i) => {
      parts.push(`${i + 1}. **${m.title}** - ${m.description}`);
    });
  }

  if (output.follow_up) {
    parts.push("");
    parts.push(output.follow_up);
  }

  return parts.join("\n");
};

/**
 * Welcome message for Phase 3
 */
function Phase3WelcomeMessage({
  onQuickStart,
}: {
  onQuickStart?: (message: string) => void;
}) {
  const { phase1Data } = useGoalCreationStore();

  const QUICK_START_EXAMPLES = [
    "Suggest milestones for me",
    "I want 4 milestones",
    "Break it into monthly checkpoints",
    "Help me think about key achievements",
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
          <Flag className="size-6 text-primary" />
          Let&apos;s map out your journey
        </h3>
        <p className="text-muted-foreground max-w-sm text-left md:text-lg">
          Milestones are checkpoints that mark significant progress. They help
          you stay motivated and track your advancement toward the goal.
        </p>
        <p className="text-muted-foreground max-w-sm text-left text-sm">
          I&apos;ll suggest some milestones based on your goal, or you can tell
          me what achievements matter most to you.
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
 * Chat panel component for Phase 3 - handles the AI conversation about milestones
 */
function Phase3ChatPanel() {
  const {
    phase1Data,
    phase2Data,
    phase3Messages,
    phase3ChatHistory,
    chatHistory: phase1ChatHistory, // Get Phase 1 history for context
    phase2ChatHistory, // Get Phase 2 history for context
    isLoading,
    error,
    addPhase3Message,
    setPhase3ChatHistory,
    setIsLoading,
    setError,
    updatePhase3Data,
  } = useGoalCreationStore();

  const historyRef = useRef<ChatHistoryMessage[]>(phase3ChatHistory);
  historyRef.current = phase3ChatHistory;

  const sendMessage = useCallback(
    async (userMessage: string, thinkingLevel: ThinkingLevel = "LOW") => {
      if (!userMessage.trim()) {
        setError("Please enter a message");
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
      addPhase3Message(userMsg);

      try {
        const goalPhase3 = httpsCallable<
          {
            title: string;
            category: string;
            duration: string;
            whyStatement?: string;
            userMessage: string;
            thinkingLevel: ThinkingLevel;
            history?: ChatHistoryMessage[];
            previousPhaseHistory?: ChatHistoryMessage[];
          },
          Phase3Response
        >(functions, "goalPhase3");

        // Combine previous phase histories for context
        const previousPhaseHistory = [
          ...phase1ChatHistory,
          ...phase2ChatHistory,
        ];

        const result = await goalPhase3({
          title: phase1Data.title,
          category: phase1Data.category,
          duration: phase1Data.duration,
          whyStatement: phase2Data.skipped
            ? undefined
            : phase2Data.whyStatement,
          userMessage,
          thinkingLevel,
          history: historyRef.current,
          previousPhaseHistory:
            previousPhaseHistory.length > 0 ? previousPhaseHistory : undefined,
        });

        const { output, history } = result.data;

        // Update chat history
        setPhase3ChatHistory(history);
        historyRef.current = history;

        // Add assistant response
        const assistantMsg: ChatDisplayMessage = {
          id: generateMessageId(),
          role: "assistant",
          content: formatPhase3Response(output),
          timestamp: new Date(),
        };
        addPhase3Message(assistantMsg);

        // Update Phase 3 data if AI provided milestones
        if (output.milestones && output.milestones.length > 0) {
          updatePhase3Data({
            milestones: output.milestones,
          });
        }

        return output;
      } catch (err) {
        console.error("Error in Phase 3:", err);
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);

        const errorMsg: ChatDisplayMessage = {
          id: generateMessageId(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        addPhase3Message(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [
      phase1Data,
      phase2Data,
      phase1ChatHistory,
      phase2ChatHistory,
      addPhase3Message,
      setPhase3ChatHistory,
      setError,
      setIsLoading,
      updatePhase3Data,
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

  const hasMessages = phase3Messages.length > 0;

  return (
    <div className="flex flex-col h-full flex-1 relative">
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto pb-40 md:pb-0 custom-scrollbar">
        {!hasMessages ? (
          <Phase3WelcomeMessage onQuickStart={handleQuickStart} />
        ) : (
          <ChatMessagesList messages={phase3Messages} isLoading={isLoading} />
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
                ? "Refine your milestones..."
                : "Tell me about key achievements you want to reach"
            }
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Main AI Goal Chat component for Phase 3 of goal creation
 * Two-column layout: Chat (70%) + Data Panel (30%)
 */
const AIGoalPhase3 = () => {
  return (
    <GoalCreationLayout
      chatPanel={<Phase3ChatPanel />}
      dataPanel={<Phase3DataPanel />}
    />
  );
};

export default AIGoalPhase3;
