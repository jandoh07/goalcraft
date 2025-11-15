import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { flashLiteModel } from "@/lib/firebase/firebase";
import { aiPrompts } from "@/constants/ai";
import { Milestone } from "@/types";
import TaskForm from "./task-form";
import TaskCard from "./task-card";

interface TasksProps {
  goalTitle: string;
  relevance?: string;
  milestones?: Milestone[];
  onTasksChange?: (tasks: AcceptedTasks[]) => void;
}

export type AcceptedTasks = {
  id: string;
  title: string;
  dueDate?: Date;
  time?: string;
  isRecurring: boolean;
  frequency: string;
  reason: string;
  isAIGenerated?: boolean;
};

const Tasks = ({
  goalTitle,
  relevance,
  milestones,
  onTasksChange,
}: TasksProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<
    {
      id: string;
      title: string;
      dueDate?: Date;
      time?: string;
      isRecurring: boolean;
      frequency: string;
      reason: string;
      isAIGenerated?: boolean;
    }[]
  >([]);
  const [acceptedTasks, setAcceptedTasks] = useState<AcceptedTasks[]>([]);

  // Notify parent component whenever accepted tasks change
  useEffect(() => {
    if (onTasksChange) {
      onTasksChange(acceptedTasks);
    }
  }, [acceptedTasks, onTasksChange]);

  const generateTasksWithAI = async () => {
    if (!goalTitle) return;

    setLoading(true);
    try {
      const milestoneTitles = milestones?.map((m) => m.title);
      const prompt = aiPrompts.taskSuggestionBasic(
        goalTitle,
        relevance,
        milestoneTitles as [string] | undefined
      );

      const result = await flashLiteModel.generateContent(prompt);
      const responseText = result.response.text();

      // Parse the JSON response
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : responseText;
      const parsed = JSON.parse(jsonText);

      if (parsed.tasks && Array.isArray(parsed.tasks)) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day

        const newTasks = parsed.tasks.map(
          (task: {
            title: string;
            isRecurring: boolean;
            frequency: string | null;
            reason: string;
          }) => ({
            id: Date.now().toString() + Math.random(),
            title: task.title,
            dueDate: today,
            isRecurring: task.isRecurring,
            frequency: task.frequency || "",
            reason: task.reason,
            isAIGenerated: true,
          })
        );
        setTasks(newTasks);
      }
    } catch (error) {
      console.error("Error generating tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setAcceptedTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleAcceptTask = (taskId: string) => {
    const taskToAccept = tasks.find((t) => t.id === taskId);
    if (taskToAccept) {
      // Remove isAIGenerated flag and add to accepted tasks
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isAIGenerated, ...acceptedTask } = taskToAccept;
      setAcceptedTasks((prev) => [...prev, acceptedTask]);
      // Remove from tasks list
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  const handleDeclineTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleAcceptAll = () => {
    const aiTasks = tasks.filter((t) => t.isAIGenerated);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const acceptedAiTasks = aiTasks.map(({ isAIGenerated, ...task }) => task);
    setAcceptedTasks((prev) => [...prev, ...acceptedAiTasks]);
    setTasks((prev) => prev.filter((t) => !t.isAIGenerated));
  };

  const handleDeclineAll = () => {
    setTasks((prev) => prev.filter((t) => !t.isAIGenerated));
  };

  const hasAIGeneratedTasks = tasks.some((t) => t.isAIGenerated);

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <Label>Add Tasks Associated with This Goal</Label>
        <button
          type="button"
          className="px-3 py-1 bg-accent text-accent-foreground rounded-2xl cursor-pointer hover:bg-accent/80 text-xs font-medium"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="size-4" />
        </button>
      </div>

      {showAddForm && (
        <TaskForm
          editingTaskId={null}
          setEditingTaskId={() => {}}
          setShowForm={setShowAddForm}
          setAcceptedTasks={setAcceptedTasks}
        />
      )}

      {/* AI-Generated Tasks (Pending Review) */}
      {tasks.length > 0 && (
        <div className="mt-4 space-y-3">
          {hasAIGeneratedTasks && (
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">
                AI-generated tasks (review and accept/decline)
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg font-medium"
                  onClick={handleDeclineAll}
                >
                  Decline All
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-lg font-medium"
                  onClick={handleAcceptAll}
                >
                  Accept All
                </button>
              </div>
            </div>
          )}
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              handleAcceptTask={handleAcceptTask}
              handleDeclineTask={handleDeclineTask}
            />
          ))}
        </div>
      )}

      {/* Accepted Tasks */}
      {acceptedTasks.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">Accepted tasks</p>
          {acceptedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              setAcceptedTasks={setAcceptedTasks}
              handleDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
      )}
      <div className="flex items-center justify-end mt-3">
        <button
          type="button"
          className="px-2 py-1 text-xs text-accent underline rounded-2xl cursor-pointer bg-accent/10 hover:bg-accent/20 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={generateTasksWithAI}
          disabled={loading || !goalTitle}
        >
          {loading ? "Generating..." : "Generate tasks with AI"}
        </button>
      </div>
    </div>
  );
};

export default Tasks;
