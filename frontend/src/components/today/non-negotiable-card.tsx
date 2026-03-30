import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface NonNegotiableTask {
  id: string;
  title: string;
  duration: number; // minutes
  completed: boolean;
}

interface NonNegotiable {
  id: string;
  title: string;
  totalDuration: number; // minutes
  tasks: NonNegotiableTask[];
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function NonNegotiableCard({
  nonNegotiable,
  onToggleTask,
  onDeleteTask,
  onAddTask,
}: {
  nonNegotiable: NonNegotiable;
  onToggleTask: (nnId: string, taskId: string) => void;
  onDeleteTask: (nnId: string, taskId: string) => void;
  onAddTask: (nnId: string, title: string, duration: number) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const completedTasks = nonNegotiable.tasks.filter((t) => t.completed).length;
  const totalTasks = nonNegotiable.tasks.length;
  const completedDuration = nonNegotiable.tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.duration, 0);
  const actualTotalDuration = nonNegotiable.tasks.reduce(
    (sum, t) => sum + t.duration,
    0,
  );
  const progressPercent =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card className={cn("py-0 gap-0 overflow-hidden border")}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 py-4 px-6 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{nonNegotiable.title}</span>
            <Badge variant="secondary" className="text-xs font-normal">
              <Clock className="size-3 mr-1" />
              {formatDuration(nonNegotiable.totalDuration)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <Progress value={progressPercent} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground shrink-0">
              {completedTasks}/{totalTasks} tasks &middot;{" "}
              {formatDuration(completedDuration)}/
              {formatDuration(actualTotalDuration)}
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Task List */}
      {expanded && (
        <CardContent className="pt-0 pb-3 px-4">
          <div className="pl-2">
            {nonNegotiable.tasks.map((task) => (
              <NonNegotiableTaskItem
                key={task.id}
                task={task}
                onToggle={(taskId) => onToggleTask(nonNegotiable.id, taskId)}
                onDelete={(taskId) => onDeleteTask(nonNegotiable.id, taskId)}
              />
            ))}
            <AddTaskInline
              onAdd={(title, duration) =>
                onAddTask(nonNegotiable.id, title, duration)
              }
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function NonNegotiableTaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: NonNegotiableTask;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-3 py-2 px-3 rounded-lg transition-colors hover:bg-muted/50",
        task.completed && "opacity-60",
      )}
    >
      <GripVertical className="size-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0" />
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          "shrink-0 size-5 rounded-full border-2 flex items-center justify-center transition-all",
          task.completed
            ? "bg-primary border-primary"
            : "border-muted-foreground/30 hover:border-primary",
        )}
      >
        {task.completed && <Check className="size-3 text-primary-foreground" />}
      </button>
      <span
        className={cn(
          "flex-1 text-sm",
          task.completed && "line-through text-muted-foreground",
        )}
      >
        {task.title}
      </span>
      <Badge variant="outline" className="text-xs font-normal shrink-0">
        <Clock className="size-3 mr-1" />
        {formatDuration(task.duration)}
      </Badge>
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

function AddTaskInline({
  onAdd,
}: {
  onAdd: (title: string, duration: number) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("15");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), parseInt(duration) || 15);
    setTitle("");
    setDuration("15");
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex items-center gap-2 py-2 px-3 text-sm text-muted-foreground hover:text-foreground transition-colors w-full rounded-lg hover:bg-muted/50"
      >
        <Plus className="size-4" />
        Add task
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1 px-3">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task name..."
        className="flex-1 h-8 text-sm"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") setIsAdding(false);
        }}
      />
      <Input
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        type="number"
        min={1}
        placeholder="min"
        className="w-16 h-8 text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") setIsAdding(false);
        }}
      />
      <span className="text-xs text-muted-foreground">min</span>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 px-2"
        onClick={handleSubmit}
      >
        <Check className="size-4" />
      </Button>
    </div>
  );
}
