"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [isLoading, setIsLoading] = useState(false);
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
    if (!goalId || !user?.uid) {
      setFetchedGoal(null);
      setMilestones([]);
      setNonNegotiables([]);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setError(null);

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

  const dueDateText = useMemo(() => {
    if (!displayGoal?.dueDate) {
      return "No due date";
    }

    return displayGoal.dueDate.toLocaleDateString("en-us", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [displayGoal?.dueDate]);

  const formatNonNegotiableFrequency = (item: NonNegotiable) => {
    if (item.frequency !== "custom") {
      return item.frequency[0].toUpperCase() + item.frequency.slice(1);
    }

    if (item.customDays.length === 0) {
      return "Custom";
    }

    return `Custom (${item.customDays.map((day) => day.toUpperCase()).join(", ")})`;
  };

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

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the goal and its linked milestones
              and non-negotiables.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteGoalMutation.loading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteGoalMutation.loading}
              onClick={async (event) => {
                event.preventDefault();
                await handleDeleteGoal();
              }}
            >
              {deleteGoalMutation.loading ? "Deleting..." : "Delete goal"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GoalView;
