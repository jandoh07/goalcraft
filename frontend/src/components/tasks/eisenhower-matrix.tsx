"use client";

import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Task } from "@/types";
import { SortableTaskCard } from "./sortable-task-card";
import { cn } from "@/lib/utils";

export type MatrixQuadrant =
  | "important-urgent"
  | "important-not-urgent"
  | "not-important-urgent"
  | "not-important-not-urgent";

interface EisenhowerMatrixProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function EisenhowerMatrix({
  tasks,
  onTaskClick,
}: EisenhowerMatrixProps) {
  // Group tasks into quadrants
  const quadrants = useMemo(() => {
    const result: Record<MatrixQuadrant, Task[]> = {
      "important-urgent": [],
      "important-not-urgent": [],
      "not-important-urgent": [],
      "not-important-not-urgent": [],
    };

    tasks.forEach((task) => {
      const isImportant = task.isImportant ?? false;
      const isUrgent = task.isUrgent ?? false;

      if (isImportant && isUrgent) {
        result["important-urgent"].push(task);
      } else if (isImportant && !isUrgent) {
        result["important-not-urgent"].push(task);
      } else if (!isImportant && isUrgent) {
        result["not-important-urgent"].push(task);
      } else {
        result["not-important-not-urgent"].push(task);
      }
    });

    // Sort each quadrant by order
    Object.keys(result).forEach((key) => {
      result[key as MatrixQuadrant].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      );
    });

    return result;
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
      <MatrixQuadrantSection
        id="important-urgent"
        title="Do First"
        subtitle="Important & Urgent"
        tasks={quadrants["important-urgent"]}
        onTaskClick={onTaskClick}
        colorClass="border-red-500/50 bg-red-500/5"
        headerColorClass="text-red-600 dark:text-red-400"
      />
      <MatrixQuadrantSection
        id="important-not-urgent"
        title="Schedule"
        subtitle="Important & Not Urgent"
        tasks={quadrants["important-not-urgent"]}
        onTaskClick={onTaskClick}
        colorClass="border-blue-500/50 bg-blue-500/5"
        headerColorClass="text-blue-600 dark:text-blue-400"
      />
      <MatrixQuadrantSection
        id="not-important-urgent"
        title="Delegate"
        subtitle="Not Important & Urgent"
        tasks={quadrants["not-important-urgent"]}
        onTaskClick={onTaskClick}
        colorClass="border-yellow-500/50 bg-yellow-500/5"
        headerColorClass="text-yellow-600 dark:text-yellow-400"
      />
      <MatrixQuadrantSection
        id="not-important-not-urgent"
        title="Eliminate"
        subtitle="Not Important & Not Urgent"
        tasks={quadrants["not-important-not-urgent"]}
        onTaskClick={onTaskClick}
        colorClass="border-gray-500/50 bg-gray-500/5"
        headerColorClass="text-gray-600 dark:text-gray-400"
      />
    </div>
  );
}

interface MatrixQuadrantSectionProps {
  id: MatrixQuadrant;
  title: string;
  subtitle: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  colorClass: string;
  headerColorClass: string;
}

function MatrixQuadrantSection({
  id,
  title,
  subtitle,
  tasks,
  onTaskClick,
  colorClass,
  headerColorClass,
}: MatrixQuadrantSectionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `quadrant-${id}`,
    data: { type: "quadrant", quadrant: id },
  });

  const taskIds = useMemo(() => tasks.map((t) => `task-${t.id}`), [tasks]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg border-2 p-3 flex flex-col min-h-50 transition-colors",
        colorClass,
        isOver && "ring-2 ring-primary ring-offset-2",
      )}
    >
      <div className="mb-2">
        <h3 className={cn("font-semibold text-sm", headerColorClass)}>
          {title}
        </h3>
        <p className="text-[10px] text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Drag tasks here
            </p>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
