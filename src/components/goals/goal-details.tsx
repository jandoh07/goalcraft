"use client";

import { Goal } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { useGetTasks } from "@/hooks/use-tasks";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import TaskCard from "@/components/tasks/task-card";
import { getTaskType } from "@/lib/utils/task-grouping";
import { Loader2 } from "lucide-react";

interface GoalDetailsProps {
  goal: Goal;
}

type TabType = "all" | "pending" | "completed";

const GoalDetails = ({ goal }: GoalDetailsProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // Fetch tasks for this goal
  const { data: allTasks, isLoading } = useGetTasks(user?.uid || "", {
    goalId: goal.id,
  });

  // Calculate statistics
  const stats = useMemo(() => {
    if (!allTasks) return { total: 0, completed: 0, pending: 0, progress: 0 };

    const total = allTasks.length;
    const completed = allTasks.filter(
      (task) => task.status === "completed"
    ).length;
    const pending = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, progress };
  }, [allTasks]);

  // Filter tasks based on active tab
  const filteredTasks = useMemo(() => {
    if (!allTasks) return [];

    switch (activeTab) {
      case "completed":
        return allTasks.filter((task) => task.status === "completed");
      case "pending":
        return allTasks.filter((task) => task.status === "in-progress");
      default:
        return allTasks;
    }
  }, [allTasks, activeTab]);

  const tabs: { value: TabType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
  ];

  const statsCard = [
    { label: "Completed", value: stats.completed },
    { label: "Remaining", value: stats.pending },
    { label: "Total", value: stats.total },
  ];

  return (
    <div className="space-y-4">
      {/* Goal Header Info */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">{goal.title}</h2>
            <Badge variant="outline" className="capitalize">
              {goal.category}
            </Badge>
          </div>
          <Badge
            variant={goal.status === "completed" ? "default" : "secondary"}
            className="capitalize"
          >
            {goal.status}
          </Badge>
        </div>

        {goal.description && (
          <p className="text-sm text-muted-foreground">{goal.description}</p>
        )}

        {/* Dates */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="size-4" />
            <span>Created: {format(goal.createdAt, "MMM dd, yyyy")}</span>
          </div>
          {goal.dueDate && (
            <div className="flex items-center gap-2">
              <Clock className="size-4" />
              <span>Due: {format(goal.dueDate, "MMM dd, yyyy")}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-semibold">{stats.progress}%</span>
          </div>
          <Progress value={stats.progress} className="h-2" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 justify-between items-center gap-3">
        {statsCard.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex flex-col items-center">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground capitalize">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {isLoading && (
          <div className="w-full h-32 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </div>
        )}

        {!isLoading && filteredTasks.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p>No tasks found.</p>
          </div>
        )}

        {!isLoading &&
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => {
                // Handle task click - could open task details
                console.log("Task clicked:", task);
              }}
              type={getTaskType(task.dueDate)}
            />
          ))}
      </div>
    </div>
  );
};

export default GoalDetails;
