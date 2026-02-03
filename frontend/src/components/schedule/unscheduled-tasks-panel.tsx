"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  ListTodo,
  X,
  AlertTriangle,
  Flag,
  ChevronUp,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isTomorrow, isPast } from "date-fns";

interface UnscheduledTasksPanelProps {
  tasks: Task[];
  isOpen: boolean;
  onToggle: () => void;
  isDragging?: boolean;
}

// Desktop sidebar panel (hidden on mobile)
export function UnscheduledTasksPanel({
  tasks,
  isOpen,
  onToggle,
  isDragging,
}: UnscheduledTasksPanelProps) {
  return (
    <>
      {/* Backdrop for tablet/desktop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 hidden md:block lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Panel - hidden on mobile, shown on md+ */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full z-50 flex-col bg-background border-r shadow-xl transition-transform duration-300 ease-in-out",
          "w-72 md:w-80",
          "hidden md:flex",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Unscheduled Tasks</span>
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {tasks.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggle}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tasks list - disable overflow when dragging to prevent auto-scroll */}
        <div
          className={cn(
            "flex-1 p-2 space-y-2",
            isDragging ? "overflow-hidden" : "overflow-y-auto custom-scrollbar",
          )}
        >
          {tasks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-sm">All tasks scheduled!</p>
              <p className="text-xs mt-1">Or no tasks available</p>
            </div>
          ) : (
            tasks.map((task) => (
              <DraggableScheduleTask key={task.id} task={task} />
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="p-2 border-t bg-muted/30 shrink-0">
          <p className="text-[10px] text-muted-foreground text-center">
            Drag tasks to schedule them
          </p>
        </div>
      </div>
    </>
  );
}

// Mobile top drawer component
interface MobileTasksDrawerProps {
  tasks: Task[];
  isOpen: boolean;
  onToggle: () => void;
  isDragging?: boolean;
}

export function MobileTasksDrawer({
  tasks,
  isOpen,
  onToggle,
  isDragging,
}: MobileTasksDrawerProps) {
  // Only render when open on mobile
  if (!isOpen) return null;

  return (
    <>
      {/* Drawer - fixed positioned below mobile header */}
      <div
        className="md:hidden fixed left-0 right-0 z-40 bg-background border-b shadow-lg"
        style={{ top: "52px" }} // Mobile header height
      >
        {/* Header */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between py-2 px-3 bg-muted/30 border-b text-sm"
        >
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Unscheduled Tasks</span>
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {tasks.length}
            </Badge>
          </div>
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Tasks list - horizontal scroll, shows ~2 tasks */}
        <div
          className={cn(
            "flex gap-2 p-2 touch-pan-x",
            isDragging ? "overflow-hidden" : "overflow-x-auto custom-scrollbar",
          )}
          style={{ maxHeight: "140px" }}
        >
          {tasks.length === 0 ? (
            <div className="w-full text-center text-muted-foreground py-4">
              <p className="text-sm">All tasks scheduled!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <MobileDraggableTask key={task.id} task={task} />
            ))
          )}
        </div>

        {/* Hint */}
        <div className="px-3 pb-2">
          <p className="text-[10px] text-muted-foreground text-center">
            Drag tasks down to schedule them
          </p>
        </div>
      </div>
    </>
  );
}

// Mobile-specific draggable task - more compact, horizontal layout friendly
// Uses a drag handle so users can still scroll the list
function MobileDraggableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `mobile-task-${task.id}`,
      data: { task, type: "unscheduled-task" },
    });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 100 : undefined,
      }
    : undefined;

  const isImportant = task.isImportant ?? false;
  const isUrgent = task.isUrgent ?? false;

  const draggingStyle = isDragging ? { opacity: 0.4 } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...draggingStyle }}
      className={cn(
        "shrink-0 w-50 rounded-md border bg-background transition-colors overflow-hidden",
        // Highlight based on Eisenhower priority
        isImportant && isUrgent && "border-l-2 border-l-red-500",
        isImportant && !isUrgent && "border-l-2 border-l-orange-500",
        !isImportant && isUrgent && "border-l-2 border-l-yellow-500",
      )}
    >
      {/* Drag handle - only this part triggers drag */}
      <div
        {...listeners}
        {...attributes}
        className="px-2 pt-2 pb-1 cursor-grab active:cursor-grabbing touch-none flex items-center"
      >
        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
          <GripVertical className="h-3 w-3" />
        </div>
        <div className="flex items-center gap-1">
          <p
            className={`font-medium text-xs w-44 truncate ${!isImportant || !isUrgent || !task.dueDate ? "line-clamp-2" : ""}`}
          >
            {task.title}
          </p>
          {isImportant && <Flag className="h-3 w-3 text-orange-500 shrink-0" />}
          {isUrgent && (
            <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
          )}
        </div>
      </div>
      {task.dueDate && (
        <p className="text-[10px] text-muted-foreground px-2 pb-2">
          {isToday(new Date(task.dueDate))
            ? "Today"
            : isTomorrow(new Date(task.dueDate))
              ? "Tomorrow"
              : format(new Date(task.dueDate), "MMM d")}
        </p>
      )}
    </div>
  );
}

// Draggable task card for the schedule panel
function DraggableScheduleTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `schedule-task-${task.id}`,
      data: { task, type: "unscheduled-task" },
    });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 100 : undefined,
      }
    : undefined;

  const getDueDateColor = () => {
    if (!task.dueDate) return "text-muted-foreground";
    const dueDate = new Date(task.dueDate);
    if (isPast(dueDate) && !isToday(dueDate)) return "text-red-500";
    if (isToday(dueDate)) return "text-orange-500";
    if (isTomorrow(dueDate)) return "text-yellow-600";
    return "text-muted-foreground";
  };

  const formatDueDate = () => {
    if (!task.dueDate) return null;
    const dueDate = new Date(task.dueDate);
    if (isToday(dueDate)) return "Today";
    if (isTomorrow(dueDate)) return "Tomorrow";
    return format(dueDate, "MMM d");
  };

  const isImportant = task.isImportant ?? false;
  const isUrgent = task.isUrgent ?? false;

  // When dragging, the original stays in place with reduced opacity
  // The DragOverlay shows the dragged preview
  const draggingStyle = isDragging ? { opacity: 0.4 } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...draggingStyle }}
      {...listeners}
      {...attributes}
      className={cn(
        "rounded-md border px-2 py-2 cursor-grab bg-background hover:bg-muted/50 transition-colors",
        "active:cursor-grabbing touch-none",
        // Highlight based on Eisenhower priority
        isImportant && isUrgent && "border-l-2 border-l-red-500",
        isImportant && !isUrgent && "border-l-2 border-l-orange-500",
        !isImportant && isUrgent && "border-l-2 border-l-yellow-500",
      )}
    >
      <div className="flex items-center gap-1.5">
        <p className="font-medium text-sm truncate flex-1">{task.title}</p>
        {/* Eisenhower badges */}
        {isImportant && <Flag className="h-3 w-3 text-orange-500 shrink-0" />}
        {isUrgent && (
          <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
        )}
      </div>
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        {task.dueDate && (
          <span className={cn("text-[10px]", getDueDateColor())}>
            {formatDueDate()}
          </span>
        )}
        {task.priority && (
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] px-1 py-0 h-4",
              task.priority === "high"
                ? "border-red-500/50 text-red-500"
                : task.priority === "medium"
                  ? "border-yellow-500/50 text-yellow-600"
                  : "border-green-500/50 text-green-600",
            )}
          >
            {task.priority}
          </Badge>
        )}
        {task.goalTitle && (
          <span className="text-[10px] text-muted-foreground truncate max-w-20">
            {task.goalTitle}
          </span>
        )}
      </div>
    </div>
  );
}

// Small overlay card when dragging to schedule
export function ScheduleTaskDragOverlay({ task }: { task: Task }) {
  return (
    <div className="rounded-md border-l-3 border-blue-500 px-2 py-2 bg-blue-500/20 shadow-lg w-40 backdrop-blur-sm">
      <p className="font-medium text-xs truncate text-blue-900 dark:text-blue-100">
        {task.title}
      </p>
    </div>
  );
}
