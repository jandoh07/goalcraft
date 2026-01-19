import { useMemo } from "react";
import { Task, Goal, AnalyticsStats } from "@/types";
import { getDateKey, startOfDay, subDays } from "@/lib/utils/analytics";

export const useAnalyticsStats = (
  tasks: Task[],
  goals: Goal[],
): AnalyticsStats => {
  return useMemo(() => {
    if (!tasks.length && !goals.length) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        activeGoals: 0,
        completedGoals: 0,
        currentStreak: 0,
        longestStreak: 0,
        thisWeekCompleted: 0,
        lastWeekCompleted: 0,
        weeklyGrowth: 0,
      };
    }

    const completedTasks = tasks.filter((t) => t.status === "completed");
    const activeGoals = goals.filter((g) => g.status === "in-progress");
    const completedGoalsArr = goals.filter((g) => g.status === "completed");

    // Calculate streaks
    const completedDates = new Set(
      completedTasks.map((t) => getDateKey(new Date(t.updatedAt))),
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = startOfDay(new Date());

    // Check current streak (including today)
    for (let i = 0; i < 365; i++) {
      const date = subDays(today, i);
      const dateKey = getDateKey(date);
      if (completedDates.has(dateKey)) {
        if (i === 0 || currentStreak > 0) {
          currentStreak++;
        }
      } else if (i > 0) {
        break;
      }
    }

    // Calculate longest streak
    const sortedDates = Array.from(completedDates).sort();
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.round(
          (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    // This week vs last week comparison
    const startOfThisWeek = subDays(today, today.getDay());
    const startOfLastWeek = subDays(startOfThisWeek, 7);

    const thisWeekCompleted = completedTasks.filter((t) => {
      const date = new Date(t.updatedAt);
      return date >= startOfThisWeek && date <= today;
    }).length;

    const lastWeekCompleted = completedTasks.filter((t) => {
      const date = new Date(t.updatedAt);
      return date >= startOfLastWeek && date < startOfThisWeek;
    }).length;

    const weeklyGrowth =
      lastWeekCompleted > 0
        ? Math.round(
            ((thisWeekCompleted - lastWeekCompleted) / lastWeekCompleted) * 100,
          )
        : thisWeekCompleted > 0
          ? 100
          : 0;

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      completionRate:
        tasks.length > 0
          ? Math.round((completedTasks.length / tasks.length) * 100)
          : 0,
      activeGoals: activeGoals.length,
      completedGoals: completedGoalsArr.length,
      currentStreak,
      longestStreak,
      thisWeekCompleted,
      lastWeekCompleted,
      weeklyGrowth,
    };
  }, [tasks, goals]);
};
