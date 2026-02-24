"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Clock,
  Check,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// --- Types ---

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
  icon: string;
  color: string;
  tasks: NonNegotiableTask[];
}

// --- Dummy Data ---

const INITIAL_NON_NEGOTIABLES: NonNegotiable[] = [
  {
    id: "nn-1",
    title: "Learning",
    totalDuration: 60,
    icon: "📚",
    color: "bg-blue-500/10 border-blue-500/30",
    tasks: [
      {
        id: "t-1",
        title: "Revision of yesterday's notes",
        duration: 15,
        completed: false,
      },
      {
        id: "t-2",
        title: "Learn Lecture 1 - Data Structures",
        duration: 30,
        completed: false,
      },
      {
        id: "t-3",
        title: "Final review of stuff learned",
        duration: 15,
        completed: false,
      },
    ],
  },
  {
    id: "nn-2",
    title: "Exercise",
    totalDuration: 45,
    icon: "💪",
    color: "bg-green-500/10 border-green-500/30",
    tasks: [
      { id: "t-4", title: "Warm-up stretches", duration: 10, completed: false },
      {
        id: "t-5",
        title: "Strength training - upper body",
        duration: 25,
        completed: false,
      },
      {
        id: "t-6",
        title: "Cool down & stretching",
        duration: 10,
        completed: false,
      },
    ],
  },
  {
    id: "nn-3",
    title: "Deep Work",
    totalDuration: 90,
    icon: "🎯",
    color: "bg-purple-500/10 border-purple-500/30",
    tasks: [
      {
        id: "t-7",
        title: "Review project requirements",
        duration: 15,
        completed: false,
      },
      {
        id: "t-8",
        title: "Build API endpoints",
        duration: 45,
        completed: false,
      },
      { id: "t-9", title: "Write unit tests", duration: 30, completed: false },
    ],
  },
  {
    id: "nn-4",
    title: "Reading",
    totalDuration: 30,
    icon: "📖",
    color: "bg-amber-500/10 border-amber-500/30",
    tasks: [
      {
        id: "t-10",
        title: "Read 'Atomic Habits' Chapter 5",
        duration: 20,
        completed: false,
      },
      {
        id: "t-11",
        title: "Write key takeaways",
        duration: 10,
        completed: false,
      },
    ],
  },
];

// --- Helper ---

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// --- Components ---

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

function NonNegotiableCard({
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
    <Card
      className={cn("py-0 gap-0 overflow-hidden border", nonNegotiable.color)}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <span className="text-2xl">{nonNegotiable.icon}</span>
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
          <div className="ml-9 border-l border-border/50 pl-2">
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

function AddNonNegotiableInline({
  onAdd,
}: {
  onAdd: (title: string, duration: number, icon: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("60");
  const [icon, setIcon] = useState("⭐");

  const ICON_OPTIONS = [
    "⭐",
    "📚",
    "💪",
    "🎯",
    "📖",
    "🧘",
    "💻",
    "🎨",
    "🎵",
    "✍️",
  ];

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), parseInt(duration) || 60, icon);
    setTitle("");
    setDuration("60");
    setIcon("⭐");
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsAdding(true)}
        className="w-full border-dashed h-12"
      >
        <Plus className="size-4 mr-2" />
        Add Non-Negotiable
      </Button>
    );
  }

  return (
    <Card className="py-4">
      <CardContent className="space-y-3 px-4">
        <div className="flex gap-2">
          <div className="flex flex-wrap gap-1.5">
            {ICON_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setIcon(emoji)}
                className={cn(
                  "size-8 rounded-md flex items-center justify-center text-lg transition-all",
                  icon === emoji
                    ? "bg-primary/10 ring-2 ring-primary"
                    : "hover:bg-muted",
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Non-negotiable name..."
            className="flex-1 h-9"
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
            className="w-20 h-9"
          />
          <span className="text-xs text-muted-foreground">min</span>
        </div>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Summary Bar ---

function DaySummary({ nonNegotiables }: { nonNegotiables: NonNegotiable[] }) {
  const totalTasks = nonNegotiables.reduce(
    (sum, nn) => sum + nn.tasks.length,
    0,
  );
  const completedTasks = nonNegotiables.reduce(
    (sum, nn) => sum + nn.tasks.filter((t) => t.completed).length,
    0,
  );
  const totalDuration = nonNegotiables.reduce(
    (sum, nn) => sum + nn.tasks.reduce((s, t) => s + t.duration, 0),
    0,
  );
  const completedDuration = nonNegotiables.reduce(
    (sum, nn) =>
      sum +
      nn.tasks.filter((t) => t.completed).reduce((s, t) => s + t.duration, 0),
    0,
  );
  const overallProgress =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="rounded-xl bg-muted/50 border p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-medium">Today&apos;s Progress</p>
          <p className="text-xs text-muted-foreground">
            {completedTasks} of {totalTasks} tasks &middot;{" "}
            {formatDuration(completedDuration)} of{" "}
            {formatDuration(totalDuration)}
          </p>
        </div>
        <span className="text-2xl font-bold text-primary">
          {Math.round(overallProgress)}%
        </span>
      </div>
      <Progress value={overallProgress} className="h-2" />
    </div>
  );
}

// --- Main Export ---

const COLORS = [
  "bg-blue-500/10 border-blue-500/30",
  "bg-green-500/10 border-green-500/30",
  "bg-purple-500/10 border-purple-500/30",
  "bg-amber-500/10 border-amber-500/30",
  "bg-rose-500/10 border-rose-500/30",
  "bg-cyan-500/10 border-cyan-500/30",
  "bg-indigo-500/10 border-indigo-500/30",
  "bg-emerald-500/10 border-emerald-500/30",
];

export function NonNegotiablesList() {
  const [nonNegotiables, setNonNegotiables] = useState<NonNegotiable[]>(
    INITIAL_NON_NEGOTIABLES,
  );

  const handleToggleTask = useCallback((nnId: string, taskId: string) => {
    setNonNegotiables((prev) =>
      prev.map((nn) =>
        nn.id === nnId
          ? {
              ...nn,
              tasks: nn.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t,
              ),
            }
          : nn,
      ),
    );
  }, []);

  const handleDeleteTask = useCallback((nnId: string, taskId: string) => {
    setNonNegotiables((prev) =>
      prev.map((nn) =>
        nn.id === nnId
          ? { ...nn, tasks: nn.tasks.filter((t) => t.id !== taskId) }
          : nn,
      ),
    );
  }, []);

  const handleAddTask = useCallback(
    (nnId: string, title: string, duration: number) => {
      setNonNegotiables((prev) =>
        prev.map((nn) =>
          nn.id === nnId
            ? {
                ...nn,
                tasks: [
                  ...nn.tasks,
                  {
                    id: `t-${Date.now()}`,
                    title,
                    duration,
                    completed: false,
                  },
                ],
              }
            : nn,
        ),
      );
    },
    [],
  );

  const handleAddNonNegotiable = useCallback(
    (title: string, duration: number, icon: string) => {
      const colorIndex = nonNegotiables.length % COLORS.length;
      setNonNegotiables((prev) => [
        ...prev,
        {
          id: `nn-${Date.now()}`,
          title,
          totalDuration: duration,
          icon,
          color: COLORS[colorIndex],
          tasks: [],
        },
      ]);
    },
    [nonNegotiables.length],
  );

  return (
    <div className="space-y-4">
      <DaySummary nonNegotiables={nonNegotiables} />

      <div className="space-y-3">
        {nonNegotiables.map((nn) => (
          <NonNegotiableCard
            key={nn.id}
            nonNegotiable={nn}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
          />
        ))}
      </div>

      <AddNonNegotiableInline onAdd={handleAddNonNegotiable} />
    </div>
  );
}
