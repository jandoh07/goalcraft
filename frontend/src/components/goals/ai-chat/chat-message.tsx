"use client";

import { cn } from "@/lib/utils";
import { ChatDisplayMessage } from "@/types";

interface ChatMessageProps {
  message: ChatDisplayMessage;
}

/**
 * Parse simple markdown (bold) to React elements
 */
function parseMarkdown(text: string): React.ReactNode {
  // Split by bold markers (**text**)
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

/**
 * Individual chat message bubble
 */
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  // Split content by newlines for proper rendering
  const lines = message.content.split("\n");

  return (
    <div
      className={cn(
        "flex gap-3 w-full px-2",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm"
        )}
      >
        <div className="text-sm space-y-1">
          {lines.map((line, index) => (
            <p key={index} className={line === "" ? "h-2" : ""}>
              {parseMarkdown(line)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
