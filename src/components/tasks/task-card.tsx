"use client";
import { Task } from "@/types";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Flag } from "lucide-react";

interface TaskCardProps {
  type: "overdue" | "today" | "tomorrow" | "this-week" | "later" | "no-date";
  onClick: () => void;
  task: Task;
}

const TaskCard = ({ type, onClick, task }: TaskCardProps) => {
  const [isChecked, setIsChecked] = useState(false);

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

  return (
    <div
      className={`rounded-lg border-l-3 ${getBorderColor()} px-2 py-4 my-3 flex justify-start items-start gap-2 shadow-sm bg-secondary hover:bg-secondary/40 cursor-pointer`}
      onClick={onClick}
    >
      <div>
        <input
          type="checkbox"
          className="size-4 bg-background"
          checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
        />
      </div>
      <div className="space-y-1">
        <p className={`font-semibold ${isChecked ? "line-through" : ""}`}>
          {task.title}
        </p>
        <p className="text-sm">{task.description}</p>
        <div className="flex items-center justify-start gap-2">
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
              {/* {task.priority + " Priority"} */}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
