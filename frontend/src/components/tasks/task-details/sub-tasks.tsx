import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useAddSubtask } from "@/hooks/use-sub-task";
import { useUpdateTask } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";
import { SubTask } from "@/types";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { useState } from "react";

interface SubTasksProps {
  subtasks: SubTask[];
  taskId: string;
}

const SubTasks = ({ subtasks, taskId }: SubTasksProps) => {
  const [toggleAddSubtask, setToggleAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [subtaskToDelete, setSubtaskToDelete] = useState<SubTask | null>(null);
  const addSubtaskMutation = useAddSubtask();
  const updateTask = useUpdateTask();
  const { user } = useAuth();

  const handleAddSubtask = () => {
    const newSubtask: SubTask = {
      id: crypto.randomUUID(),
      title: newSubtaskTitle,
      completed: false,
    };
    addSubtaskMutation.mutate({
      taskId,
      subtask: newSubtask,
      userId: user?.uid || "",
    });

    setNewSubtaskTitle("");
    setToggleAddSubtask(false);
  };

  const handleUpdateSubtaskCompletion = (subtask: SubTask) => {
    const updatedSubtasks = subtasks.map((st) =>
      st.id === subtask.id ? { ...st, completed: !st.completed } : st
    );

    updateTask.mutate({
      taskId,
      updates: {
        subtasks: updatedSubtasks,
      },
    });
  };

  const handleDeleteSubtask = () => {
    if (!subtaskToDelete) return;

    const updatedSubtasks = subtasks.filter(
      (st) => st.id !== subtaskToDelete.id
    );

    updateTask.mutate({
      taskId,
      updates: {
        subtasks: updatedSubtasks,
      },
    });
  };

  return (
    <div>
      <p className="font-medium">Subtasks</p>
      {(!subtasks || subtasks.length === 0) && !toggleAddSubtask && (
        <div className="h-5 flex justify-center items-center">
          <p className="text-sm text-muted-foreground text-center">
            No subtasks added yet.
          </p>
        </div>
      )}
      {subtasks && subtasks.length > 0 && (
        <div className="space-y-3 mt-2">
          <div className="space-y-2">
            {subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  subtask.completed && "bg-muted/50"
                )}
              >
                <button
                  type="button"
                  className="shrink-0 cursor-pointer"
                  onClick={() => handleUpdateSubtaskCompletion(subtask)}
                  disabled={updateTask.isPending}
                >
                  {subtask.completed ? (
                    <CheckCircle2 className="size-5 text-primary" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      subtask.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {subtask.title}
                  </p>
                </div>
                <Trash2
                  className="size-5 text-destructive cursor-pointer"
                  onClick={() => setSubtaskToDelete(subtask)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {toggleAddSubtask && (
        <div className="mt-2">
          <Input
            placeholder="New subtask title"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
          />
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button
          variant={"default"}
          size={"sm"}
          className="mt-2 cursor-pointer bg-secondary hover:bg-secondary/20 text-foreground border border-border"
          onClick={() => setToggleAddSubtask(!toggleAddSubtask)}
        >
          {toggleAddSubtask ? "Cancel" : "Add Subtask"}
        </Button>
        {toggleAddSubtask && (
          <Button
            variant={"default"}
            size={"sm"}
            className="mt-2 cursor-pointer bg-secondary hover:bg-secondary/20 text-foreground border border-border"
            onClick={handleAddSubtask}
          >
            Add
          </Button>
        )}
      </div>
      <ConfirmationDialog
        title="Are you sure you want to delete this subtask"
        description="This action cannot be undone."
        isOpen={!!subtaskToDelete}
        onOpenChange={(isOpen) =>
          setSubtaskToDelete(isOpen ? subtaskToDelete : null)
        }
        onCancel={() => setSubtaskToDelete(null)}
        onConfirm={handleDeleteSubtask}
      />
    </div>
  );
};

export default SubTasks;
