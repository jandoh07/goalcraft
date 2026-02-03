"use client";

import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle,
  Archive,
  ChevronDown,
  Flag,
  GitBranch,
  Repeat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import GoalIcon from "@/components/goals/goal-icon";
import { format } from "date-fns";

interface FilteredTasksListProps {
  tasks: Task[];
  statusFilter: "completed" | "archived";
  onTaskClick: (task: Task) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  isLoading: boolean;
}

function FilteredTaskCard({
  task,
  statusFilter,
  onClick,
}: {
  task: Task;
  statusFilter: "completed" | "archived";
  onClick: () => void;
}) {
  const getCompletedSubtasksCount = () => {
    if (!task.subtasks) return 0;
    return task.subtasks.filter((st) => st.completed).length;
  };

  return (
    <div
      className={cn(
        "rounded-lg border-l-3 px-2 py-4 my-3 flex justify-start items-start gap-2 shadow-sm bg-secondary hover:bg-secondary/40 cursor-pointer overflow-hidden",
        statusFilter === "completed" && "border-green-500 opacity-75",
        statusFilter === "archived" && "border-muted-foreground opacity-60",
      )}
      onClick={onClick}
    >
      <div className="space-y-1 min-w-0 flex-1">
        <p
          className={cn(
            "font-semibold",
            statusFilter === "completed" && "line-through",
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-start gap-2 overflow-x-auto custom-scrollbar">
          {task.dueDate && (
            <Badge className="text-[0.6rem]" variant="outline">
              {format(new Date(task.dueDate), "MMM d, yyyy")}
            </Badge>
          )}
          {task.recurringMasterId && (
            <Badge className="text-[0.6rem]" variant="outline">
              <Repeat className="h-3 w-3" />
            </Badge>
          )}
          {task.priority && (
            <Badge
              className={cn(
                "capitalize text-xs",
                task.priority === "high" && "bg-red-400",
                task.priority === "medium" && "bg-yellow-600",
                task.priority === "low" && "bg-green-600",
              )}
            >
              <Flag className="h-3 w-3" />
            </Badge>
          )}
          {task.subtasks && task.subtasks.length > 0 && (
            <Badge
              className="flex items-center gap-2 text-[0.6rem] px-2"
              variant="outline"
            >
              <GitBranch className="size-2" /> {getCompletedSubtasksCount()} /{" "}
              {task.subtasks.length}
            </Badge>
          )}
          {task.goalId && (
            <Badge className="text-[0.6rem]" variant="outline">
              <GoalIcon category="Finance" onlyIcon={true} />
              {task.goalTitle}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export function FilteredTasksList({
  tasks,
  statusFilter,
  onTaskClick,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  isLoading,
}: FilteredTasksListProps) {
  const getEmptyMessage = () => {
    if (statusFilter === "completed") {
      return "No completed tasks found.";
    }
    return "No archived tasks found.";
  };

  const getHeaderIcon = () => {
    if (statusFilter === "completed") {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Archive className="h-5 w-5 text-muted-foreground" />;
  };

  const getHeaderLabel = () => {
    if (statusFilter === "completed") {
      return "Completed Tasks";
    }
    return "Archived Tasks";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 mt-2">
        {getHeaderIcon()}
        <p className="font-semibold">
          {getHeaderLabel()} ({tasks.length}
          {hasNextPage ? "+" : ""})
        </p>
      </div>

      {/* Tasks */}
      {tasks.length === 0 ? (
        <div className="text-center text-muted-foreground py-10">
          <p>{getEmptyMessage()}</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {tasks.map((task) => (
              <FilteredTaskCard
                key={task.id}
                task={task}
                statusFilter={statusFilter}
                onClick={() => onTaskClick(task)}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadMore}
                disabled={isFetchingNextPage}
                className="gap-2"
              >
                {isFetchingNextPage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
