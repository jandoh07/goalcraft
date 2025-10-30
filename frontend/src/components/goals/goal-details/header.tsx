import GoalIcon from "../goal-icon";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@/types";

interface HeaderProps {
  goal: Goal;
}

const Header = ({ goal }: HeaderProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{goal.title}</h2>
          <GoalIcon category={goal.category} />
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
          <span className="font-semibold">{goal.progress || 0}%</span>
        </div>
        <Progress value={goal.progress || 0} className="h-2" />
      </div>
    </div>
  );
};

export default Header;
