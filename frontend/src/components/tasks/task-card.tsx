"use client";

import { Task } from "@/types";
import { Badge } from "../ui/badge";
import {useSortable} from '@dnd-kit/react/sortable';
import {
  GitBranch,
  GripVertical,
  Repeat,
  AlertTriangle,
  Star,
  Tags,
} from "lucide-react";
import { useToggleTaskStatus } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";
interface TaskCardProps {
  task: Task;
  index: number;
  onClick?: () => void;
  showQuadrantBadges?: boolean;
}

export function TaskCard({
  task,
  index,
  onClick = () => {},
  showQuadrantBadges = false,
}: TaskCardProps) {
  const toggleTaskStatus = useToggleTaskStatus();
  const {ref, handleRef} = useSortable({ id: task.id!, index, data: { task } });

  const getCompletedSubtasksCount = () => {
    if (!task.subtasks) return 0;
    return task.subtasks.filter((st) => st.completed).length;
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border px-2 py-3 flex justify-start items-start gap-2 shadow-sm bg-background hover:bg-muted/50 cursor-pointer overflow-hidden"
      )}
      onClick={onClick}
    >
      {/* Drag handle */}
      <button
        ref={handleRef}
        className={cn(
          "cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="size-4" />
      </button>

      <div onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="size-4 bg-background"
          checked={task.status === "completed"}
          onChange={() =>
            toggleTaskStatus.mutate({
              taskId: task.id || "",
              currentStatus: task.status,
            })
          }
        />
      </div>

      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex justify-between items-start">
          <p
            className={cn(
              "font-medium text-sm",
              task.status === "completed" &&
                "line-through text-muted-foreground",
            )}
          >
            {task.title}
          </p>
          {task.recurringMasterId && (
            <Badge className="text-[10px] px-1.5 py-0 h-5" variant="outline">
              <Repeat className="size-2.5" />
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {showQuadrantBadges && (
            <>
              {task.isImportant && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-5 gap-1 border-blue-500/50 text-blue-600"
                >
                  <Star className="size-2.5" />
                  Important
                </Badge>
              )}
              {task.isUrgent && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-5 gap-1 border-red-500/50 text-red-600"
                >
                  <AlertTriangle className="size-2.5" />
                  Urgent
                </Badge>
              )}
            </>
          )}

          {task.subtasks && task.subtasks.length > 0 && (
            <Badge
              className="text-[10px] px-1.5 py-0 h-5 gap-1"
              variant="outline"
            >
              <GitBranch className="size-2.5" />
              {getCompletedSubtasksCount()}/{task.subtasks.length}
            </Badge>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {task.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-5 gap-1"
                >
                  <Tags className="size-2.5" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
