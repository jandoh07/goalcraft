"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Mic, Send, Lock } from "lucide-react";
import { ThinkingLevel } from "@/types";

interface ChatInputProps {
  onSend: (message: string, thinkingLevel: ThinkingLevel) => void;
  isLoading?: boolean;
  placeholder?: string;
  isPremium?: boolean;
}

/**
 * Chat input with thinking level selector and voice input
 */
export function ChatInput({
  onSend,
  isLoading,
  placeholder = "What goal would you like to achieve?",
  isPremium = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevel>("LOW");

  const handleSend = () => {
    if (!message.trim() || isLoading) return;
    onSend(message.trim(), thinkingLevel);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = () => {
    // TODO: Implement voice input functionality
    console.log("Voice input triggered");
  };

  const hasContent = message.trim().length > 0;

  const thinkingLevelLabels: Record<ThinkingLevel, string> = {
    MINIMAL: "Minimal",
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
  };

  return (
    <div className="bg-background space-y-2">
      <div className="relative">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-20 max-h-40 pb-12 resize-none"
          rows={3}
          disabled={isLoading}
        />
        {/* Actions inside input */}
        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          {isPremium ? (
            <Select
              value={thinkingLevel}
              onValueChange={(value: ThinkingLevel) => setThinkingLevel(value)}
            >
              <SelectTrigger className="h-8 w-24 text-xs border-0 bg-muted/50 hover:bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-8 px-2 flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 rounded-md cursor-not-allowed">
                    <Lock className="size-3" />
                    <span>{thinkingLevelLabels[thinkingLevel]}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upgrade to Pro to unlock higher thinking levels</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {hasContent ? (
            <Button
              onClick={handleSend}
              size="icon"
              className="size-8"
              disabled={isLoading}
            >
              <Send className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleVoiceInput}
              className="size-8 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              <Mic className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
