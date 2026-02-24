"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  Star,
  Zap,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---

interface ReviewItem {
  id: string;
  label: string;
  completed: boolean;
}

type ReviewStatus = "not-started" | "in-progress" | "completed";

// --- Dummy data ---

const REVIEW_CHECKLIST: ReviewItem[] = [
  { id: "r-1", label: "Review completed tasks from today", completed: false },
  { id: "r-2", label: "Archive or reschedule overdue tasks", completed: false },
  { id: "r-3", label: "Set non-negotiables for tomorrow", completed: false },
  { id: "r-4", label: "Reflect: What went well today?", completed: false },
  { id: "r-5", label: "Reflect: What can be improved?", completed: false },
];

const DAILY_STATS = {
  tasksCompleted: 8,
  totalTasks: 12,
  focusMinutes: 145,
  nonNegotiablesHit: 3,
  totalNonNegotiables: 4,
  streak: 5,
};

// --- Components ---

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30">
      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="size-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {subtext && (
          <p className="text-xs text-muted-foreground/70">{subtext}</p>
        )}
      </div>
    </div>
  );
}

export function DailyReviewSection() {
  const [items, setItems] = useState<ReviewItem[]>(REVIEW_CHECKLIST);
  const [status, setStatus] = useState<ReviewStatus>("not-started");

  const completedCount = items.filter((i) => i.completed).length;
  const progress = (completedCount / items.length) * 100;
  const allDone = completedCount === items.length;

  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  const handleStart = () => {
    setStatus("in-progress");
  };

  const handleComplete = () => {
    setStatus("completed");
  };

  const handleReset = () => {
    setItems(REVIEW_CHECKLIST.map((i) => ({ ...i, completed: false })));
    setStatus("not-started");
  };

  return (
    <div className="space-y-4">
      {/* Today's Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Tasks Completed"
          value={`${DAILY_STATS.tasksCompleted}/${DAILY_STATS.totalTasks}`}
          icon={CheckCircle2}
        />
        <StatCard
          label="Focus Time"
          value={`${Math.floor(DAILY_STATS.focusMinutes / 60)}h ${DAILY_STATS.focusMinutes % 60}m`}
          icon={Zap}
        />
        <StatCard
          label="Non-Negotiables"
          value={`${DAILY_STATS.nonNegotiablesHit}/${DAILY_STATS.totalNonNegotiables}`}
          icon={Star}
        />
        <StatCard
          label="Current Streak"
          value={`${DAILY_STATS.streak} days`}
          icon={Sparkles}
        />
      </div>

      {/* Daily Review Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Daily Review</CardTitle>
              <CardDescription>
                {status === "not-started"
                  ? "Take 5 minutes to review your day and plan tomorrow."
                  : status === "completed"
                    ? "Great job! You've completed your daily review."
                    : `${completedCount} of ${items.length} steps completed`}
              </CardDescription>
            </div>
            <Badge
              variant={
                status === "completed"
                  ? "default"
                  : status === "in-progress"
                    ? "secondary"
                    : "outline"
              }
            >
              {status === "completed"
                ? "Done"
                : status === "in-progress"
                  ? "In Progress"
                  : "Not Started"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "not-started" ? (
            <Button onClick={handleStart} className="w-full" size="lg">
              Start Daily Review
              <ChevronRight className="size-4 ml-1" />
            </Button>
          ) : status === "completed" ? (
            <div className="text-center py-4 space-y-3">
              <div className="text-4xl">🎉</div>
              <p className="text-sm text-muted-foreground">
                Review completed! See you tomorrow.
              </p>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset Review
              </Button>
            </div>
          ) : (
            <>
              <Progress value={progress} className="h-2" />
              <div className="space-y-1">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className={cn(
                      "flex items-center gap-3 w-full text-left py-2.5 px-3 rounded-lg transition-colors hover:bg-muted/50",
                      item.completed && "opacity-60",
                    )}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="size-5 text-primary shrink-0" />
                    ) : (
                      <Circle className="size-5 text-muted-foreground/40 shrink-0" />
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        item.completed && "line-through text-muted-foreground",
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
              {allDone && (
                <Button onClick={handleComplete} className="w-full">
                  Complete Review
                  <Sparkles className="size-4 ml-1" />
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
