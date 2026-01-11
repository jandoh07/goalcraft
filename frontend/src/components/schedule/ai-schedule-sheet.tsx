"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sparkles, Send, Loader2, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  stats?: {
    createdCount: number;
    updatedCount: number;
    deletedCount: number;
  };
  conflicts?: { blockTitle: string; reason: string }[];
}

interface AIScheduleSheetProps {
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => Promise<{
    message: string;
    stats: { createdCount: number; updatedCount: number; deletedCount: number };
    conflicts?: { blockTitle: string; reason: string }[];
  } | null>;
  onClearError: () => void;
}

export function AIScheduleSheet({
  isLoading,
  error,
  onSendMessage,
  onClearError,
}: AIScheduleSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        'Hi! I can help you schedule your time. Try saying things like:\n\n• "Add a gym session tomorrow morning"\n• "Schedule a 2-hour deep work block at 2pm"\n• "I need time for lunch and a meeting with John"',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    // Add user message
    const userMsgId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: userMessage },
    ]);

    // Call AI
    const result = await onSendMessage(userMessage);

    if (result) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.message,
          stats: result.stats,
          conflicts: result.conflicts,
        },
      ]);
    } else if (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      // Keep focus on textarea after sending
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">AI Schedule</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 focus:outline-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Schedule Assistant
          </SheetTitle>
        </SheetHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.stats &&
                  (message.stats.createdCount > 0 ||
                    message.stats.updatedCount > 0 ||
                    message.stats.deletedCount > 0) && (
                    <div className="mt-1 text-xs opacity-70 space-y-0.5">
                      {message.stats.createdCount > 0 && (
                        <p>
                          ✓ Added {message.stats.createdCount} block
                          {message.stats.createdCount > 1 ? "s" : ""}
                        </p>
                      )}
                      {message.stats.updatedCount > 0 && (
                        <p>
                          ✓ Updated {message.stats.updatedCount} block
                          {message.stats.updatedCount > 1 ? "s" : ""}
                        </p>
                      )}
                      {message.stats.deletedCount > 0 && (
                        <p>
                          ✓ Removed {message.stats.deletedCount} block
                          {message.stats.deletedCount > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  )}
                {message.conflicts && message.conflicts.length > 0 && (
                  <div className="mt-2 text-xs space-y-1">
                    {message.conflicts.map((conflict, idx) => (
                      <p
                        key={idx}
                        className="text-amber-600 dark:text-amber-400"
                      >
                        ⚠ {conflict.reason}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={onClearError}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What would you like to schedule?"
              disabled={isLoading}
              className="flex-1 min-h-10 max-h-30 resize-none"
              rows={1}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
