import {
  TriangleAlert,
  Calendar,
  CalendarDays,
  Clock,
  CalendarX2,
  Loader2,
  Archive,
  CircleCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type TaskGroup =
  | "overdue"
  | "today"
  | "tomorrow"
  | "upcoming"
  | "no-date"
  | "completed";

interface TaskGroupHeaderProps {
  group: TaskGroup;
  count: number;
  showLoading?: boolean;
  onArchiveAll?: () => void;
  isArchiving?: boolean;
}

const TaskGroupHeader = ({
  group,
  count,
  showLoading,
  onArchiveAll,
  isArchiving,
}: TaskGroupHeaderProps) => {
  const getIcon = () => {
    switch (group) {
      case "overdue":
        return <TriangleAlert className="text-destructive" strokeWidth={2.5} size={"18px"}  />;
      case "today":
        return <Calendar className="text-accent" strokeWidth={2.5} size={"18px"} />;
      case "tomorrow":
        return <CalendarDays className="text-orange-500" strokeWidth={2.5} size={"18px"} />;
      case "upcoming":
        return <Clock className="text-blue-400" strokeWidth={2.5} size={"18px"} />;
      case "no-date":
        return (
          <CalendarX2 className="text-muted-foreground" strokeWidth={2.5} size={"18px"} />
        );
      case "completed":
        return <CircleCheck className="text-green-500" strokeWidth={2.5} size={"18px"} />;
      default:
        return <Calendar className="text-muted-foreground" strokeWidth={2.5} size={"18px"} />;
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
      case "upcoming":
        return "text-blue-400";
      case "no-date":
        return "text-muted-foreground";
      case "completed":
        return "text-green-500";
      default:
        return "text-foreground";
    }
  };

  const getLabel = () => {
    const labels: Record<TaskGroup, string> = {
      overdue: "Overdue",
      today: "Today",
      tomorrow: "Tomorrow",
      upcoming: "Upcoming",
      "no-date": "No Date",
      completed: "Completed Today",
    };
    return labels[group];
  };

  if (count === 0) return null;

  return (
    <div className={`flex items-center justify-between mb-3 mt-5`}>
      <div className={`flex items-center gap-2 ${getTextColor()}`}>
        {getIcon()}
        <p className="font-semibold text-sm">
          {getLabel()} ({count})
        </p>
      </div>
      <div className="flex items-center gap-2">
        {group === "overdue" && onArchiveAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onArchiveAll}
            disabled={isArchiving}
            className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1.5"
          >
            {isArchiving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Archive className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Archive All</span>
          </Button>
        )}
        {showLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  );
};

export default TaskGroupHeader;
