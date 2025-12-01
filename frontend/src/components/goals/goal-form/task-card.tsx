import {
  Check,
  Pencil,
  Trash2,
  X,
  Calendar,
  Clock,
  Repeat,
} from "lucide-react";
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

  const isNonNegotiable = task.isRecurring && task.frequency;

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-200 hover:shadow-md ${
        isNonNegotiable
          ? "bg-linear-to-r from-primary/5 to-primary/10 border-primary/20"
          : "bg-card border-border hover:border-primary/30"
      }`}
    >
      <div className="p-3">
        {/* Header with title and actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isNonNegotiable && (
                <div className="shrink-0 size-2 rounded-full bg-primary animate-pulse" />
              )}
              <h4 className="text-sm font-semibold truncate">{task.title}</h4>
            </div>
          </div>

          {/* Action buttons */}
          {handleDeleteTask && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                onClick={() => setIsEditing(true)}
                title="Edit task"
              >
                <Pencil className="text-primary size-3.5" />
              </button>
              <button
                type="button"
                className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                onClick={() => handleDeleteTask(task.id)}
                title="Delete task"
              >
                <Trash2 className="text-destructive size-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Meta info badges */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {/* Frequency badge */}
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              isNonNegotiable
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Repeat className="size-3" />
            {task.isRecurring
              ? task.frequency?.charAt(0).toUpperCase() +
                task.frequency?.slice(1)
              : "One-time"}
          </div>

          {/* Due date badge */}
          {task.dueDate && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
              <Calendar className="size-3" />
              {task.dueDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
          )}

          {/* Time badge */}
          {task.time && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
              <Clock className="size-3" />
              {task.time}
            </div>
          )}
        </div>

        {/* Reason text */}
        {task.reason && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
            {task.reason}
          </p>
        )}
      </div>

      {/* Accept/Decline buttons for AI-generated tasks */}
      {handleDeclineTask && (
        <div className="flex items-center justify-end gap-1 px-3 pb-3">
          <button
            type="button"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            onClick={() => handleDeclineTask(task.id)}
          >
            <X className="size-3.5" />
            Decline
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors"
            onClick={() => handleAcceptTask(task.id)}
          >
            <Check className="size-3.5" />
            Accept
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
