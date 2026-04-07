import type { Dispatch, SetStateAction } from "react";

export type DurationUnit = "weeks" | "months" | "years";

export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "custom";

export type Weekday = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type NonNegotiableDraft = {
  id: string;
  title: string;
  frequency: RecurrenceFrequency;
  customDays: Weekday[];
};

export type MilestoneDraft = {
  id: string;
  title: string;
  weight: string;
};

export type GoalDraft = {
  title: string;
  durationValue: string;
  durationUnit: DurationUnit;
  why: string;
  nonNegotiables: NonNegotiableDraft[];
  milestones: MilestoneDraft[];
};

export type GoalDraftSetter = Dispatch<SetStateAction<GoalDraft>>;
