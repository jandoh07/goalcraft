import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  GoalDraft,
  GoalDraftSetter,
  DurationUnit,
} from "../create-goal-flow-types";
import { CreateGoalPhaseHeader } from "./phase-header";

interface CreateGoalPhaseOneProps {
  draft: GoalDraft;
  setDraft: GoalDraftSetter;
}

export const CreateGoalPhaseOne = ({
  draft,
  setDraft,
}: CreateGoalPhaseOneProps) => {
  return (
    <div className="flex-1 space-y-5">
      <CreateGoalPhaseHeader
        title="Set your goal"
        subheading="Give your goal a name and a timeframe."
      />

      <div className="space-y-2">
        <Label htmlFor="goal-title">Goal name</Label>
        <Input
          id="goal-title"
          value={draft.title}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, title: event.target.value }))
          }
          placeholder="Describe the goal you want to complete"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal-duration-value">Duration</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_170px]">
          <Input
            id="goal-duration-value"
            inputMode="numeric"
            value={draft.durationValue}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                durationValue: event.target.value.replace(/[^0-9]/g, ""),
              }))
            }
            placeholder="12"
          />
          <Select
            value={draft.durationUnit}
            onValueChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                durationUnit: value as DurationUnit,
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weeks">Weeks</SelectItem>
              <SelectItem value="months">Months</SelectItem>
              <SelectItem value="years">Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
