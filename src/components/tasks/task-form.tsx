"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComponentProps, useState, useEffect } from "react";
import { DatePicker } from "../ui/date-picker";
import { Flag, Clock, Target, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const priorityOptions: {
  label: string;
  value: string;
  color: string;
  bgColor: string;
}[] = [
  {
    label: "High",
    value: "high",
    color: "text-red-600",
    bgColor: "bg-red-100 hover:bg-red-200",
  },
  {
    label: "Medium",
    value: "medium",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 hover:bg-yellow-200",
  },
  {
    label: "Low",
    value: "low",
    color: "text-green-600",
    bgColor: "bg-green-100 hover:bg-green-200",
  },
];

export interface TaskFormData {
  title?: string;
  description?: string;
  associatedGoal?: string;
  dueDate?: Date;
  time?: string;
  priority?: "high" | "medium" | "low";
  subtasks?: string[];
  isRecurring?: boolean;
  frequency?: string;
}

interface AddTaskFormProps extends ComponentProps<"form"> {
  initialData?: TaskFormData;
  mode?: "add" | "edit";
}

export default function TaskForm({
  className,
  initialData,
  mode = "add",
}: AddTaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [associatedGoal, setAssociatedGoal] = useState(
    initialData?.associatedGoal || ""
  );
  const [time, setTime] = useState(initialData?.time || "");
  const [priority, setPriority] = useState<string>(initialData?.priority || "");
  const [subtasks, setSubtasks] = useState<string[]>(
    initialData?.subtasks || []
  );
  const [newSubtask, setNewSubtask] = useState("");
  const [isRecurring, setIsRecurring] = useState(
    initialData?.isRecurring || false
  );
  const [frequency, setFrequency] = useState(initialData?.frequency || "");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setAssociatedGoal(initialData.associatedGoal || "");
      setTime(initialData.time || "");
      setPriority(initialData.priority || "");
      setSubtasks(initialData.subtasks || []);
      setIsRecurring(initialData.isRecurring || false);
      setFrequency(initialData.frequency || "");
    }
  }, [initialData]);

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask]);
      setNewSubtask("");
    }
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log({
      title,
      description,
      associatedGoal,
      time,
      priority,
      subtasks,
      isRecurring,
      frequency,
    });
  };

  return (
    <form
      className={cn("grid items-start gap-6", className)}
      onSubmit={handleSubmit}
    >
      {/* Task Title */}
      <div className="grid gap-3">
        <Label htmlFor="title">Task Title</Label>
        <Input
          type="text"
          id="title"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="grid gap-3">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Add task description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Associated Goal */}
      <div className="grid gap-3">
        <Label htmlFor="goal">
          <Target className="size-4 inline mr-2" />
          Associated Goal
        </Label>
        <Select value={associatedGoal} onValueChange={setAssociatedGoal}>
          <SelectTrigger>
            <SelectValue placeholder="Select a goal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fitness">Get Fit & Healthy</SelectItem>
            <SelectItem value="career">Advance My Career</SelectItem>
            <SelectItem value="finance">Save $10,000</SelectItem>
            <SelectItem value="education">Learn Web Development</SelectItem>
            <SelectItem value="none">No Goal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Due Date and Time */}
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-3">
          <Label htmlFor="due-date">Due Date</Label>
          <DatePicker />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="time">
            <Clock className="size-4 inline mr-2" />
            Time
          </Label>
          <Input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      {/* Subtasks */}
      <div className="grid gap-3">
        <Label>Subtasks</Label>
        <div className="flex gap-2">
          <Input
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="Add a subtask"
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addSubtask())
            }
          />
          <Button type="button" size="icon" onClick={addSubtask}>
            <Plus className="size-4" />
          </Button>
        </div>
        {subtasks.length > 0 && (
          <div className="space-y-2 mt-2">
            {subtasks.map((subtask, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-secondary rounded-md"
              >
                <span className="text-sm">{subtask}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => removeSubtask(index)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recurring Task */}
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="recurring">Repeat Task</Label>
          <Switch
            id="recurring"
            checked={isRecurring}
            onCheckedChange={setIsRecurring}
          />
        </div>
        {isRecurring && (
          <div className="grid gap-3 pl-4 border-l-2 border-primary">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Priority */}
      <div className="grid gap-3">
        <Label htmlFor="priority">
          <Flag className="size-4 inline mr-2" />
          Priority
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {priorityOptions.map((priorityOption) => (
            <Button
              key={priorityOption.value}
              variant="outline"
              type="button"
              onClick={() => setPriority(priorityOption.value)}
              className={cn(
                "w-full h-10 justify-center text-center font-medium gap-2 border-0",
                priorityOption.bgColor,
                priority === priorityOption.value &&
                  "ring-2 ring-offset-2 ring-primary"
              )}
            >
              <Flag className={cn("size-4", priorityOption.color)} />
              <span className={priorityOption.color}>
                {priorityOption.label}
              </span>
            </Button>
          ))}
        </div>
      </div>

      <Button type="submit" className="hidden md:block">
        {mode === "edit" ? "Update Task" : "Add Task"}
      </Button>
    </form>
  );
}
