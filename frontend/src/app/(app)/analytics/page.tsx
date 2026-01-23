"use client";

import React, { useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useGetTasks } from "@/hooks/use-tasks";
import { useGoals } from "@/hooks/use-goals";
import { useAnalyticsStats } from "@/hooks/use-analytics-stats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Target,
  CheckCircle2,
  Flame,
  Calendar,
  ListTodo,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  ContributionHeatmap,
  StatCard,
  GoalProgressItem,
  AnalyticsSkeleton,
} from "@/components/analytics";
import MobileHeader from "@/components/layout/mobile/header";

const Analytics: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { user, loading: authLoading } = useAuth();
  const { data: tasks = [], isLoading: tasksLoading } = useGetTasks(
    user?.uid || "",
  );
  const { data: goals = [], isLoading: goalsLoading } = useGoals(
    user?.uid || "",
  );

  const isLoading = authLoading || tasksLoading || goalsLoading;
  const stats = useAnalyticsStats(tasks, goals);

  const activeGoals = useMemo(
    () => goals.filter((g) => g.status === "in-progress").slice(0, 5),
    [goals],
  );

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="space-y-6 p-2 md:p-6">
      {/* Page Header */}
      <MobileHeader title="Analytics" />
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track your productivity and goal progress
        </p>
      </div>

      {/* Stats Grid */}
      {/* <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tasks Completed"
          value={stats.completedTasks}
          description={`${stats.completionRate}% completion rate`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          trend={
            stats.weeklyGrowth > 0
              ? { value: stats.weeklyGrowth, label: "vs last week" }
              : undefined
          }
        />
        <StatCard
          title="Active Goals"
          value={stats.activeGoals}
          description={`${stats.completedGoals} completed`}
          icon={<Target className="h-4 w-4" />}
        />
        <StatCard
          title="Current Streak"
          value={`${stats.currentStreak} days`}
          description={`Longest: ${stats.longestStreak} days`}
          icon={<Flame className="h-4 w-4" />}
        />
        <StatCard
          title="This Week"
          value={stats.thisWeekCompleted}
          description={`${stats.lastWeekCompleted} last week`}
          icon={<Calendar className="h-4 w-4" />}
        />
      </div> */}

      {/* Contribution Heatmap */}
      <Card className="py-4 md:py-6">
        <CardHeader className="px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="w-full">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5" />
                  Activity
                </CardTitle>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedYear((prev) => prev - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-semibold min-w-16 text-center">
                    {selectedYear}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedYear((prev) => prev + 1)}
                    disabled={selectedYear >= currentYear}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Your task completion history - days are colored based on
                completed tasks
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <ContributionHeatmap
            tasks={tasks}
            useDummyData={true}
            year={selectedYear}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
