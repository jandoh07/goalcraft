"use client";

import MobileHeader from "@/components/layout/mobile/header";
import AddTaskButtonMobile from "@/components/ui/add-button";
import { Loader2 } from "lucide-react";
import { useState, Suspense } from "react";
import TaskForm from "@/components/tasks/task-form/task-form";
import TaskEditDialog from "@/components/tasks/task-form/task-edit-dialog";
import {
  useUpdateTask,
  useTasks,
} from "@/hooks/use-tasks";
import { useTaskDialog } from "@/hooks/use-task-dialog";
import { useAuth } from "@/contexts/auth-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { SortableTaskList } from "@/components/tasks/sortable-task-list";
import DateStrip from "@/components/tasks/date-strip";
import { TaskFilters } from "@/components/tasks/filters/task-filters";
import AddTaskDesktop from "@/components/tasks/add-task-desktop";

const InboxContent = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { user } = useAuth();
  const tasks = useTasks(user?.uid || "", selectedDate);
  const updateTask = useUpdateTask();
  

  const taskDialog = useTaskDialog();
  const isMobile = useIsMobile();

  const isFullyLoaded = !tasks.isLoading; 

  return (
      <div className="max-w-7xl h-full mx-auto p-3 relative flex flex-col">
        <div className="md:flex items-center justify-between mb-3">
          <div>
            <p className="hidden md:block text-lg font-semibold">Inbox</p>
            <MobileHeader title="Inbox" />
          </div>
          <div className="hidden md:flex items-center gap-2">
            <TaskFilters
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
          <DateStrip
            className="md:hidden"
            selectedDate={selectedDate}
            onDateSelect={() => {}}
          />
        </div>

        {!isFullyLoaded ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex-1 mb-13 md:mb-5 overflow-auto">
              <AddTaskDesktop />
              {tasks.data.length === 0 ? (
                <div className="text-center text-muted-foreground mt-10">
                  <p className="mb-2">
                    {selectedDate
                      ? "No tasks for this date."
                      : "No tasks yet. Add your first task!"}
                  </p>
                </div>
              ) : (
                <SortableTaskList
                  tasks={tasks.data}
                  onTaskClick={taskDialog.handleTaskClick}
                  isFetching={tasks.isFetching}
                />
              )}
            </div>

            <AddTaskButtonMobile
              className="md:hidden"
              onClick={taskDialog.handleAddNew}
            />

            {/* Mobile: Drawer-based form for add & edit */}
            <TaskForm
              open={taskDialog.open && isMobile}
              setOpen={taskDialog.handleClose}
              task={taskDialog.activeTask}
              mode={taskDialog.mode as "add" | "view"}
            />

            {/* Desktop: Dialog for editing existing tasks */}
            <TaskEditDialog
              task={taskDialog.activeTask}
              open={taskDialog.open && !isMobile && taskDialog.mode === "view"}
              onClose={() => taskDialog.handleClose(false)}
            />
          </>
        )}
      </div>
  );
};

const Inbox = () => {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <InboxContent />
    </Suspense>
  );
};

export default Inbox;
