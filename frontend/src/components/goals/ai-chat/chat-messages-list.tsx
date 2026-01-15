"use client";

import { ChatDisplayMessage } from "@/types";
import { ChatMessage } from "./chat-message";
import { useRef, useEffect } from "react";
import AIThinking from "@/components/ai/ai-thinking";

interface ChatMessagesListProps {
  messages: ChatDisplayMessage[];
  isLoading?: boolean;
}

/**
 * List of chat messages with auto-scroll
 */
export function ChatMessagesList({
  messages,
  isLoading,
}: ChatMessagesListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col gap-4 py-4">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex gap-3 items-center">
          <AIThinking isLoading />
          <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2">
            <p className="text-sm text-muted-foreground">Thinking...</p>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
