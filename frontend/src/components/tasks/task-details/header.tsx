import { Task } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import GoalIcon from "@/components/goals/goal-icon";
import { format } from "date-fns";

interface HeaderProps {
  task: Task;
  setMode: (mode: "view" | "edit") => void;
}

const Header = ({ task, setMode }: HeaderProps) => {
  return (
    <div>
      <div className="flex justify-between items-start mt-1">
        <div>
          <div className="flex items-start gap-2">
            <input type="checkbox" className="mt-1 size-5" />
            <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}
        </div>
        <div className="flex justify-between items-start">
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setMode("edit")}>
                <Pencil className="h-4 w-4" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                <Trash2 className="h-4 w-4" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Associated Goal */}
      {task.goalId && task.goalTitle && (
        <div className="">
          <Badge
            variant="outline"
            className="text-xs line-clamp-1 flex items-center"
          >
            <GoalIcon category={task.goalCategory || ""} onlyIcon={true} />
            {task.goalTitle}
          </Badge>
        </div>
      )}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
        <div className="flex items-center gap-2">
          <Calendar className="size-4" />
          <span>Created: {format(task.createdAt, "MMM dd, yyyy")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4" />
          <span>
            Due:{" "}
            {task.dueDate
              ? format(task.dueDate, "MMM dd, yyyy")
              : "No due date"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;
