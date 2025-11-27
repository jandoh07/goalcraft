"use client";
import { Task } from "@/types";
import { Badge } from "../ui/badge";
import { Flag, GitBranch, Repeat } from "lucide-react";
import GoalIcon from "../goals/goal-icon";
import { useToggleTaskStatus } from "@/hooks/use-tasks";

interface TaskCardProps {
  type: "overdue" | "today" | "tomorrow" | "this-week" | "later" | "no-date";
  onClick: () => void;
  task: Task;
}

const TaskCard = ({ type, onClick, task }: TaskCardProps) => {
  const toggleTaskStatus = useToggleTaskStatus();

  const getBorderColor = () => {
    switch (type) {
      case "overdue":
        return "border-destructive";
      case "today":
        return "border-accent";
      case "tomorrow":
        return "border-orange-500";
      case "this-week":
        return "border-blue-400";
      case "later":
        return "border-muted-foreground";
      case "no-date":
        return "border-muted-foreground";
      default:
        return "border-gray-500";
    }
  };

  const getCompletedSubtasksCount = () => {
    if (!task.subtasks) return 0;
    return task.subtasks.filter((st) => st.completed).length;
  };

  return (
    <div
      className={`rounded-lg border-l-3 ${getBorderColor()} px-2 py-4 my-3 flex justify-start items-start gap-2 shadow-sm bg-secondary hover:bg-secondary/40 cursor-pointer overflow-hidden`}
      onClick={onClick}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="size-4 bg-background"
          checked={task.status === "completed"}
          onChange={() =>
            toggleTaskStatus.mutate({
              taskId: task.id || "",
              currentStatus: task.status,
              goalId: task.goalId,
            })
          }
        />
      </div>
      <div className="space-y-1 min-w-0 flex-1">
        <p
          className={`font-semibold ${
            task.status === "completed" ? "line-through" : ""
          }`}
        >
          {task.title}
        </p>
        <p className="text-sm">{task.description}</p>
        <div className="flex items-center justify-start gap-2 overflow-x-auto custom-scrollbar">
          {task.recurringMasterId && (
            <Badge className="text-[0.6rem]" variant={"outline"}>
              <Repeat />
            </Badge>
          )}
          {task.priority && (
            <Badge
              className={`capitalize text-xs ${
                task.priority === "high"
                  ? "bg-red-400"
                  : task.priority === "medium"
                  ? "bg-yellow-600"
                  : "bg-green-600"
              }`}
            >
              <Flag />
            </Badge>
          )}
          {task.subtasks && task.subtasks.length > 0 && (
            <Badge
              className="flex items-center gap-2 text-[0.6rem] px-2"
              variant={"outline"}
            >
              <GitBranch className="size-2" /> {getCompletedSubtasksCount()} /{" "}
              {task.subtasks.length}
            </Badge>
          )}
          {task.goalId && (
            <Badge className="text-[0.6rem]" variant={"outline"}>
              <GoalIcon category={"Finance"} onlyIcon={true} />
              {task.goalTitle}
            </Badge>
          )}
          {/* {task.dueDate && (
            <div className="text-xs text-muted-foreground">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
