"use client";

import { useMemo, useCallback, useState } from "react";
import { format, setHours, setMinutes, addHours } from "date-fns";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { ScheduleHeader } from "../../../components/schedule/schedule-header";
import { TimeGrid } from "../../../components/schedule/time-grid";
import { ScheduleModal } from "../../../components/schedule/schedule-modal";
import { AIScheduleSheet } from "../../../components/schedule/ai-schedule-sheet";
import { ViewRangeFilter } from "../../../components/schedule/view-range-filter";
import {
  UnscheduledTasksPanel,
  MobileTasksDrawer,
  ScheduleTaskDragOverlay,
} from "../../../components/schedule/unscheduled-tasks-panel";
import { TimeBlockOverlay } from "../../../components/schedule/time-block-overlay";
import { useScheduleModal } from "../../../hooks/use-schedule-modal";
import { useSyncedScroll } from "../../../hooks/use-synced-scroll";
import { useAISchedule } from "../../../hooks/use-ai-schedule";
import { useViewRange } from "../../../hooks/use-view-range";
import {
  useGetTimeBlocks,
  useAddTimeBlock,
  useUpdateTimeBlock,
  useMoveTimeBlock,
  useDeleteTimeBlock,
} from "../../../hooks/use-schedule";
import { useGetTasks } from "../../../hooks/use-tasks";
import { useAuth } from "../../../contexts/auth-context";
import { TimeBlock, HOUR_HEIGHT } from "../../../types/schedule";
import { Task } from "../../../types";
import { Loader2, ListTodo } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

// Color palette for time blocks created from tasks
const BLOCK_COLORS = [
  "bg-blue-500/20 border-blue-500",
  "bg-green-500/20 border-green-500",
  "bg-purple-500/20 border-purple-500",
  "bg-orange-500/20 border-orange-500",
  "bg-pink-500/20 border-pink-500",
  "bg-cyan-500/20 border-cyan-500",
];

function getBlockColor(taskId: string): string {
  const hash = taskId.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
  return BLOCK_COLORS[Math.abs(hash) % BLOCK_COLORS.length];
}

export default function SchedulePage() {
  const { user } = useAuth();
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
  const [activeBlock, setActiveBlock] = useState<TimeBlock | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // DnD sensors
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 5,
    },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const {
    viewRangeType,
    setViewRangeType,
    viewRangeDates,
    navigate,
    goToToday,
    isTodayInView,
    isHydrated,
  } = useViewRange();

  const { state, openCreateModal, openEditModal, closeModal } =
    useScheduleModal();

  const {
    headerScrollRef,
    gridScrollRef,
    handleHeaderScroll,
    handleGridScroll,
  } = useSyncedScroll(viewRangeDates?.days);

  const filters = useMemo(
    () =>
      viewRangeDates
        ? {
            startDate: viewRangeDates.startDate,
            endDate: viewRangeDates.endDate,
          }
        : null,
    [viewRangeDates],
  );

  const {
    data: blocks = [],
    isLoading,
    isFetching,
  } = useGetTimeBlocks(
    user?.uid ?? "",
    filters ?? { startDate: new Date(), endDate: new Date() },
  );
  const addTimeBlock = useAddTimeBlock();
  const updateTimeBlock = useUpdateTimeBlock();
  const moveTimeBlock = useMoveTimeBlock();
  const deleteTimeBlock = useDeleteTimeBlock();

  // Get all tasks to find unscheduled ones
  const { data: allTasks = [] } = useGetTasks(user?.uid ?? "");

  // Eisenhower priority sorting helper
  const getEisenhowerPriority = (task: Task): number => {
    const isImportant = task.isImportant ?? false;
    const isUrgent = task.isUrgent ?? false;
    if (isImportant && isUrgent) return 0; // Highest priority
    if (isImportant && !isUrgent) return 1;
    if (!isImportant && isUrgent) return 2;
    return 3; // Neither - lowest priority
  };

  // Filter to get unscheduled tasks (tasks without a timeblock linked via taskId)
  // Sorted by Eisenhower priority: urgent+important first, then important, then urgent, then neither
  const unscheduledTasks = useMemo(() => {
    if (!allTasks.length) return [];

    // Get all task IDs that have been scheduled (linked to time blocks)
    const scheduledTaskIds = new Set(
      blocks.filter((b) => b.taskId).map((b) => b.taskId),
    );

    // Return tasks that are not completed and not scheduled, sorted by Eisenhower priority
    return allTasks
      .filter(
        (task) =>
          task.status !== "completed" &&
          task.id &&
          !scheduledTaskIds.has(task.id),
      )
      .sort((a, b) => getEisenhowerPriority(a) - getEisenhowerPriority(b));
  }, [allTasks, blocks]);

  // Handle block move within the schedule grid
  const handleBlockMove = useCallback(
    (blockId: string, newDate: Date, newHour: number) => {
      const block = blocks.find((b) => b.id === blockId);
      if (!block) return;

      const duration = block.end.getTime() - block.start.getTime();
      const hour = Math.floor(newHour);
      const minutes = (newHour % 1) * 60;

      const newStart = setMinutes(setHours(newDate, hour), minutes);
      const newEnd = new Date(newStart.getTime() + duration);

      moveTimeBlock.mutate({ timeBlockId: blockId, newStart, newEnd });
    },
    [blocks, moveTimeBlock],
  );

  // DnD handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.block) {
      setActiveBlock(data.block as TimeBlock);
      setActiveTask(null);
    } else if (data?.type === "unscheduled-task" && data?.task) {
      setActiveTask(data.task as Task);
      setActiveBlock(null);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over, delta } = event;

      setActiveBlock(null);
      setActiveTask(null);

      if (!over) return;

      const data = active.data.current;
      const overId = String(over.id);

      // Only process drops on day/hour columns (e.g., "day-0-hour-9")
      // Must contain both "day-" and "-hour-" to be a valid hour slot
      if (!overId.includes("-hour-")) return;

      const targetDate = over.data.current?.date as Date;
      const targetHour = over.data.current?.hour as number | undefined;

      // Require both date and hour to be defined for valid drop
      if (!targetDate || targetHour === undefined) return;

      // Handle task drop from unscheduled tasks panel
      if (data?.type === "unscheduled-task" && data?.task) {
        const task = data.task as Task;
        if (!user?.uid || !task.id) return;

        const startTime = setMinutes(setHours(targetDate, targetHour), 0);
        const endTime = addHours(startTime, 1);

        const newBlock: Omit<TimeBlock, "id" | "createdAt" | "updatedAt"> = {
          userId: user.uid,
          title: task.title,
          start: startTime,
          end: endTime,
          color: getBlockColor(task.id),
          taskId: task.id,
          description: task.description,
        };

        addTimeBlock.mutate(newBlock);
        return;
      }

      // Handle block move
      if (data?.block) {
        const block = data.block as TimeBlock;

        // Calculate new hour based on drag delta
        const currentStartHour =
          block.start.getHours() + block.start.getMinutes() / 60;
        const hourDelta = Math.round((delta.y / HOUR_HEIGHT) * 2) / 2; // Snap to 30-min
        const newHour = Math.max(
          0,
          Math.min(23.5, currentStartHour + hourDelta),
        );

        handleBlockMove(block.id, targetDate, newHour);
      }
    },
    [user?.uid, addTimeBlock, handleBlockMove],
  );

  // AI Schedule integration with callbacks for create/update/delete operations
  const {
    generateSchedule,
    isLoading: isAILoading,
    error: aiError,
    clearError: clearAIError,
  } = useAISchedule({
    userId: user?.uid ?? "",
    existingBlocks: blocks,
    callbacks: {
      onCreate: (block) => addTimeBlock.mutate(block),
      onUpdate: (blockId, updates) =>
        updateTimeBlock.mutate({ timeBlockId: blockId, updates }),
      onDelete: (blockId) => deleteTimeBlock.mutate(blockId),
    },
  });

  const handleAISendMessage = useCallback(
    async (message: string) => {
      const result = await generateSchedule(message);
      if (result) {
        return {
          message: result.message,
          stats: result.stats,
        };
      }
      return null;
    },
    [generateSchedule],
  );

  const handleSaveBlock = (
    data: TimeBlock | Omit<TimeBlock, "id" | "createdAt" | "updatedAt">,
  ) => {
    if (!user) return;

    if (state.mode === "create") {
      addTimeBlock.mutate({
        ...data,
        userId: user.uid,
      } as Omit<TimeBlock, "id" | "createdAt" | "updatedAt">);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, userId, createdAt, ...updates } = data as TimeBlock;
      updateTimeBlock.mutate({ timeBlockId: id, updates });
    }
    closeModal();
  };

  const handleBlockDelete = (blockId: string) => {
    deleteTimeBlock.mutate(blockId);
    closeModal();
  };

  // Generate date label for the header
  const dateLabel = useMemo(() => {
    if (!viewRangeDates) return "";
    const { startDate, endDate } = viewRangeDates;

    // If same month, show "Month Year"
    // If different months, show "Month - Month Year" or "Month Year - Month Year"
    const startMonth = format(startDate, "MMMM");
    const endMonth = format(endDate, "MMMM");
    const startYear = format(startDate, "yyyy");
    const endYear = format(endDate, "yyyy");

    if (startYear !== endYear) {
      return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
    } else if (startMonth !== endMonth) {
      return `${startMonth} - ${endMonth} ${startYear}`;
    } else {
      return `${startMonth} ${startYear}`;
    }
  }, [viewRangeDates]);

  // Show loading while hydrating or fetching data
  if (!isHydrated || !viewRangeDates || isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-4rem)] md:h-[calc(100dvh-56px-48px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-[calc(100dvh-4rem)] md:h-[calc(100dvh-56px-48px)] md:-m-6 overflow-hidden">
        {/* Desktop sidebar panel */}
        <UnscheduledTasksPanel
          tasks={unscheduledTasks}
          isOpen={isTaskPanelOpen}
          onToggle={() => setIsTaskPanelOpen(!isTaskPanelOpen)}
          isDragging={activeTask !== null}
        />

        {/* Mobile top drawer */}
        <MobileTasksDrawer
          tasks={unscheduledTasks}
          isOpen={isTaskPanelOpen}
          onToggle={() => setIsTaskPanelOpen(!isTaskPanelOpen)}
          isDragging={activeTask !== null}
        />

        <ScheduleHeader
          days={viewRangeDates.days}
          dateLabel={dateLabel}
          onNavigate={navigate}
          onToday={goToToday}
          isTodayInView={isTodayInView}
          scrollRef={headerScrollRef}
          onScroll={handleHeaderScroll}
          isFetching={isFetching}
          filterButton={
            <ViewRangeFilter
              currentType={viewRangeType}
              onTypeChange={setViewRangeType}
            />
          }
          tasksButton={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTaskPanelOpen(!isTaskPanelOpen)}
              className="gap-2"
            >
              <ListTodo className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
              {unscheduledTasks.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {unscheduledTasks.length}
                </Badge>
              )}
            </Button>
          }
          aiButton={
            <AIScheduleSheet
              isLoading={isAILoading}
              error={aiError}
              onSendMessage={handleAISendMessage}
              onClearError={clearAIError}
            />
          }
        />
        <TimeGrid
          days={viewRangeDates.days}
          blocks={blocks}
          onCreateClick={openCreateModal}
          onEditClick={openEditModal}
          horizontalScrollRef={gridScrollRef}
          onHorizontalScroll={handleGridScroll}
        />
        <ScheduleModal
          state={state}
          onSubmit={handleSaveBlock}
          onClose={closeModal}
          onDelete={handleBlockDelete}
        />
      </div>

      <DragOverlay>
        {activeBlock && <TimeBlockOverlay block={activeBlock} />}
        {activeTask && <ScheduleTaskDragOverlay task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
}
