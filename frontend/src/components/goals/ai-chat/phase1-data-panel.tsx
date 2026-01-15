"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { goalCategoryConfig } from "@/constants/goals";
import {
  useGoalCreationStore,
  isPhase1Valid,
} from "@/stores/goal-creation-store";
import { ChevronRight, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

/**
 * Map AI category responses to app categories
 */
export function mapToAppCategory(aiCategory: string): string {
  const categoryMap: Record<string, string> = {
    "Personal Growth": "PersonalGrowth",
    Hobbies: "PersonalGrowth",
    Creativity: "PersonalGrowth",
    "Home & Lifestyle": "Productivity",
  };
  return categoryMap[aiCategory] || aiCategory;
}

/**
 * Phase 1 Data Panel - Displays and allows editing of goal title, category, and duration
 */
export function Phase1DataPanel() {
  const { phase1Data, updatePhase1Data, nextPhase, messages } =
    useGoalCreationStore();

  const isValid = isPhase1Valid(phase1Data);
  const hasAIConversation = messages.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
            1
          </div>
          <h2 className="font-semibold">Goal Details</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Define what you want to achieve
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 w-full space-y-6">
        {/* AI suggestion indicator */}
        {hasAIConversation && phase1Data.title && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            <Sparkles className="size-3" />
            <span>Filled by AI - feel free to edit</span>
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="goal-title">Goal Title</Label>
          <Textarea
            id="goal-title"
            placeholder="e.g., Run a 5k marathon"
            value={phase1Data.title}
            onChange={(e) => updatePhase1Data({ title: e.target.value })}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Make it specific and outcome-oriented
          </p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="goal-category">Category</Label>
          <Select
            value={phase1Data.category}
            onValueChange={(value) => updatePhase1Data({ category: value })}
          >
            <SelectTrigger id="goal-category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(goalCategoryConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon className={`size-4 ${config.iconColor}`} />
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="goal-duration">Duration</Label>
          <Input
            id="goal-duration"
            placeholder="e.g., 3 months, 2 weeks"
            value={phase1Data.duration}
            onChange={(e) => updatePhase1Data({ duration: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            How long do you expect this goal to take?
          </p>
        </div>
      </div>

      {/* Footer with navigation */}
      <div className="p-4 border-t mt-auto">
        <Button className="w-full" onClick={nextPhase} disabled={!isValid}>
          Continue to Why
          <ChevronRight className="size-4 ml-1" />
        </Button>
        {!isValid && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Fill in all fields to continue
          </p>
        )}
      </div>
    </div>
  );
}
