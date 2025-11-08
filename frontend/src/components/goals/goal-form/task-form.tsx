import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { AcceptedTasks } from "./tasks";

interface TaskFormProps {
  editingTaskId: string | null;
  setEditingTaskId: (id: string | null) => void;
  setAcceptedTasks: Dispatch<SetStateAction<AcceptedTasks[]>>;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  initialTaskTitle?: string;
  initialIsRecurring?: boolean;
  initialFrequency?: string;
}

const TaskForm = ({
  editingTaskId,
  setEditingTaskId,
  setAcceptedTasks,
  setShowForm,
  initialTaskTitle = "",
  initialIsRecurring = false,
  initialFrequency = "",
}: TaskFormProps) => {
  const [taskTitle, setTaskTitle] = useState(initialTaskTitle);
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [isRecurring, setIsRecurring] = useState(initialIsRecurring);
  const [frequency, setFrequency] = useState(initialFrequency);

  // Update form when editing a different task
  useEffect(() => {
    setTaskTitle(initialTaskTitle);
    setIsRecurring(initialIsRecurring);
    setFrequency(initialFrequency);
  }, [initialTaskTitle, initialIsRecurring, initialFrequency]);

  const handleUpdateTask = () => {
    if (editingTaskId) {
      setAcceptedTasks((prev) =>
        prev.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                title: taskTitle,
                isRecurring,
                frequency,
              }
            : task
        )
      );
      setEditingTaskId(null);
    } else {
      setAcceptedTasks((prevTasks) => [
        ...prevTasks,
        {
          id: Date.now().toString(),
          title: taskTitle,
          isRecurring,
          frequency,
          reason: "Manually added task.",
        },
      ]);
    }
    setShowForm(false);
    setTaskTitle("");
    setDueDate("");
    setDueTime("");
    setIsRecurring(false);
    setFrequency("");
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-secondary/50 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="task-title">Task Title</Label>
        <Input
          id="task-title"
          placeholder="Enter task title"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="due-date">Due Date</Label>
          <Input
            id="due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="due-time">Time</Label>
          <Input
            id="due-time"
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="recurring">Repeat Task</Label>
          <Switch
            id="recurring"
            checked={isRecurring}
            onCheckedChange={setIsRecurring}
          />
        </div>

        {isRecurring && (
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="px-3 py-1.5 text-xs rounded-lg hover:bg-secondary"
          onClick={() => {
            setShowForm(false);
            setEditingTaskId(null);
            setTaskTitle("");
            setDueDate("");
            setDueTime("");
            setIsRecurring(false);
            setFrequency("");
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-3 py-1.5 text-xs bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 font-medium"
          onClick={handleUpdateTask}
        >
          {editingTaskId ? "Update Task" : "Add Task"}
        </button>
      </div>
    </div>
  );
};

export default TaskForm;
