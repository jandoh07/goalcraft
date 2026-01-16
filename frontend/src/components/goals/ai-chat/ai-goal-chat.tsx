"use client";

import { useCallback, useRef } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/firebase";
import { ChatMessagesList } from "./chat-messages-list";
import { ChatInput } from "./chat-input";
import { WelcomeMessage } from "./chat-ui-elements";
import { GoalCreationLayout } from "./goal-creation-layout";
import { Phase1DataPanel, mapToAppCategory } from "./phase1-data-panel";
import {
  ThinkingLevel,
  ChatDisplayMessage,
  ChatHistoryMessage,
  Phase1Output,
  Phase1Response,
} from "@/types";
import { useGoalCreationStore } from "@/stores/goal-creation-store";
import { useAuth } from "@/contexts/auth-context";

/**
 * Generate a unique message ID
 */
const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Extract display text from Phase 1 output
 */
const formatPhase1Response = (output: Phase1Output): string => {
  const parts: string[] = [];

  if (output.comments) {
    parts.push(output.comments);
  }

  if (output.title && output.category && output.duration) {
    parts.push("");
    parts.push(`**Goal:** ${output.title}`);
    parts.push(`**Category:** ${output.category}`);
    parts.push(`**Duration:** ${output.duration}`);
  }

  if (output.follow_up) {
    parts.push("");
    parts.push(output.follow_up);
  }

  return parts.join("\n");
};

/**
 * Chat panel component - handles the AI conversation
 */
function ChatPanel() {
  const {
    messages,
    isLoading,
    error,
    chatHistory,
    addMessage,
    setChatHistory,
    setIsLoading,
    setError,
    updatePhase1Data,
  } = useGoalCreationStore();

  const historyRef = useRef<ChatHistoryMessage[]>(chatHistory);
  historyRef.current = chatHistory;

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
      addMessage(userMsg);

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

        // Update chat history
        setChatHistory(history);
        historyRef.current = history;

        // Add assistant response
        const assistantMsg: ChatDisplayMessage = {
          id: generateMessageId(),
          role: "assistant",
          content: formatPhase1Response(output),
          timestamp: new Date(),
        };
        addMessage(assistantMsg);

        // Update Phase 1 data if AI provided values
        if (output.title || output.category || output.duration) {
          updatePhase1Data({
            ...(output.title && { title: output.title }),
            ...(output.category && {
              category: mapToAppCategory(output.category),
            }),
            ...(output.duration && { duration: output.duration }),
          });
        }

        return output;
      } catch (err) {
        console.error("Error in Phase 1:", err);
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);

        const errorMsg: ChatDisplayMessage = {
          id: generateMessageId(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        addMessage(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [addMessage, setChatHistory, setError, setIsLoading, updatePhase1Data]
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

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full flex-1 relative">
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto pb-40 md:pb-0 custom-scrollbar">
        {!hasMessages ? (
          <WelcomeMessage onQuickStart={handleQuickStart} />
        ) : (
          <ChatMessagesList messages={messages} isLoading={isLoading} />
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
                ? "Continue the conversation..."
                : "What goal would you like to achieve?"
            }
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Main AI Goal Chat component for Phase 1 of goal creation
 * Two-column layout: Chat (70%) + Data Panel (30%)
 */
const AIGoalChat = () => {
  return (
    <GoalCreationLayout
      chatPanel={<ChatPanel />}
      dataPanel={<Phase1DataPanel />}
    />
  );
};

export default AIGoalChat;
