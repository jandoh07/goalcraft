"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { GoalDraft } from "@/components/goals/create-goal-flow-types";
import { CreateGoalPhaseOne } from "@/components/goals/create-goal-phases/phase-one";
import { CreateGoalPhaseTwo } from "@/components/goals/create-goal-phases/phase-two";
import { CreateGoalPhaseThree } from "@/components/goals/create-goal-phases/phase-three";
import { CreateGoalPhaseFour } from "@/components/goals/create-goal-phases/phase-four";

interface CreateGoalFlowProps {
  isOpen: boolean;
  onSubmit: () => void;
}

const createInitialDraft = (): GoalDraft => ({
  title: "Run my first 10k",
  durationValue: "12",
  durationUnit: "weeks",
  why: "I want to build discipline, improve my health, and prove I can finish hard things.",
  nonNegotiables: [
    {
      id: "nn-1",
      title: "Run training session",
      frequency: "weekly",
      customDays: [],
    },
  ],
  milestones: [
    { id: "ms-1", title: "Build consistency", weight: "25" },
    { id: "ms-2", title: "Reach distance target", weight: "75" },
  ],
});

const CreateGoalFlow = ({ isOpen, onSubmit }: CreateGoalFlowProps) => {
  const [phase, setPhase] = useState(1);
  const [draft, setDraft] = useState<GoalDraft>(createInitialDraft);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setPhase(1);
    setDraft(createInitialDraft());
  }, [isOpen]);

  const progressValue = useMemo(() => (phase / 4) * 100, [phase]);

  const handleNext = () => setPhase((prev) => Math.min(4, prev + 1));
  const handleBack = () => setPhase((prev) => Math.max(1, prev - 1));

  const totalMilestoneWeight = useMemo(
    () =>
      draft.milestones.reduce((total, milestone) => {
        const parsed = Number(milestone.weight);
        return Number.isFinite(parsed) ? total + parsed : total;
      }, 0),
    [draft.milestones],
  );

  const hasInvalidMilestone = draft.milestones.some((milestone) => {
    const parsed = Number(milestone.weight);
    return (
      milestone.title.trim().length === 0 ||
      !Number.isFinite(parsed) ||
      parsed <= 0
    );
  });

  const canSubmit =
    draft.milestones.length > 0 &&
    totalMilestoneWeight === 100 &&
    !hasInvalidMilestone;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>{`Phase ${phase} of 4`}</p>
        </div>
        <Progress value={progressValue} className="h-1.5" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pt-5">
        {phase === 1 && (
          <CreateGoalPhaseOne draft={draft} setDraft={setDraft} />
        )}

        {phase === 2 && (
          <CreateGoalPhaseTwo draft={draft} setDraft={setDraft} />
        )}

        {phase === 3 && (
          <CreateGoalPhaseThree draft={draft} setDraft={setDraft} />
        )}

        {phase === 4 && (
          <CreateGoalPhaseFour
            draft={draft}
            setDraft={setDraft}
            totalWeight={totalMilestoneWeight}
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={phase === 1}
            className="w-30"
          >
            Back
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {phase === 2 && (
            <Button type="button" variant="ghost" onClick={handleNext}>
              Skip
            </Button>
          )}

          {phase < 4 ? (
            <Button type="button" onClick={handleNext} className="w-30">
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onSubmit}
              className="w-30"
              disabled={!canSubmit}
            >
              Create goal
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateGoalFlow;
