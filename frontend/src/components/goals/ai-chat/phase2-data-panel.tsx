"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useGoalCreationStore,
  isPhase2Valid,
} from "@/stores/goal-creation-store";
import { ChevronRight, ChevronLeft, Sparkles, Heart } from "lucide-react";

/**
 * Phase 2 Data Panel - Displays and allows editing of why statement
 */
export function Phase2DataPanel() {
  const {
    phase1Data,
    phase2Data,
    updatePhase2Data,
    nextPhase,
    prevPhase,
    phase2Messages,
  } = useGoalCreationStore();

  const isValid = isPhase2Valid(phase2Data);
  const hasAIConversation = phase2Messages.length > 0;

  const handleSkip = () => {
    updatePhase2Data({ skipped: true, whyStatement: "" });
    nextPhase();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
            2
          </div>
          <h2 className="font-semibold">Your Why</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Anchor your goal to a deeper purpose
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 w-full space-y-6">
        {/* Goal context */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Your Goal
          </p>
          <p className="font-medium">{phase1Data.title}</p>
          <p className="text-sm text-muted-foreground">
            {phase1Data.category} • {phase1Data.duration}
          </p>
        </div>

        {/* AI suggestion indicator */}
        {hasAIConversation &&
          phase2Data.whyStatement &&
          !phase2Data.skipped && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              <Sparkles className="size-3" />
              <span>Filled by AI - feel free to edit</span>
            </div>
          )}

        {/* Why Statement */}
        <div className="space-y-2">
          <Label htmlFor="why-statement" className="flex items-center gap-2">
            <Heart className="size-4 text-red-500" />
            Motivation Statement
          </Label>
          <Textarea
            id="why-statement"
            placeholder="e.g., To be healthy enough to play with my kids without getting tired..."
            value={phase2Data.whyStatement}
            onChange={(e) =>
              updatePhase2Data({ whyStatement: e.target.value, skipped: false })
            }
            className="w-full min-h-30"
            disabled={phase2Data.skipped}
          />
          <p className="text-xs text-muted-foreground">
            This will be your anchor when motivation is low
          </p>
        </div>

        {/* Why this matters */}
        <div className="bg-primary/5 rounded-lg p-3 space-y-2">
          <p className="text-sm font-medium">Why does this matter?</p>
          <p className="text-xs text-muted-foreground">
            Studies show that connecting goals to emotional reasons increases
            follow-through by up to 50%. Your &quot;why&quot; becomes a powerful
            reminder when challenges arise.
          </p>
        </div>
      </div>

      {/* Footer with navigation */}
      <div className="p-4 border-t mt-auto space-y-2">
        <Button className="w-full" onClick={nextPhase} disabled={!isValid}>
          Continue to Milestones
          <ChevronRight className="size-4 ml-1" />
        </Button>

        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={prevPhase}>
            <ChevronLeft className="size-4 mr-1" />
            Back
          </Button>
          <Button variant="ghost" className="flex-1" onClick={handleSkip}>
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}
