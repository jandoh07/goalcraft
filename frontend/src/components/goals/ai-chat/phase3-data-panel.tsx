"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useGoalCreationStore,
  isPhase3Valid,
  getTotalMilestoneWeight,
  areMilestoneWeightsValid,
} from "@/stores/goal-creation-store";
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Flag,
  Plus,
  Trash2,
  Percent,
} from "lucide-react";
import { useState } from "react";

/**
 * Phase 3 Data Panel - Displays and allows editing of milestones
 */
export function Phase3DataPanel() {
  const {
    phase1Data,
    phase3Data,
    addMilestone,
    updateMilestone,
    removeMilestone,
    nextPhase,
    prevPhase,
    phase3Messages,
  } = useGoalCreationStore();

  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDesc, setNewMilestoneDesc] = useState("");
  const [newMilestoneWeight, setNewMilestoneWeight] = useState<number>(0);

  const isValid = isPhase3Valid(phase3Data);
  const hasAIConversation = phase3Messages.length > 0;
  const totalWeight = getTotalMilestoneWeight(phase3Data);
  const weightsValid = areMilestoneWeightsValid(phase3Data);

  const handleAddMilestone = () => {
    if (newMilestoneTitle.trim()) {
      addMilestone({
        title: newMilestoneTitle.trim(),
        description: newMilestoneDesc.trim(),
        weight: newMilestoneWeight,
      });
      setNewMilestoneTitle("");
      setNewMilestoneDesc("");
      setNewMilestoneWeight(0);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
            3
          </div>
          <h2 className="font-semibold">Milestones</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Break your goal into achievable checkpoints
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 w-full space-y-4 custom-scrollbar">
        {/* Goal context */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Your Goal
          </p>
          <p className="font-medium text-sm">{phase1Data.title}</p>
          <p className="text-xs text-muted-foreground">
            {phase1Data.category} • {phase1Data.duration}
          </p>
        </div>

        {/* AI suggestion indicator */}
        {hasAIConversation && phase3Data.milestones.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            <Sparkles className="size-3" />
            <span>Suggested by AI - feel free to edit</span>
          </div>
        )}

        {/* Milestones list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Flag className="size-4 text-primary" />
              Your Milestones ({phase3Data.milestones.length})
            </Label>
            {phase3Data.milestones.length > 0 && (
              <span
                className={`text-xs font-medium flex items-center gap-1 ${
                  weightsValid ? "text-green-600" : "text-amber-600"
                }`}
              >
                <Percent className="size-3" />
                {totalWeight}/100%
              </span>
            )}
          </div>

          {phase3Data.milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No milestones yet. Chat with AI or add manually below.
            </p>
          ) : (
            <div className="space-y-2">
              {phase3Data.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="bg-background border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <Input
                        value={milestone.title}
                        onChange={(e) =>
                          updateMilestone(index, {
                            ...milestone,
                            title: e.target.value,
                          })
                        }
                        className="font-medium text-sm"
                        placeholder="Milestone title"
                      />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={milestone.weight || 0}
                        onChange={(e) =>
                          updateMilestone(index, {
                            ...milestone,
                            weight: Math.min(
                              100,
                              Math.max(0, parseInt(e.target.value) || 0)
                            ),
                          })
                        }
                        className="w-16 text-xs text-center"
                        placeholder="0"
                      />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 size-8 text-destructive hover:text-destructive"
                      onClick={() => removeMilestone(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={milestone.description}
                    onChange={(e) =>
                      updateMilestone(index, {
                        ...milestone,
                        description: e.target.value,
                      })
                    }
                    className="text-xs text-muted-foreground min-h-15 resize-none"
                    placeholder="What does success look like?"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Add milestone form */}
          <div className="border-t pt-3 space-y-2">
            <p className="text-xs text-muted-foreground">Add manually:</p>
            <Input
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              placeholder="Milestone title"
              className="text-sm"
            />
            <Textarea
              value={newMilestoneDesc}
              onChange={(e) => setNewMilestoneDesc(e.target.value)}
              placeholder="Description (optional)"
              className="text-xs min-h-15 resize-none"
              rows={2}
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                value={newMilestoneWeight || ""}
                onChange={(e) =>
                  setNewMilestoneWeight(
                    Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                  )
                }
                placeholder="Weight"
                className="w-20 text-xs"
              />
              <span className="text-xs text-muted-foreground">
                % contribution to goal
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleAddMilestone}
              disabled={!newMilestoneTitle.trim()}
            >
              <Plus className="size-4 mr-1" />
              Add Milestone
            </Button>
          </div>
        </div>
      </div>

      {/* Footer with navigation */}
      <div className="p-4 border-t mt-auto space-y-2">
        <Button className="w-full" onClick={nextPhase} disabled={!isValid}>
          Continue to Tasks
          <ChevronRight className="size-4 ml-1" />
        </Button>

        <Button variant="ghost" className="w-full" onClick={prevPhase}>
          <ChevronLeft className="size-4 mr-1" />
          Back to Why
        </Button>

        {!isValid && (
          <p className="text-xs text-muted-foreground text-center">
            Add at least one milestone to continue
          </p>
        )}

        {isValid && !weightsValid && (
          <p className="text-xs text-amber-600 text-center">
            Milestone weights should sum to 100% (currently {totalWeight}%)
          </p>
        )}
      </div>
    </div>
  );
}
