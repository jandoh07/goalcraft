"use client";
import { useState } from "react";

interface TaskCardProps {
  type: "overdue" | "today" | "tomorrow" | "this-week";
  onClick: () => void;
}

const TaskCard = ({ type, onClick }: TaskCardProps) => {
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
          Complete project proposal
        </p>
        <p className="text-sm">Final review and submission needed</p>
        <div className="flex items-center justify-start gap-2">
          <div className="px-2 py-1 bg-red-500/25 text-red-500 rounded-2xl text-xs">
            High Priority
          </div>
          <div className="px-2 py-1 bg-blue-500/25 text-blue-500 rounded-2xl text-xs">
            Work Goals
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
