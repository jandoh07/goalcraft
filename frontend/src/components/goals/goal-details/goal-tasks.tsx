import TaskCard from "@/components/tasks/task-card";
import { getTaskType } from "@/lib/utils/task-grouping";
import { Task } from "@/types";
import { Loader2, Repeat, Calendar, Pause, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";

type TabType = "all" | "pending" | "completed" | "non-negotiable";

interface GoalTasksProps {
  allTasks: Task[] | undefined;
  stats: {
    total: number;
    completed: number;
    pending: number;
  };
  isLoading: boolean;
  nonNegotiables?: Task[];
  isLoadingNonNegotiables?: boolean;
}

const GoalTasks = ({
  allTasks,
  stats,
  isLoading,
  nonNegotiables,
  isLoadingNonNegotiables,
}: GoalTasksProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // Temporary mock data for non-negotiables
  const mockNonNegotiables: Task[] = [
    {
      id: "mock-1",
      userId: "user-1",
      title: "Morning Workout",
      description: "30 minutes of exercise to start the day",
      frequency: "daily",
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      status: "in-progress",
      createdAt: new Date(),
      updatedAt: new Date(),
      recurringStatus: "active",
    } as Task & { recurringStatus: string },
    {
      id: "mock-2",
      userId: "user-1",
      title: "Weekly Review",
      description: "Review progress and plan for next week",
      frequency: "weekly",
      nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      status: "in-progress",
      createdAt: new Date(),
      updatedAt: new Date(),
      recurringStatus: "active",
    } as Task & { recurringStatus: string },
    {
      id: "mock-3",
      userId: "user-1",
      title: "Read 20 pages",
      description: "Daily reading habit for personal growth",
      frequency: "daily",
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: "in-progress",
      createdAt: new Date(),
      updatedAt: new Date(),
      recurringStatus: "paused",
    } as Task & { recurringStatus: string },
    {
      id: "mock-4",
      userId: "user-1",
      title: "Monthly Budget Review",
      description: "Track expenses and adjust budget",
      frequency: "monthly",
      nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      status: "in-progress",
      createdAt: new Date(),
      updatedAt: new Date(),
      recurringStatus: "active",
    } as Task & { recurringStatus: string },
  ];

  // Use mock data if no real data exists (for preview)
  const displayNonNegotiables =
    nonNegotiables && nonNegotiables.length > 0
      ? nonNegotiables
      : mockNonNegotiables;

  const tabs: { key: TabType; label: string; value: number }[] = [
    { key: "all", label: "All", value: stats.total },
    { key: "pending", label: "Pending", value: stats.pending },
    { key: "completed", label: "Completed", value: stats.completed },
  ];

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

  const getFrequencyLabel = (frequency?: string) => {
    switch (frequency) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
      default:
        return frequency || "Custom";
    }
  };

  return (
    <div className="mb-4">
      <div className="border-b">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label + "(" + tab.value + ")"}
            </button>
          ))}
          <button
            onClick={() => setActiveTab("non-negotiable")}
            className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "non-negotiable"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Non-negotiables({displayNonNegotiables?.length || 0})
          </button>
        </div>
      </div>

      <div className="space-y-2 mt-4">
        {/* Regular tasks view */}
        {activeTab !== "non-negotiable" && (
          <>
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
                    console.log("Task clicked:", task);
                  }}
                  type={getTaskType(task.dueDate)}
                />
              ))}
          </>
        )}

        {/* Non-negotiables view */}
        {activeTab === "non-negotiable" && (
          <>
            {isLoadingNonNegotiables && (
              <div className="w-full h-32 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </div>
            )}

            {!isLoadingNonNegotiables &&
              (!displayNonNegotiables ||
                displayNonNegotiables.length === 0) && (
                <div className="text-center text-muted-foreground py-8">
                  <p>No non-negotiables set for this goal.</p>
                  <p className="text-sm mt-1">
                    Non-negotiables are recurring tasks that help you make
                    consistent progress.
                  </p>
                </div>
              )}

            {!isLoadingNonNegotiables &&
              displayNonNegotiables &&
              displayNonNegotiables.map((masterTask) => {
                const isActive =
                  (masterTask as { recurringStatus?: string })
                    .recurringStatus === "active";
                const isPaused =
                  (masterTask as { recurringStatus?: string })
                    .recurringStatus === "paused";

                return (
                  <div
                    key={masterTask.id}
                    className={`rounded-lg border p-4 space-y-2 ${
                      isPaused ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{masterTask.title}</h4>
                          {isPaused && (
                            <Badge variant="secondary" className="text-xs">
                              <Pause className="h-3 w-3 mr-1" />
                              Paused
                            </Badge>
                          )}
                          {isActive && (
                            <Badge
                              variant="outline"
                              className="text-xs text-green-600 border-green-600"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </div>
                        {masterTask.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {masterTask.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Repeat className="h-4 w-4" />
                        <span>{getFrequencyLabel(masterTask.frequency)}</span>
                      </div>
                      {masterTask.nextRun && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Next:{" "}
                            {new Date(masterTask.nextRun).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </>
        )}
      </div>
    </div>
  );
};

export default GoalTasks;
