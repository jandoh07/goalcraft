"use client";

import { useEffect, useState } from "react";
import MobileHeader from "@/components/layout/mobile/header";
import { useIsMobile } from "@/hooks/use-mobile";
import AddButton from "@/components/ui/add-button";
import { BrainDumpTaskCard } from "@/components/brain-dump/brain-dump-task-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { BrainDumpForm } from "@/components/brain-dump/brain-dump-form";
import { BrainDumpTask } from "@/types/brain-dump";
import { getBrainDumpTasks } from "@/lib/firebase/brain-dump";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

const BrainDump = () => {
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<BrainDumpTask | null>(null);
  const [tasks, setTasks] = useState<BrainDumpTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = getBrainDumpTasks(
      user?.uid,
      (tasks) => {
        setTasks(tasks);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching brain dump tasks:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const openTaskForm = (task: BrainDumpTask | null = null) => {
    setActiveTask(task);

    const focusedElement = document.activeElement;
    if (focusedElement instanceof HTMLElement) {
      focusedElement.blur();
    }

    setIsDrawerOpen(true);
  };

  const closeTaskForm = () => {
    const focusedElement = document.activeElement;
    if (focusedElement instanceof HTMLElement) {
      focusedElement.blur();
    }

    setIsDrawerOpen(false);
  };

  if (isMobile === undefined) {
    return null;
  }

  return (
    <div className="max-w-7xl h-full mx-auto p-2 md:p-3">
      <div className="mb-3">
        <p className="hidden md:block text-lg font-semibold mb-5">Brain Dump</p>
        <MobileHeader title="Brain Dump" />
      </div>

      <div className="flex flex-col">
        <div className="space-y-2">
          {!loading && tasks && tasks.length > 0 ? (
            tasks?.map((task) => (
              <BrainDumpTaskCard
                key={task.id}
                task={task}
                onClick={(task) => openTaskForm(task)}
              />
            ))
          ) : loading ? (
            <div className="flex-1 flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">
                No thoughts yet. Start dumping!
              </p>
            </div>
          )}
        </div>
      </div>

      <AddButton onClick={() => openTaskForm()} />

      {!isMobile ? (
        <Dialog
          open={isDrawerOpen}
          onOpenChange={(open) => {
            if (open) {
              setIsDrawerOpen(true);
              return;
            }

            closeTaskForm();
          }}
        >
          <DialogContent>
            <DialogHeader className="sr-only">
              <DialogTitle>Add a task</DialogTitle>
              <DialogDescription>Add a task to brain dump</DialogDescription>
            </DialogHeader>
            <BrainDumpForm
              key={activeTask?.id ?? "new"}
              closeDialog={closeTaskForm}
              activeTask={activeTask}
              setActiveTask={setActiveTask}
            />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer
          open={isDrawerOpen}
          onOpenChange={(open) => {
            if (open) {
              setIsDrawerOpen(true);
              return;
            }

            closeTaskForm();
          }}
        >
          <DrawerContent hideBar className="min-h-20 max-h-30 px-2">
            <div className="bg-muted/80 mx-auto mt-2 mb-1.5 h-1.5 w-10 rounded-full" />
            <DrawerHeader className="sr-only">
              <DrawerTitle>Add a task</DrawerTitle>
              <DrawerDescription>Add a task to brain dump</DrawerDescription>
            </DrawerHeader>
            <BrainDumpForm
              key={activeTask?.id ?? "new"}
              closeDialog={closeTaskForm}
              activeTask={activeTask}
              setActiveTask={setActiveTask}
            />
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

export default BrainDump;
