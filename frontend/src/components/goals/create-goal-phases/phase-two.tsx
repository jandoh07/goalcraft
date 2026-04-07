import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { GoalDraft, GoalDraftSetter } from "../create-goal-flow-types";
import { CreateGoalPhaseHeader } from "./phase-header";

interface CreateGoalPhaseTwoProps {
  draft: GoalDraft;
  setDraft: GoalDraftSetter;
}

export const CreateGoalPhaseTwo = ({
  draft,
  setDraft,
}: CreateGoalPhaseTwoProps) => {
  return (
    <div className="flex-1 space-y-5">
      <CreateGoalPhaseHeader title="Why does this matter?" subheading="" />

      <blockquote className="border-l-2 border-primary bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
        <p className="mb-2 font-medium text-primary">
          Why your &quot;why&quot; matters
        </p>
        <p>
          When motivation fades, your reason keeps you going. People with a
          clear why are far more likely to follow through even when it is
          inconvenient.
        </p>
      </blockquote>

      <div className="space-y-2">
        <Label htmlFor="goal-why">
          If this goal gets hard, why won&apos;t you quit?
        </Label>
        <Textarea
          id="goal-why"
          value={draft.why}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, why: event.target.value }))
          }
          placeholder="Write your reason, motivation, or deeper intent"
          className="min-h-30"
        />
      </div>
    </div>
  );
};
