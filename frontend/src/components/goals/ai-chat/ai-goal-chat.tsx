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

type AIModel = "basic" | "pro";

const AIGoalChat = () => {
  const [message, setMessage] = useState("");
  const [model, setModel] = useState<AIModel>("basic");

  const handleSend = () => {
    if (!message.trim()) return;
    // TODO: Implement AI chat functionality
    console.log("Sending message:", message, "with model:", model);
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
    <div className="flex flex-col h-full flex-1">
      {/* Chat area - placeholder for messages */}
      <div className="flex-1 flex flex-col items-center md:justify-center py-8 mt-10 md:mt-0 px-4 text-left space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg md:text-2xl">
            Ready to build something great?
          </h3>
          <p className="text-muted-foreground max-w-sm text-left md:text-lg">
            Let&apos;s turn that idea into a plan. What&apos;s a goal
            you&apos;ve been thinking about? Don&apos;t worry about being
            perfect just give me the gist, and we&apos;ll refine it together.
          </p>
        </div>
      </div>

      {/* Input area - fixed at bottom */}
      <div className="bg-background space-y-2 mb-2">
        <div className="relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What goal would you like to achieve?"
            className="min-h-20 max-h-40 pb-12 resize-none"
            rows={3}
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
              <Button onClick={handleSend} size="icon" className="size-8">
                <Send className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleVoiceInput}
                className="size-8 text-muted-foreground hover:text-foreground"
              >
                <Mic className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIGoalChat;
