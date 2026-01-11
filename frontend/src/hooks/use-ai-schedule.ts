import { useState, useCallback, useRef } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/firebase";
import { TimeBlock } from "@/types/schedule";

type OperationAction = "create" | "update" | "delete";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIOperation {
  action: OperationAction;
  blockId?: string;
  title?: string;
  start?: string;
  end?: string;
  color?: string;
  description?: string;
}

interface AIScheduleResponse {
  operations: AIOperation[];
  message: string;
  conflicts?: { blockTitle: string; reason: string }[];
}

interface OperationCallbacks {
  onCreate: (block: Omit<TimeBlock, "id" | "createdAt" | "updatedAt">) => void;
  onUpdate: (
    blockId: string,
    updates: Partial<Omit<TimeBlock, "id" | "userId" | "createdAt">>
  ) => void;
  onDelete: (blockId: string) => void;
}

interface UseAIScheduleOptions {
  existingBlocks: TimeBlock[];
  userId: string;
  callbacks: OperationCallbacks;
}

export function useAISchedule({
  existingBlocks,
  userId,
  callbacks,
}: UseAIScheduleOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<AIScheduleResponse | null>(
    null
  );
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatHistoryRef = useRef<ChatMessage[]>([]);

  // Keep ref in sync with state
  chatHistoryRef.current = chatHistory;

  const generateSchedule = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim()) {
        setError("Please enter a message");
        return null;
      }

      if (!userId) {
        setError("User not authenticated");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const scheduleTimeblocking = httpsCallable<
          {
            userMessage: string;
            currentDate: string;
            existingBlocks?: {
              id: string;
              title: string;
              start: string;
              end: string;
            }[];
            chatHistory?: { role: string; content: string }[];
          },
          { output: AIScheduleResponse }
        >(functions, "scheduleTimeblocking");

        const existingBlocksData = existingBlocks.map((block) => ({
          id: block.id,
          title: block.title,
          start: block.start.toISOString(),
          end: block.end.toISOString(),
        }));

        const result = await scheduleTimeblocking({
          userMessage,
          currentDate: new Date().toISOString(),
          existingBlocks: existingBlocksData,
          chatHistory: chatHistoryRef.current.slice(-10), // Send last 10 messages for context
        });

        const response = result.data.output;
        setLastResponse(response);

        // Process operations
        let createdCount = 0;
        let updatedCount = 0;
        let deletedCount = 0;

        if (response.operations && response.operations.length > 0) {
          for (const operation of response.operations) {
            switch (operation.action) {
              case "create":
                if (operation.title && operation.start && operation.end) {
                  const newBlock: Omit<
                    TimeBlock,
                    "id" | "createdAt" | "updatedAt"
                  > = {
                    title: operation.title,
                    start: new Date(operation.start),
                    end: new Date(operation.end),
                    color:
                      operation.color ||
                      "bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300",
                    userId,
                  };
                  if (operation.description) {
                    newBlock.description = operation.description;
                  }
                  callbacks.onCreate(newBlock);
                  createdCount++;
                }
                break;

              case "update":
                if (operation.blockId) {
                  const updates: Partial<
                    Omit<TimeBlock, "id" | "userId" | "createdAt">
                  > = {};
                  if (operation.title) updates.title = operation.title;
                  if (operation.start)
                    updates.start = new Date(operation.start);
                  if (operation.end) updates.end = new Date(operation.end);
                  if (operation.color) updates.color = operation.color;
                  if (operation.description)
                    updates.description = operation.description;

                  if (Object.keys(updates).length > 0) {
                    callbacks.onUpdate(operation.blockId, updates);
                    updatedCount++;
                  }
                }
                break;

              case "delete":
                if (operation.blockId) {
                  callbacks.onDelete(operation.blockId);
                  deletedCount++;
                }
                break;
            }
          }
        }

        // Update chat history with this exchange
        setChatHistory((prev) => [
          ...prev,
          { role: "user", content: userMessage },
          { role: "assistant", content: response.message },
        ]);

        return {
          ...response,
          stats: { createdCount, updatedCount, deletedCount },
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to generate schedule";
        setError(errorMessage);
        console.error("AI Schedule error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [existingBlocks, userId, callbacks]
  );

  const clearError = useCallback(() => setError(null), []);
  const clearHistory = useCallback(() => setChatHistory([]), []);

  return {
    generateSchedule,
    isLoading,
    error,
    lastResponse,
    clearError,
    clearHistory,
  };
}
