import { Badge } from "@/components/ui/badge";
import { useUpdateGoal } from "@/hooks/use-goals";
import { cn } from "@/lib/utils";
import { Goal } from "@/types";
import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MilestonesProps {
  goal?: Goal;
}

const Milestones = ({ goal }: MilestonesProps) => {
  const [milestones, setMilestones] = useState(goal?.milestones || []);
  const updateGoalMutation = useUpdateGoal();

  const toggleMilestone = (milestoneId: string) => {
    if (!goal || !goal?.id) return;

    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;

    const currentProgress = goal.progress || 0;
    let newProgress: number;

    if (milestone.completed) {
      // Uncompleting: subtract the weight
      newProgress = Math.max(0, currentProgress - milestone.weight);
    } else {
      // Completing: add the weight
      newProgress = Math.min(100, currentProgress + milestone.weight);
    }

    const updatedMilestones = milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );

    setMilestones(updatedMilestones);
    updateGoalMutation.mutate({
      goalId: goal?.id,
      updates: {
        milestones: updatedMilestones,
        progress: newProgress,
      },
    });
    toast.success(
      navigator.onLine
        ? "Milestone status updated"
        : "Milestone status updated! Will sync when online."
    );
  };

  return (
    <>
      {!milestones ||
        (milestones.length === 0 && (
          <div className="h-20 flex justify-center items-center">
            <p className="text-sm text-muted-foreground text-center">
              No milestones added yet.
            </p>
          </div>
        ))}
      {milestones && milestones.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-2">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-accent/50",
                  milestone.completed && "bg-muted/50"
                )}
                onClick={() => toggleMilestone(milestone.id!)}
              >
                <button
                  type="button"
                  className="shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMilestone(milestone.id!);
                  }}
                  disabled={updateGoalMutation.isPending}
                >
                  {milestone.completed ? (
                    <CheckCircle2 className="size-5 text-primary" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      milestone.completed &&
                        "line-through text-muted-foreground"
                    )}
                  >
                    {milestone.title}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {milestone.weight}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Milestones;
