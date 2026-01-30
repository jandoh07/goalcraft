import {
  TriangleAlert,
  Calendar,
  CalendarDays,
  Clock,
  CalendarX2,
  Loader2,
} from "lucide-react";
import { TaskGroup } from "@/lib/utils/task-grouping";

interface TaskGroupHeaderProps {
  group: TaskGroup;
  count: number;
  showLoading?: boolean;
}

const TaskGroupHeader = ({
  group,
  count,
  showLoading,
}: TaskGroupHeaderProps) => {
  const getIcon = () => {
    switch (group) {
      case "overdue":
        return <TriangleAlert className="text-destructive" strokeWidth={2.5} />;
      case "today":
        return <Calendar className="text-accent" strokeWidth={2.5} />;
      case "tomorrow":
        return <CalendarDays className="text-orange-500" strokeWidth={2.5} />;
      case "this-week":
        return <CalendarDays className="text-blue-400" strokeWidth={2.5} />;
      case "later":
        return <Clock className="text-muted-foreground" strokeWidth={2.5} />;
      case "no-date":
        return (
          <CalendarX2 className="text-muted-foreground" strokeWidth={2.5} />
        );
      default:
        return <Calendar className="text-muted-foreground" strokeWidth={2.5} />;
    }
  };

  const getTextColor = () => {
    switch (group) {
      case "overdue":
        return "text-destructive";
      case "today":
        return "text-accent";
      case "tomorrow":
        return "text-orange-500";
      case "this-week":
        return "text-blue-400";
      case "later":
        return "text-muted-foreground";
      case "no-date":
        return "text-muted-foreground";
      default:
        return "text-foreground";
    }
  };

  const getLabel = () => {
    const labels: Record<TaskGroup, string> = {
      overdue: "Overdue",
      today: "Today",
      tomorrow: "Tomorrow",
      "this-week": "This Week",
      later: "Later",
      "no-date": "No Date",
    };
    return labels[group];
  };

  if (count === 0) return null;

  return (
    <div className={`flex items-center justify-between mb-3 mt-5`}>
      <div className={`flex items-center gap-2 ${getTextColor()}`}>
        {getIcon()}
        <p className="font-semibold">
          {getLabel()} ({count})
        </p>
      </div>
      {showLoading && (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      )}
    </div>
  );
};

export default TaskGroupHeader;
