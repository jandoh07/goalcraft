import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubTask } from "@/types";
import { Plus, X } from "lucide-react";
import React from "react";

const SubTasks = ({
  subtasks,
  newSubtask,
  setNewSubtask,
  addSubtask,
  removeSubtask,
}: {
  subtasks: SubTask[];
  newSubtask: string;
  setNewSubtask: React.Dispatch<React.SetStateAction<string>>;
  addSubtask: () => void;
  removeSubtask: (id: string) => void;
}) => {
  return (
    <div className="grid gap-3 mt-2 md:mt-0">
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
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center justify-between p-2 bg-secondary rounded-md"
            >
              <span className="text-sm">{subtask.title}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => removeSubtask(subtask.id)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubTasks;
