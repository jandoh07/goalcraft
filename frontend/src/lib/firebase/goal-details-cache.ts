import { Goal, Milestone, NonNegotiable } from "@/types/goal";
import { getGoal, getGoalMilestones } from "./goals";
import { getGoalNonNegotiables } from "./non-negotiable";

const GOAL_DETAILS_TTL_MS = 60 * 1000;

interface GoalDetailsBundle {
  goal: Goal;
  milestones: Milestone[];
  nonNegotiables: NonNegotiable[];
}

interface GoalDetailsCacheEntry {
  data: GoalDetailsBundle | null;
  expiresAt: number;
  inFlight?: Promise<GoalDetailsBundle>;
}

const goalDetailsCache = new Map<string, GoalDetailsCacheEntry>();

const getCacheKey = (userId: string, goalId: string) => `${userId}:${goalId}`;

export const invalidateGoalDetailsCache = (userId: string, goalId: string) => {
  const key = getCacheKey(userId, goalId);
  goalDetailsCache.delete(key);
};

export const getGoalDetailsCached = async (
  userId: string,
  goalId: string,
  options?: { warmGoal?: Goal | null; forceRefetch?: boolean },
): Promise<GoalDetailsBundle> => {
  const key = getCacheKey(userId, goalId);
  const now = Date.now();
  const current = goalDetailsCache.get(key);

  if (!options?.forceRefetch && current?.data && current.expiresAt > now) {
    return current.data;
  }

  if (!options?.forceRefetch && current?.inFlight) {
    return current.inFlight;
  }

  const fetchPromise = Promise.all([
    options?.warmGoal
      ? Promise.resolve(options.warmGoal)
      : getGoal(userId, goalId),
    getGoalMilestones(userId, goalId),
    getGoalNonNegotiables(userId, goalId),
  ])
    .then(([goal, milestones, nonNegotiables]) => {
      if (!goal) {
        throw new Error("Goal not found.");
      }

      const data: GoalDetailsBundle = {
        goal,
        milestones,
        nonNegotiables,
      };

      goalDetailsCache.set(key, {
        data,
        expiresAt: Date.now() + GOAL_DETAILS_TTL_MS,
      });

      return data;
    })
    .finally(() => {
      const latest = goalDetailsCache.get(key);
      if (!latest?.inFlight) {
        return;
      }

      goalDetailsCache.set(key, {
        data: latest.data,
        expiresAt: latest.expiresAt,
      });
    });

  goalDetailsCache.set(key, {
    data: current?.data ?? null,
    expiresAt: current?.expiresAt ?? 0,
    inFlight: fetchPromise,
  });

  return fetchPromise;
};
