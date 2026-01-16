"use client";

import { useCallback, useRef } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/firebase";
import { ChatMessagesList } from "./chat-messages-list";
import { ChatInput } from "./chat-input";
import { GoalCreationLayout } from "./goal-creation-layout";
import { Phase4DataPanel } from "./phase4-data-panel";
import {
  ThinkingLevel,
  ChatDisplayMessage,
  ChatHistoryMessage,
  Phase4Output,
  Phase4Response,
  AIMilestone,
} from "@/types";
import { useGoalCreationStore } from "@/stores/goal-creation-store";
import { useAuth } from "@/contexts/auth-context";
import { Target, CheckSquare, Repeat } from "lucide-react";

/**
 * Generate a unique message ID
 */
const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Extract display text from Phase 4 output
 */
const formatPhase4Response = (output: Phase4Output): string => {
  const parts: string[] = [];

  if (output.comments) {
    parts.push(output.comments);
  }

  if (output.oneTimeTasks && output.oneTimeTasks.length > 0) {
    parts.push("");
    parts.push("**One-Time Setup Tasks:**");
    output.oneTimeTasks.forEach((t, i) => {
      parts.push(`${i + 1}. **${t.title}** - ${t.description}`);
    });
  }

  if (output.nonNegotiables && output.nonNegotiables.length > 0) {
    parts.push("");
    parts.push("**Non-Negotiables (Recurring):**");
    output.nonNegotiables.forEach((t, i) => {
      parts.push(
        `${i + 1}. **${t.title}** (${t.frequency}) - ${t.description}`
      );
    });
  }

  if (output.follow_up) {
    parts.push("");
    parts.push(output.follow_up);
  }

  return parts.join("\n");
};

/**
 * Welcome message for Phase 4
 */
function Phase4WelcomeMessage({
  onQuickStart,
}: {
  onQuickStart?: (message: string) => void;
}) {
  const { phase1Data, phase3Data } = useGoalCreationStore();

  const QUICK_START_EXAMPLES = [
    "Suggest tasks for me",
    "What do I need to set up first?",
    "Help me create a weekly routine",
    "What habits should I build?",
  ];

  return (
    <div className="flex-1 flex flex-col py-2 md:py-8 px-2 text-left space-y-6">
      {/* Goal context */}
      <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
        <Target className="size-4 text-primary" />
        <span className="text-sm font-medium">{phase1Data.title}</span>
      </div>

      {/* Milestones summary */}
      {phase3Data.milestones.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Your Milestones
          </p>
          <ul className="text-sm space-y-1">
            {phase3Data.milestones.slice(0, 3).map((m, i) => (
              <li key={i} className="text-muted-foreground">
                • {m.title}
              </li>
            ))}
            {phase3Data.milestones.length > 3 && (
              <li className="text-muted-foreground text-xs">
                +{phase3Data.milestones.length - 3} more
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="space-y-2 w-full">
        <h3 className="font-semibold text-lg md:text-2xl flex items-center gap-2">
          <CheckSquare className="size-6 text-blue-500" />
          <Repeat className="size-6 text-green-500" />
          Time to build your action plan
        </h3>
        <p className="text-muted-foreground max-w-sm text-left md:text-lg">
          We&apos;ll identify two types of tasks:
        </p>
        <ul className="text-muted-foreground max-w-sm text-left space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <CheckSquare className="size-4 text-blue-500 mt-0.5 shrink-0" />
            <span>
              <strong>One-time tasks</strong> - Setup actions you do once
              (create accounts, buy equipment, etc.)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Repeat className="size-4 text-green-500 mt-0.5 shrink-0" />
            <span>
              <strong>Non-negotiables</strong> - Recurring habits that drive
              consistent progress
            </span>
          </li>
        </ul>
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
 * Chat panel component for Phase 4 - handles the AI conversation about tasks
 */
function Phase4ChatPanel() {
  const {
    phase1Data,
    phase2Data,
    phase3Data,
    phase4Messages,
    phase4ChatHistory,
    isLoading,
    error,
    addPhase4Message,
    setPhase4ChatHistory,
    setIsLoading,
    setError,
    updatePhase4Data,
  } = useGoalCreationStore();

  const historyRef = useRef<ChatHistoryMessage[]>(phase4ChatHistory);
  historyRef.current = phase4ChatHistory;

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
      addPhase4Message(userMsg);

      try {
        const goalPhase4 = httpsCallable<
          {
            title: string;
            category: string;
            duration: string;
            whyStatement?: string;
            milestones: AIMilestone[];
            userMessage: string;
            thinkingLevel: ThinkingLevel;
            history?: ChatHistoryMessage[];
          },
          Phase4Response
        >(functions, "goalPhase4");

        const result = await goalPhase4({
          title: phase1Data.title,
          category: phase1Data.category,
          duration: phase1Data.duration,
          whyStatement: phase2Data.skipped
            ? undefined
            : phase2Data.whyStatement,
          milestones: phase3Data.milestones,
          userMessage,
          thinkingLevel,
          history: historyRef.current,
        });

        const { output, history } = result.data;

        // Update chat history
        setPhase4ChatHistory(history);
        historyRef.current = history;

        // Add assistant response
        const assistantMsg: ChatDisplayMessage = {
          id: generateMessageId(),
          role: "assistant",
          content: formatPhase4Response(output),
          timestamp: new Date(),
        };
        addPhase4Message(assistantMsg);

        // Update Phase 4 data if AI provided tasks
        if (output.oneTimeTasks || output.nonNegotiables) {
          updatePhase4Data({
            ...(output.oneTimeTasks && { oneTimeTasks: output.oneTimeTasks }),
            ...(output.nonNegotiables && {
              nonNegotiables: output.nonNegotiables,
            }),
          });
        }

        return output;
      } catch (err) {
        console.error("Error in Phase 4:", err);
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);

        const errorMsg: ChatDisplayMessage = {
          id: generateMessageId(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        addPhase4Message(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [
      phase1Data,
      phase2Data,
      phase3Data,
      addPhase4Message,
      setPhase4ChatHistory,
      setError,
      setIsLoading,
      updatePhase4Data,
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

  const hasMessages = phase4Messages.length > 0;

  return (
    <div className="flex flex-col h-full flex-1 relative">
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto pb-40 md:pb-0 custom-scrollbar">
        {!hasMessages ? (
          <Phase4WelcomeMessage onQuickStart={handleQuickStart} />
        ) : (
          <ChatMessagesList messages={phase4Messages} isLoading={isLoading} />
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
                ? "Refine your tasks..."
                : "What tasks and habits do you need?"
            }
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Main AI Goal Chat component for Phase 4 of goal creation
 * Two-column layout: Chat (70%) + Data Panel (30%)
 */
const AIGoalPhase4 = () => {
  return (
    <GoalCreationLayout
      chatPanel={<Phase4ChatPanel />}
      dataPanel={<Phase4DataPanel />}
    />
  );
};

export default AIGoalPhase4;
