import TaskCard from "@/components/tasks/task-card";
import { getTaskType } from "@/lib/utils/task-grouping";
import { Task } from "@/types";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

type TabType = "all" | "pending" | "completed";

interface GoalTasksProps {
  allTasks: Task[] | undefined;
  stats: {
    total: number;
    completed: number;
    pending: number;
  };
  isLoading: boolean;
}

const GoalTasks = ({ allTasks, stats, isLoading }: GoalTasksProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("all");

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

  return (
    <div>
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
        </div>
      </div>

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
                console.log("Task clicked:", task);
              }}
              type={getTaskType(task.dueDate)}
            />
          ))}
      </div>
    </div>
  );
};

export default GoalTasks;
