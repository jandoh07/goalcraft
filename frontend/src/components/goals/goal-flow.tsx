"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreateGoalPhaseOne } from "@/components/goals/goal-phases/phase-one";
import { CreateGoalPhaseTwo } from "@/components/goals/goal-phases/phase-two";
import { CreateGoalPhaseThree } from "@/components/goals/goal-phases/phase-three";
import { CreateGoalPhaseFour } from "@/components/goals/goal-phases/phase-four";
import { Goal, GoalData } from "@/types/goal";
import useMutation from "@/hooks/use-mutation";
import { createGoal, updateGoalWithRelations } from "@/lib/firebase/goals";
import {
  getGoalDetailsCached,
  invalidateGoalDetailsCache,
} from "@/lib/firebase/goal-details-cache";
import { hasGoalDataChanged } from "@/lib/utils/goal-comparators";
import { useAuth } from "@/contexts/auth-context";

interface GoalFlowProps {
  isOpen: boolean;
  closeDialog: () => void;
  onCancel: () => void;
  mode: "create" | "edit";
  goalId: string | null;
  activeGoal: Goal | null;
}

const EMPTY_GOAL_DATA: GoalData = {
  title: "",
  dueDate: "",
  why: "",
  milestones: [],
  nonNegotiables: [],
};

const GoalFlow = ({
  isOpen,
  closeDialog,
  onCancel,
  mode,
  goalId,
  activeGoal,
}: GoalFlowProps) => {
  const { user } = useAuth();
  const [phase, setPhase] = useState(1);
  const [goalData, setGoalData] = useState<GoalData>(
    activeGoal
      ? {
          title: activeGoal.title,
          dueDate: activeGoal.dueDate.toISOString().split("T")[0],
          why: activeGoal.why,
          milestones: [],
          nonNegotiables: [],
        }
      : EMPTY_GOAL_DATA,
  );
  const [isHydratingGoalData, setIsHydratingGoalData] = useState(false);
  const editHydrationKeyRef = useRef<string | null>(null);
  const originalGoalDataRef = useRef<GoalData | null>(null);

  useEffect(() => {
    if (!isOpen) {
      editHydrationKeyRef.current = null;
      setIsHydratingGoalData(false);
      return;
    }

    setPhase(1);

    if (mode === "create") {
      originalGoalDataRef.current = null;
      setGoalData(EMPTY_GOAL_DATA);
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (!isOpen || mode !== "edit" || !goalId || !user?.uid) {
      return;
    }

    const hydrationKey = `${user.uid}:${goalId}`;
    if (editHydrationKeyRef.current === hydrationKey) {
      return;
    }

    let isCancelled = false;
    setIsHydratingGoalData(true);

    const fetchGoalData = async () => {
      const { goal, milestones, nonNegotiables } = await getGoalDetailsCached(
        user.uid,
        goalId,
        {
          warmGoal: activeGoal,
        },
      );

      if (!goal || isCancelled) {
        return;
      }

      const nextGoalData = {
        title: goal.title,
        dueDate: goal.dueDate.toISOString().split("T")[0],
        why: goal.why,
        milestones,
        nonNegotiables,
      };

      editHydrationKeyRef.current = hydrationKey;
      originalGoalDataRef.current = nextGoalData;
      setGoalData(nextGoalData);
    };

    fetchGoalData().finally(() => {
      if (!isCancelled) {
        setIsHydratingGoalData(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [activeGoal, isOpen, mode, goalId, user?.uid]);

  const handleSetTitle = useCallback(
    (title: string) => {
      setGoalData((prev) => (prev.title === title ? prev : { ...prev, title }));
    },
    [setGoalData],
  );

  const handleSetDueDate = useCallback(
    (date: string) => {
      setGoalData((prev) =>
        prev.dueDate === date ? prev : { ...prev, dueDate: date },
      );
    },
    [setGoalData],
  );

  const progressValue = useMemo(() => (phase / 4) * 100, [phase]);

  const handleNext = () => setPhase((prev) => Math.min(4, prev + 1));
  const handleBack = () => setPhase((prev) => Math.max(1, prev - 1));

  const totalMilestoneWeight = useMemo(
    () =>
      goalData?.milestones.reduce((total, milestone) => {
        const parsed = Number(milestone.weight);
        return Number.isFinite(parsed) ? total + parsed : total;
      }, 0),
    [goalData?.milestones],
  );

  const hasInvalidMilestone = goalData?.milestones.some((milestone) => {
    const parsed = Number(milestone.weight);
    return (
      milestone.title.trim().length === 0 ||
      !Number.isFinite(parsed) ||
      parsed <= 0
    );
  });

  const canSubmit =
    goalData &&
    goalData?.milestones.length > 0 &&
    totalMilestoneWeight === 100 &&
    !hasInvalidMilestone;

  const { mutate: createGoalMutate, loading: isCreatingGoal } = useMutation(
    async (payload: GoalData) => {
      if (!user?.uid) {
        throw new Error("You must be logged in to create a goal.");
      }

      await createGoal(user.uid, payload);
    },
    {
      onSuccess: () => {
        closeDialog();
      },
      onError: "Failed to create goal.",
    },
  );

  const { mutate: updateGoalMutate, loading: isUpdatingGoal } = useMutation(
    async (payload: GoalData) => {
      if (!user?.uid || !goalId) {
        throw new Error("You must be logged in to update a goal.");
      }

      const originalData = originalGoalDataRef.current;
      if (!originalData) {
        throw new Error("Goal data is still loading. Please try again.");
      }

      await updateGoalWithRelations(user.uid, {
        goalId,
        originalData,
        nextData: payload,
      });
    },
    {
      onSuccess: () => {
        if (user?.uid && goalId) {
          invalidateGoalDetailsCache(user.uid, goalId);
        }
        closeDialog();
      },
      onError: "Failed to update goal.",
    },
  );

  const isSubmittingGoal = isCreatingGoal || isUpdatingGoal;
  const hasEditChanges =
    mode !== "edit" || !originalGoalDataRef.current
      ? false
      : hasGoalDataChanged(originalGoalDataRef.current, goalData);
  const isSubmitDisabled =
    !canSubmit ||
    isHydratingGoalData ||
    isSubmittingGoal ||
    (mode === "edit" && !hasEditChanges);
  const isPhaseThreeOrFourHydrating =
    isHydratingGoalData && mode === "edit" && phase >= 3;

  const handleSubmit = async () => {
    if (isSubmitDisabled) {
      return;
    }

    if (mode === "edit") {
      await updateGoalMutate(goalData);
      return;
    }

    await createGoalMutate(goalData);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>{`Phase ${phase} of 4`}</p>
        </div>
        <Progress value={progressValue} className="h-1.5" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pt-5">
        {isPhaseThreeOrFourHydrating ? (
          <p className="text-sm text-muted-foreground">
            Loading goal details...
          </p>
        ) : null}

        {phase === 1 && (
          <CreateGoalPhaseOne
            title={goalData.title}
            setTitle={handleSetTitle}
            dueDate={goalData.dueDate}
            setDueDate={handleSetDueDate}
          />
        )}

        {phase === 2 && (
          <CreateGoalPhaseTwo
            why={goalData.why}
            setWhy={(why) => setGoalData((prev) => ({ ...prev, why }))}
          />
        )}

        {!isPhaseThreeOrFourHydrating && phase === 3 && (
          <CreateGoalPhaseThree
            nonNegotiables={goalData.nonNegotiables}
            setNonNegotiables={(updater) =>
              setGoalData((prev) => ({
                ...prev,
                nonNegotiables:
                  typeof updater === "function"
                    ? updater(prev.nonNegotiables)
                    : updater,
              }))
            }
          />
        )}

        {!isPhaseThreeOrFourHydrating && phase === 4 && (
          <CreateGoalPhaseFour
            milestones={goalData.milestones}
            setMilestones={(updater) =>
              setGoalData((prev) => ({
                ...prev,
                milestones:
                  typeof updater === "function"
                    ? updater(prev.milestones)
                    : updater,
              }))
            }
            totalWeight={totalMilestoneWeight}
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmittingGoal}
            className="w-30 hidden md:inline-flex"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={phase === 1 || isSubmittingGoal}
            className="w-30"
          >
            Back
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {phase === 2 && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleNext}
              disabled={isSubmittingGoal}
            >
              Skip
            </Button>
          )}

          {phase < 4 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="w-30"
              disabled={isSubmittingGoal}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              className="w-30"
              disabled={isSubmitDisabled}
            >
              {isSubmittingGoal
                ? mode === "edit"
                  ? "Saving..."
                  : "Creating..."
                : mode === "edit"
                  ? "Save changes"
                  : "Create goal"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalFlow;
