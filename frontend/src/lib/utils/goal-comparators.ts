import { GoalData, Milestone, NonNegotiable } from "@/types/goal";

export const areSameMilestone = (a: Milestone, b: Milestone) =>
  a.title === b.title && a.weight === b.weight && a.status === b.status;

export const areSameNonNegotiable = (a: NonNegotiable, b: NonNegotiable) => {
  const aDays = [...a.customDays].sort().join(",");
  const bDays = [...b.customDays].sort().join(",");

  return a.title === b.title && a.frequency === b.frequency && aDays === bDays;
};

export const areSameMilestoneLists = (
  a: GoalData["milestones"],
  b: GoalData["milestones"],
) => {
  if (a.length !== b.length) {
    return false;
  }

  const aById = new Map(a.map((item) => [item.id, item]));

  return b.every((item) => {
    const existing = aById.get(item.id);
    return !!existing && areSameMilestone(existing, item);
  });
};

export const areSameNonNegotiableLists = (
  a: GoalData["nonNegotiables"],
  b: GoalData["nonNegotiables"],
) => {
  if (a.length !== b.length) {
    return false;
  }

  const aById = new Map(a.map((item) => [item.id, item]));

  return b.every((item) => {
    const existing = aById.get(item.id);
    if (!existing) {
      return false;
    }

    if (existing.goalId !== item.goalId) {
      return false;
    }

    return areSameNonNegotiable(existing, item);
  });
};

export const hasGoalDataChanged = (
  originalData: GoalData,
  nextData: GoalData,
) => {
  if (
    originalData.title !== nextData.title ||
    originalData.dueDate !== nextData.dueDate ||
    originalData.why !== nextData.why
  ) {
    return true;
  }

  if (!areSameMilestoneLists(originalData.milestones, nextData.milestones)) {
    return true;
  }

  if (
    !areSameNonNegotiableLists(
      originalData.nonNegotiables,
      nextData.nonNegotiables,
    )
  ) {
    return true;
  }

  return false;
};
