"use client";

import {
  AlertTriangle,
  Star,
  X,
  ListTodo,
  Plus,
  CheckCircle2,
  Circle,
  GitBranch,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { UseAddTaskOptionsReturn } from "@/hooks/use-add-task-options";
import { SubTask } from "@/types";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import DateOption from "./options/date-option";
import TagsOption from "./options/tags-option";
import RecurringOption from "./options/recurring-option";

export interface SubtaskProps {
  subtasks: SubTask[];
  newSubtask: string;
  setNewSubtask: (val: string) => void;
  addSubtask: () => void;
  removeSubtask: (id: string) => void;
  toggleSubtask: (id: string) => void;
}

interface AddTaskOptionsProps {
  taskOptions: UseAddTaskOptionsReturn;
  subtaskProps?: SubtaskProps;
}

const AddTaskOptions = ({ taskOptions, subtaskProps }: AddTaskOptionsProps) => {
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const {
    options,
    isFocused,
    getDateLabel,
    setDueDate,
    setTime,
    addTag,
    removeTag,
    setIsRecurring,
    setFrequency,
    toggleCustomDay,
    setIsImportant,
    setIsUrgent,
  } = taskOptions;

  const hasSubtasks = subtaskProps && subtaskProps.subtasks.length > 0;

  // Reset input visibility when all subtasks are removed
  const subtaskCount = subtaskProps?.subtasks.length ?? 0;
  useEffect(() => {
    if (subtaskCount === 0) {
      setShowSubtaskInput(false);
    }
  }, [subtaskCount]);

  return (
    <div>
      <div className="flex items-center gap-1 md:gap-0 flex-wrap md:flex-nowrap">
        {/* Important Badge */}
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] px-1.5 py-0 h-5 gap-1 md:mr-1 cursor-pointer transition-all select-none",
            options.isImportant
              ? "border-blue-500 bg-blue-100 dark:bg-blue-950/60 text-blue-600"
              : "border-blue-500/50 text-blue-600",
          )}
          onClick={() => setIsImportant(!options.isImportant)}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Star
            className={cn("size-2.5", options.isImportant && "fill-current")}
          />
          Important
          {options.isImportant && (
            <X
              className="size-2.5 hover:text-destructive ml-0.5"
              onClick={(e) => {
                e.stopPropagation();
                setIsImportant(false);
              }}
            />
          )}
        </Badge>

        {/* Urgent Badge */}
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] px-1.5 py-0 h-5 gap-1 md:mr-1 cursor-pointer transition-all select-none",
            options.isUrgent
              ? "border-red-500 bg-red-100 dark:bg-red-950/60 text-red-600"
              : "border-red-500/50 text-red-600",
          )}
          onClick={() => setIsUrgent(!options.isUrgent)}
          onMouseDown={(e) => e.preventDefault()}
        >
          <AlertTriangle
            className={cn("size-2.5", options.isUrgent && "fill-current")}
          />
          Urgent
          {options.isUrgent && (
            <X
              className="size-2.5 hover:text-destructive ml-0.5"
              onClick={(e) => {
                e.stopPropagation();
                setIsUrgent(false);
              }}
            />
          )}
        </Badge>

        {/* Date Picker */}
        <DateOption
          date={options.dueDate}
          time={options.time}
          dateLabel={getDateLabel(options.dueDate)}
          onDateChange={setDueDate}
          onTimeChange={setTime}
          isFocused={isFocused}
        />

        {/* Tags */}
        <TagsOption
          tags={options.tags}
          onAddTag={addTag}
          onRemoveTag={removeTag}
        />

        {/* Recurring */}
        <RecurringOption
          isRecurring={options.isRecurring}
          frequency={options.frequency}
          customDays={options.customDays}
          onRecurringChange={setIsRecurring}
          onFrequencyChange={setFrequency}
          onToggleCustomDay={toggleCustomDay}
        />

        {/* Subtasks */}
        {subtaskProps && (
          <button
            // variant="outline"
            className={cn(
              "text-[10px] px-1.5 py-0 h-5 gap-1 md:ml-1 cursor-pointer transition-all select-none",
              hasSubtasks || showSubtaskInput
                ? "border-purple-500 bg-purple-100 dark:bg-purple-950/60 text-purple-600"
                : "border-purple-500/50 text-purple-600",
            )}
            onClick={() => setShowSubtaskInput(!showSubtaskInput)}
            onMouseDown={(e) => e.preventDefault()}
          >
            <GitBranch className="size-3.5" />
          </button>
        )}
      </div>

      {/* Subtask section */}
      {subtaskProps && (hasSubtasks || showSubtaskInput) && (
        <div className="mt-2 space-y-1.5">
          {subtaskProps.subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2 group">
              <button
                type="button"
                className="shrink-0 cursor-pointer"
                onClick={() => subtaskProps.toggleSubtask(subtask.id)}
                onMouseDown={(e) => e.preventDefault()}
              >
                {subtask.completed ? (
                  <CheckCircle2 className="size-4 text-primary" />
                ) : (
                  <Circle className="size-4 text-muted-foreground" />
                )}
              </button>
              <span
                className={cn(
                  "text-xs flex-1",
                  subtask.completed && "line-through text-muted-foreground",
                )}
              >
                {subtask.title}
              </span>
              <button
                type="button"
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => subtaskProps.removeSubtask(subtask.id)}
                onMouseDown={(e) => e.preventDefault()}
              >
                <X className="size-3 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}

          {showSubtaskInput && (
            <div className="flex gap-1.5 items-center">
              <Input
                value={subtaskProps.newSubtask}
                onChange={(e) => subtaskProps.setNewSubtask(e.target.value)}
                placeholder="Add a subtask"
                className="h-7 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    subtaskProps.addSubtask();
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 shrink-0"
                onClick={subtaskProps.addSubtask}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddTaskOptions;
