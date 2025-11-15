import { Check, Pencil, Trash2, X } from "lucide-react";
import { AcceptedTasks } from "./tasks";
import { useState, Dispatch, SetStateAction } from "react";
import TaskForm from "./task-form";

type TaskCardProps =
  | {
      task: AcceptedTasks;
      setAcceptedTasks: Dispatch<SetStateAction<AcceptedTasks[]>>;
      handleDeleteTask: (taskId: string) => void;
      handleDeclineTask?: never;
      handleAcceptTask?: never;
    }
  | {
      task: AcceptedTasks;
      setAcceptedTasks?: never;
      handleDeleteTask?: never;
      handleDeclineTask: (taskId: string) => void;
      handleAcceptTask: (taskId: string) => void;
    };

const TaskCard = ({
  task,
  setAcceptedTasks,
  handleDeleteTask,
  handleDeclineTask,
  handleAcceptTask,
}: TaskCardProps) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing && setAcceptedTasks) {
    return (
      <TaskForm
        editingTaskId={task.id}
        setEditingTaskId={(id) => {
          if (id === null) setIsEditing(false);
        }}
        setAcceptedTasks={setAcceptedTasks}
        setShowForm={setIsEditing}
        initialTaskTitle={task.title}
        initialDueDate={task.dueDate}
        initialTime={task.time}
        initialIsRecurring={task.isRecurring}
        initialFrequency={task.frequency}
      />
    );
  }

  return (
    <div>
      <div className="p-2 border rounded-lg bg-secondary">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold">{task.title}</p>
            <div className="space-x-2 mt-1">
              <p className="text-xs text-secondary-foreground border border-border rounded-lg px-2 inline-block">
                {task.isRecurring
                  ? task.frequency &&
                    task.frequency?.charAt(0).toUpperCase() +
                      task.frequency?.slice(1)
                  : "One-time"}
              </p>
              {task.dueDate && (
                <p className="text-xs text-secondary-foreground border border-border rounded-lg px-2 inline-block">
                  Due: {task.dueDate.toLocaleDateString()}
                  {task.time && ` at ${task.time}`}
                </p>
              )}
            </div>
          </div>
          {handleDeleteTask && (
            <div className="flex items-center gap-1 ml-2">
              <button
                type="button"
                className="px-1 py-1 hover:bg-blue-500/20 rounded-lg"
                onClick={() => setIsEditing(true)}
                title="Edit task"
              >
                <Pencil className="text-blue-500 size-4" />
              </button>
              <button
                type="button"
                className="px-1 py-1 hover:bg-destructive/20 rounded-lg"
                onClick={() => handleDeleteTask(task.id)}
                title="Delete task"
              >
                <Trash2 className="text-destructive size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs pl-2 pt-1">{task.reason}</p>
        {handleDeclineTask && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="px-1 py-1 hover:bg-destructive/20 rounded-2xl"
              onClick={() => handleDeclineTask(task.id)}
            >
              <X className="text-destructive size-4" />
            </button>
            <button
              type="button"
              className="px-1 py-1 hover:bg-green-300 rounded-2xl"
              onClick={() => handleAcceptTask(task.id)}
            >
              <Check className="text-green-500 size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
