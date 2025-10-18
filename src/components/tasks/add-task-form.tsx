"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComponentProps, useState } from "react";
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

export default function AddTaskForm({ className }: ComponentProps<"form">) {
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask]);
      setNewSubtask("");
    }
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  return (
    <form className={cn("grid items-start gap-6", className)}>
      {/* Task Title */}
      <div className="grid gap-3">
        <Label htmlFor="title">Task Title</Label>
        <Input type="text" id="title" placeholder="Enter task title" />
      </div>

      {/* Description */}
      <div className="grid gap-3">
        <Label htmlFor="description">Description</Label>
        <Input id="description" placeholder="Add task description (optional)" />
      </div>

      {/* Associated Goal */}
      <div className="grid gap-3">
        <Label htmlFor="goal">
          <Target className="size-4 inline mr-2" />
          Associated Goal
        </Label>
        <Select>
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
          <Input type="time" id="time" />
        </div>
      </div>

      {/* Priority */}
      <div className="grid gap-3">
        <Label htmlFor="priority">
          <Flag className="size-4 inline mr-2" />
          Priority
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {priorityOptions.map((priority) => (
            <Button
              key={priority.value}
              variant="outline"
              type="button"
              className={cn(
                "w-full h-10 justify-center text-center font-medium gap-2 border-0",
                priority.bgColor
              )}
            >
              <Flag className={cn("size-4", priority.color)} />
              <span className={priority.color}>{priority.label}</span>
            </Button>
          ))}
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
            onKeyPress={(e) =>
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
            <Select>
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

      <Button type="submit">Add Task</Button>
    </form>
  );
}
