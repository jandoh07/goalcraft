"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Goal, Milestone, NonNegotiable } from "@/types/goal";
import { useAuth } from "@/contexts/auth-context";
import { updateMilestone } from "@/lib/firebase/goals";
import {
  getGoalDetailsCached,
  invalidateGoalDetailsCache,
} from "@/lib/firebase/goal-details-cache";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Circle, CircleCheck, Loader2 } from "lucide-react";
import useMutation from "@/hooks/use-mutation";
import { useDeleteGoal } from "@/hooks/use-goals";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { describeFrequencyTags } from "@/lib/utils/non-negotiable-recurrence";

interface GoalViewProps {
  goal: Goal | null;
  goalId: string | null;
}

const GoalView = ({ goal, goalId }: GoalViewProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [fetchedGoal, setFetchedGoal] = useState<Goal | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [nonNegotiables, setNonNegotiables] = useState<NonNegotiable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingMilestoneIds, setPendingMilestoneIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteGoalMutation = useDeleteGoal();

  const { mutate: toggleMilestoneStatusMutate } = useMutation(
    async (args: { milestoneId: string; nextStatus: Milestone["status"] }) => {
      if (!user?.uid || !goalId) {
        throw new Error("You must be signed in to update milestone status.");
      }

      await updateMilestone(user.uid, goalId, args.milestoneId, {
        status: args.nextStatus,
      });
    },
    {
      onSuccess: (_, args) => {
        if (!args) {
          return;
        }

        if (user?.uid && goalId) {
          invalidateGoalDetailsCache(user.uid, goalId);
        }

        setMilestones((prev) =>
          prev.map((milestone) =>
            milestone.id === args.milestoneId
              ? { ...milestone, status: args.nextStatus }
              : milestone,
          ),
        );
        setPendingMilestoneIds((prev) =>
          prev.filter((id) => id !== args.milestoneId),
        );
      },
      onError: (_, args) => {
        if (!args) {
          return;
        }

        setPendingMilestoneIds((prev) =>
          prev.filter((id) => id !== args.milestoneId),
        );
      },
    },
  );

  const openEditMode = () => {
    if (!goalId) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", "edit");
    params.set("type", "goal");
    params.set("goalId", goalId);
    params.set("returnMode", "view");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const closeGoalDialog = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("mode");
    params.delete("type");
    params.delete("goalId");
    params.delete("objectiveId");
    params.delete("returnMode");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const handleDeleteGoal = async () => {
    if (!goalId) {
      return;
    }

    await deleteGoalMutation.mutate(goalId);
    if (user?.uid) {
      invalidateGoalDetailsCache(user.uid, goalId);
    }
    setIsDeleteDialogOpen(false);
    closeGoalDialog();
  };

  const handleToggleMilestone = async (milestone: Milestone) => {
    if (pendingMilestoneIds.includes(milestone.id)) {
      return;
    }

    const nextStatus: Milestone["status"] =
      milestone.status === "completed" ? "in-progress" : "completed";

    setPendingMilestoneIds((prev) => [...prev, milestone.id]);
    await toggleMilestoneStatusMutate({
      milestoneId: milestone.id,
      nextStatus,
    });
  };

  useEffect(() => {
    if (!goalId || !user?.uid) return;

    let isCancelled = false;

    getGoalDetailsCached(user.uid, goalId, {
      warmGoal: goal,
    })
      .then(
        ({
          goal: nextGoal,
          milestones: fetchedMilestones,
          nonNegotiables: fetchedNonNegotiables,
        }) => {
          if (isCancelled) {
            return;
          }

          setFetchedGoal(nextGoal);
          setMilestones(fetchedMilestones);
          setNonNegotiables(fetchedNonNegotiables);
        },
      )
      .catch(() => {
        if (!isCancelled) {
          setError("Failed to load goal details.");
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [goal, goalId, user?.uid]);

  const displayGoal = goal ?? fetchedGoal;

  const dueDateText = displayGoal?.dueDate
    ? displayGoal.dueDate.toLocaleDateString("en-us", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No due date";

  const formatNonNegotiableFrequency = (item: NonNegotiable) =>
    describeFrequencyTags(item.frequency);

  const completedMilestones = milestones.filter(
    (milestone) => milestone.status === "completed",
  ).length;

  if (!goalId) {
    return <p className="text-sm text-muted-foreground">No goal selected.</p>;
  }

  if (isLoading && !displayGoal) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!displayGoal) {
    return <p className="text-sm text-muted-foreground">Goal not found.</p>;
  }

  return (
    <div className="space-y-4 relative h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg">{displayGoal.title}</p>
          <Badge variant="secondary" className="mr-1">
            Due: {dueDateText}
          </Badge>
          <Badge variant="secondary">{displayGoal.progress}% complete</Badge>
        </div>
      </div>
      <blockquote className="border-l-2 border-primary bg-secondary p-2 text-sm leading-relaxed text-muted-foreground">
        <p className="mb-1 font-medium text-primary">Your Why</p>
        <p>{displayGoal.why || "No goal reason added yet."}</p>
      </blockquote>
      <Separator />

      <Tabs defaultValue="milestones">
        <TabsList className="bg-secondary">
          <TabsTrigger value="milestones">
            Milestones ({completedMilestones}/{milestones.length})
          </TabsTrigger>
          <TabsTrigger value="non-negotiables">Non-negotiables</TabsTrigger>
        </TabsList>
        <TabsContent value="milestones">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No milestones added to this goal yet.
            </p>
          ) : (
            <div className="space-y-2">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="rounded-lg border p-3 bg-secondary"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 rounded-full"
                        aria-label={
                          milestone.status === "completed"
                            ? "Mark milestone as in progress"
                            : "Mark milestone as completed"
                        }
                        disabled={pendingMilestoneIds.includes(milestone.id)}
                        onClick={() => handleToggleMilestone(milestone)}
                      >
                        {milestone.status === "completed" ? (
                          <CircleCheck className="size-4 text-primary" />
                        ) : (
                          <Circle className="size-4 text-muted-foreground" />
                        )}
                      </Button>
                      <p className="truncate text-sm font-medium">
                        {milestone.title || "Untitled milestone"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Weight: {milestone.weight || "0"}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="non-negotiables">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : nonNegotiables.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No non-negotiables linked to this goal.
            </p>
          ) : (
            <div className="space-y-2">
              {nonNegotiables.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border p-3 bg-secondary flex items-center justify-between"
                >
                  <p className="text-sm font-medium">
                    {item.title || "Untitled non-negotiable"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatNonNegotiableFrequency(item)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      <div className="absolute left-0 bottom-0 w-full">
        <Separator />
        <div className="flex justify-between md:justify-end items-center pt-2 space-x-2">
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={openEditMode}
            className="w-25"
          >
            Edit
          </Button>
          <Button
            variant={"destructive"}
            size={"sm"}
            onClick={() => setIsDeleteDialogOpen(true)}
            className="w-25"
          >
            Delete
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteGoal}
        isLoading={deleteGoalMutation.loading}
        title="Delete this goal?"
        description="This will permanently delete the goal and its linked milestones and non-negotiables."
        confirmText={deleteGoalMutation.loading ? "Deleting..." : "Delete goal"}
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};

export default GoalView;
