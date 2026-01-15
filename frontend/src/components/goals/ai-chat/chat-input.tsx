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
import { Mic, Send } from "lucide-react";
import { AIModel } from "@/types";

interface ChatInputProps {
  onSend: (message: string, model: AIModel) => void;
  isLoading?: boolean;
  placeholder?: string;
}

/**
 * Chat input with model selector and voice input
 */
export function ChatInput({
  onSend,
  isLoading,
  placeholder = "What goal would you like to achieve?",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [model, setModel] = useState<AIModel>("basic");

  const handleSend = () => {
    if (!message.trim() || isLoading) return;
    onSend(message.trim(), model);
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
          <Select
            value={model}
            onValueChange={(value: AIModel) => setModel(value)}
          >
            <SelectTrigger className="h-8 w-20 text-xs border-0 bg-muted/50 hover:bg-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
            </SelectContent>
          </Select>
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
