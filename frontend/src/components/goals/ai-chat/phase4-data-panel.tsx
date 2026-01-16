"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useGoalCreationStore,
  isPhase4Valid,
} from "@/stores/goal-creation-store";
import {
  ChevronLeft,
  Sparkles,
  CheckSquare,
  Repeat,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import { useState } from "react";

/**
 * Phase 4 Data Panel - Displays and allows editing of one-time tasks and non-negotiables
 */
export function Phase4DataPanel() {
  const {
    phase1Data,
    phase4Data,
    addOneTimeTask,
    updateOneTimeTask,
    removeOneTimeTask,
    addNonNegotiable,
    updateNonNegotiable,
    removeNonNegotiable,
    prevPhase,
    phase4Messages,
  } = useGoalCreationStore();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newNonNegTitle, setNewNonNegTitle] = useState("");
  const [newNonNegDesc, setNewNonNegDesc] = useState("");
  const [newNonNegFreq, setNewNonNegFreq] = useState("");

  const isValid = isPhase4Valid(phase4Data);
  const hasAIConversation = phase4Messages.length > 0;

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addOneTimeTask({
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
      });
      setNewTaskTitle("");
      setNewTaskDesc("");
    }
  };

  const handleAddNonNeg = () => {
    if (newNonNegTitle.trim() && newNonNegFreq.trim()) {
      addNonNegotiable({
        title: newNonNegTitle.trim(),
        description: newNonNegDesc.trim(),
        frequency: newNonNegFreq.trim(),
      });
      setNewNonNegTitle("");
      setNewNonNegDesc("");
      setNewNonNegFreq("");
    }
  };

  const handleCreateGoal = () => {
    // TODO: Implement goal creation with all collected data
    console.log("Creating goal with:", {
      phase1Data,
      phase4Data,
    });
    alert("Goal creation will be implemented - check console for data");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
            4
          </div>
          <h2 className="font-semibold">Tasks</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Define your action plan
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 w-full space-y-6 custom-scrollbar">
        {/* Goal context */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Your Goal
          </p>
          <p className="font-medium text-sm">{phase1Data.title}</p>
        </div>

        {/* AI suggestion indicator */}
        {hasAIConversation &&
          (phase4Data.oneTimeTasks.length > 0 ||
            phase4Data.nonNegotiables.length > 0) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              <Sparkles className="size-3" />
              <span>Suggested by AI - feel free to edit</span>
            </div>
          )}

        {/* One-Time Tasks Section */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <CheckSquare className="size-4 text-blue-500" />
            One-Time Setup Tasks ({phase4Data.oneTimeTasks.length})
          </Label>
          <p className="text-xs text-muted-foreground">
            Things you need to do once to get started
          </p>

          {phase4Data.oneTimeTasks.length > 0 && (
            <div className="space-y-2">
              {phase4Data.oneTimeTasks.map((task, index) => (
                <div
                  key={index}
                  className="bg-background border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <Input
                        value={task.title}
                        onChange={(e) =>
                          updateOneTimeTask(index, {
                            ...task,
                            title: e.target.value,
                          })
                        }
                        className="font-medium text-sm"
                        placeholder="Task title"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 size-8 text-destructive hover:text-destructive"
                      onClick={() => removeOneTimeTask(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={task.description}
                    onChange={(e) =>
                      updateOneTimeTask(index, {
                        ...task,
                        description: e.target.value,
                      })
                    }
                    className="text-xs min-h-15 resize-none"
                    placeholder="Description"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Add task form */}
          <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="New task title"
              className="text-sm"
            />
            <Textarea
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              placeholder="Description (optional)"
              className="text-xs min-h-15 resize-none"
              rows={2}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim()}
            >
              <Plus className="size-4 mr-1" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Non-Negotiables Section */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Repeat className="size-4 text-green-500" />
            Non-Negotiables ({phase4Data.nonNegotiables.length})
          </Label>
          <p className="text-xs text-muted-foreground">
            Recurring habits that drive consistent progress
          </p>

          {phase4Data.nonNegotiables.length > 0 && (
            <div className="space-y-2">
              {phase4Data.nonNegotiables.map((task, index) => (
                <div
                  key={index}
                  className="bg-background border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <Input
                        value={task.title}
                        onChange={(e) =>
                          updateNonNegotiable(index, {
                            ...task,
                            title: e.target.value,
                          })
                        }
                        className="font-medium text-sm"
                        placeholder="Habit title"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 size-8 text-destructive hover:text-destructive"
                      onClick={() => removeNonNegotiable(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={task.description}
                    onChange={(e) =>
                      updateNonNegotiable(index, {
                        ...task,
                        description: e.target.value,
                      })
                    }
                    className="text-xs min-h-15 resize-none"
                    placeholder="Description"
                    rows={2}
                  />
                  <Input
                    value={task.frequency}
                    onChange={(e) =>
                      updateNonNegotiable(index, {
                        ...task,
                        frequency: e.target.value,
                      })
                    }
                    className="text-xs font-medium text-green-600"
                    placeholder="Frequency (e.g., every week)"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Add non-negotiable form */}
          <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
            <Input
              value={newNonNegTitle}
              onChange={(e) => setNewNonNegTitle(e.target.value)}
              placeholder="Recurring task title"
              className="text-sm"
            />
            <Textarea
              value={newNonNegDesc}
              onChange={(e) => setNewNonNegDesc(e.target.value)}
              placeholder="Description (optional)"
              className="text-xs min-h-15 resize-none"
              rows={2}
            />
            <Input
              value={newNonNegFreq}
              onChange={(e) => setNewNonNegFreq(e.target.value)}
              placeholder="Frequency (e.g., twice a week)"
              className="text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleAddNonNeg}
              disabled={!newNonNegTitle.trim() || !newNonNegFreq.trim()}
            >
              <Plus className="size-4 mr-1" />
              Add Non-Negotiable
            </Button>
          </div>
        </div>
      </div>

      {/* Footer with navigation */}
      <div className="p-4 border-t mt-auto space-y-2">
        <Button
          className="w-full"
          onClick={handleCreateGoal}
          disabled={!isValid}
        >
          <Check className="size-4 mr-1" />
          Create Goal
        </Button>

        <Button variant="ghost" className="w-full" onClick={prevPhase}>
          <ChevronLeft className="size-4 mr-1" />
          Back to Milestones
        </Button>

        {!isValid && (
          <p className="text-xs text-muted-foreground text-center">
            Add at least one task to continue
          </p>
        )}
      </div>
    </div>
  );
}
