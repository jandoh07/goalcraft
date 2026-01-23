import React from "react";
import { Progress } from "@/components/ui/progress";
import { GoalProgressItemProps } from "@/types";

export const GoalProgressItem: React.FC<GoalProgressItemProps> = ({ goal }) => {
  const progress = goal.totalTasks
    ? Math.round(((goal.completedTasks || 0) / goal.totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium truncate flex-1 mr-2">
          {goal.title}
        </span>
        <span className="text-sm text-muted-foreground">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{goal.category}</span>
        <span>
          {goal.completedTasks || 0}/{goal.totalTasks || 0} tasks
        </span>
      </div>
    </div>
  );
};
