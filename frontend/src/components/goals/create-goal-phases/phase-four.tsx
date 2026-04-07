import { useState } from "react";
import { Check, PenLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GoalDraft, GoalDraftSetter } from "../create-goal-flow-types";
import { CreateGoalPhaseHeader } from "./phase-header";

interface CreateGoalPhaseFourProps {
  draft: GoalDraft;
  setDraft: GoalDraftSetter;
  totalWeight: number;
}

export const CreateGoalPhaseFour = ({
  draft,
  setDraft,
  totalWeight,
}: CreateGoalPhaseFourProps) => {
  const [editingIds, setEditingIds] = useState<string[]>([]);
  const [pendingMilestone, setPendingMilestone] = useState<
    Omit<GoalDraft["milestones"][number], "id">
  >({ title: "", weight: "" });
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);

  const addMilestone = () => {
    if (isAddingMilestone) {
      return;
    }

    setIsAddingMilestone(true);
    setPendingMilestone({ title: "", weight: "" });
  };

  const confirmAddMilestone = () => {
    if (pendingMilestone.title.trim().length === 0) {
      return;
    }

    setDraft((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          id: `ms-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          ...pendingMilestone,
        },
      ],
    }));

    setIsAddingMilestone(false);
    setPendingMilestone({ title: "", weight: "" });
  };

  const cancelAddMilestone = () => {
    setIsAddingMilestone(false);
    setPendingMilestone({ title: "", weight: "" });
  };

  const toggleEditing = (id: string) => {
    setEditingIds((prev) =>
      prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id],
    );
  };

  const removeMilestone = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((milestone) => milestone.id !== id),
    }));
  };

  const updateMilestone = (
    id: string,
    updates: Partial<GoalDraft["milestones"][number]>,
  ) => {
    setDraft((prev) => ({
      ...prev,
      milestones: prev.milestones.map((milestone) =>
        milestone.id === id ? { ...milestone, ...updates } : milestone,
      ),
    }));
  };

  const isBalanced = totalWeight === 100;

  return (
    <div className="flex-1 space-y-5">
      <CreateGoalPhaseHeader
        title="Mark your milestones"
        subheading="Break the journey into checkpoints. These are the wins you will celebrate along the way."
      />

      <div className="space-y-3">
        {draft.milestones.map((milestone, index) => (
          <div
            key={milestone.id}
            className="space-y-3 rounded-lg border border-border/70 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {milestone.title.trim() || `Milestone ${index + 1}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {milestone.weight || "0"}%
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleEditing(milestone.id)}
                  aria-label="Edit milestone"
                >
                  {editingIds.includes(milestone.id) ? (
                    <Check className="size-4" />
                  ) : (
                    <PenLine className="size-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMilestone(milestone.id)}
                  disabled={draft.milestones.length === 1}
                  aria-label="Delete milestone"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            {editingIds.includes(milestone.id) && (
              <div className="space-y-3 border-t pt-3">
                <Input
                  value={milestone.title}
                  onChange={(event) =>
                    updateMilestone(milestone.id, { title: event.target.value })
                  }
                  placeholder="Milestone title"
                />

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Weight (%)</p>
                  <Input
                    inputMode="decimal"
                    value={milestone.weight}
                    onChange={(event) =>
                      updateMilestone(milestone.id, {
                        weight: event.target.value.replace(/[^0-9.]/g, ""),
                      })
                    }
                    placeholder="e.g. 25"
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {isAddingMilestone ? (
          <div className="space-y-3 rounded-lg border border-dashed border-border p-3">
            <Input
              value={pendingMilestone.title}
              onChange={(event) =>
                setPendingMilestone((prev) => ({
                  ...prev,
                  title: event.target.value,
                }))
              }
              placeholder="Milestone title"
            />

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Weight (%)</p>
              <Input
                inputMode="decimal"
                value={pendingMilestone.weight}
                onChange={(event) =>
                  setPendingMilestone((prev) => ({
                    ...prev,
                    weight: event.target.value.replace(/[^0-9.]/g, ""),
                  }))
                }
                placeholder="e.g. 25"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={cancelAddMilestone}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmAddMilestone}
                disabled={pendingMilestone.title.trim().length === 0}
              >
                Add
              </Button>
            </div>
          </div>
        ) : editingIds.length === 0 ? (
          <Button type="button" variant="outline" onClick={addMilestone}>
            Add milestone
          </Button>
        ) : null}

        <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-sm">
          <p className="font-medium">Total weight: {totalWeight}%</p>
          <p
            className={isBalanced ? "text-green-600" : "text-muted-foreground"}
          >
            {isBalanced
              ? "Perfect. Your milestones add up to 100%."
              : "Milestones must add up to exactly 100% before you can create the goal."}
          </p>
        </div>
      </div>
    </div>
  );
};
