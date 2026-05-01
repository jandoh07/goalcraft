import { useAuth } from "@/contexts/auth-context";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  createBrainDumpTask,
  updateBrainDumpTask,
} from "@/lib/firebase/brain-dump";
import { BrainDumpTask } from "@/types/brain-dump";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface BrainDumpFormProps {
  closeDialog: () => void;
  activeTask: BrainDumpTask | null;
  setActiveTask: (task: BrainDumpTask | null) => void;
}

export const BrainDumpForm = ({
  closeDialog,
  activeTask,
  setActiveTask,
}: BrainDumpFormProps) => {
  const [title, setTitle] = useState("");
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [autoFocus, setAutoFocus] = useState(!isMobile);

  useEffect(() => {
    if (activeTask) {
      setTitle(activeTask.title);
    }
  }, [activeTask]);

  useEffect(() => {
    if (!isMobile) return;

    const timer = setTimeout(() => {
      setAutoFocus(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [isMobile]);

  const handleCreateTask = async (title: string) => {
    if (!user?.uid) return;
    try {
      closeDialog();
      if (activeTask) {
        setActiveTask(null);
        await updateBrainDumpTask(user.uid, activeTask.id, { title });
      } else {
        await createBrainDumpTask(user.uid, title);
      }
    } catch (error) {
      console.error("Error creating brain dump task:", error);
      toast.error(
        activeTask
          ? "Failed to update task. Please try again."
          : "Failed to create task. Please try again.",
      );
    }
  };
  return (
    <div className="h-full">
      <input
        type="text"
        placeholder="Enter your thought..."
        className="w-full outline-none"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        enterKeyHint="send"
        autoFocus={autoFocus}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleCreateTask(title);
        }}
      />
    </div>
  );
};
