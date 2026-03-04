# Schedule Page Drag-and-Drop System

This document explains how the drag-and-drop functionality works on the schedule page for scheduling tasks as time blocks.

## Overview

The schedule page allows users to:
1. View their time blocks on a weekly/multi-day grid
2. Drag unscheduled tasks onto the grid to create time blocks
3. Drag existing time blocks to reschedule them
4. Edit and delete time blocks

## Architecture

### DnD Library: @dnd-kit

We use `@dnd-kit/core` for drag-and-drop functionality. Key imports:

```typescript
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,  // Collision detection
} from "@dnd-kit/core";
```

### Key Design Decisions

1. **`pointerWithin` collision detection**: We use `pointerWithin` instead of `closestCenter` to ensure tasks are only scheduled when dropped directly on a grid cell, not just "closest" to one. This prevents accidental scheduling when dropping tasks back on the sidebar.

2. **Hour-level drop zones**: Each hour on the grid is a separate droppable zone (`day-{dayIndex}-hour-{hour}`), enabling precise time placement.

3. **DndContext at page level**: The `DndContext` wraps both the tasks panel and the time grid so draggables can be dropped across components.

## Components

### 1. Schedule Page (`schedule/page.tsx`)

The main orchestrator that:
- Wraps everything in `DndContext`
- Manages `activeBlock` and `activeTask` state for drag overlays
- Handles `onDragStart` and `onDragEnd` events
- Filters unscheduled tasks (tasks not linked to any time block)
- Sorts tasks by Eisenhower priority (urgent+important first)

```typescript
// Eisenhower priority sorting
const getEisenhowerPriority = (task: Task): number => {
  const isImportant = task.isImportant ?? false;
  const isUrgent = task.isUrgent ?? false;
  if (isImportant && isUrgent) return 0;   // Highest
  if (isImportant && !isUrgent) return 1;
  if (!isImportant && isUrgent) return 2;
  return 3;                                  // Lowest
};
```

### 2. Unscheduled Tasks Panel (`unscheduled-tasks-panel.tsx`)

Two variants for responsive design:

#### Desktop Sidebar (`UnscheduledTasksPanel`)
- Fixed left sidebar (hidden on mobile: `hidden md:flex`)
- Shows when `isOpen` is true
- Vertical list of draggable tasks
- `overflow-hidden` when dragging to prevent auto-scroll issues

#### Mobile Top Drawer (`MobileTasksDrawer`)
- Fixed position below mobile header (`top: 52px`)
- Overlays content with backdrop (doesn't shift grid)
- Horizontal scrollable list of compact task cards
- Only renders when `isOpen` is true

### 3. Draggable Task Cards

Two versions optimized for their contexts:

```typescript
// Desktop - vertical list
function DraggableScheduleTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `schedule-task-${task.id}`,
      data: { task, type: "unscheduled-task" },
    });
  // ...
}

// Mobile - horizontal compact cards
function MobileDraggableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `mobile-task-${task.id}`,
      data: { task, type: "unscheduled-task" },
    });
  // ...
}
```

Key props:
- `id`: Unique identifier for the draggable
- `data`: Passed to drop handler, contains `task` and `type: "unscheduled-task"`

### 4. Droppable Day Column (`droppable-day-column.tsx`)

Each day column contains 24 hour-level drop zones:

```typescript
function DroppableHourSlot({ dayIndex, hour, date, onClick }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dayIndex}-hour-${hour}`,
    data: { date, dayIndex, hour },
  });
  // ...
}
```

The `data` object provides:
- `date`: The Date object for that day
- `hour`: The hour (0-23)
- `dayIndex`: Index in the days array

### 5. Time Grid (`time-grid.tsx`)

Displays the schedule grid with:
- Time labels column (hours 0-23)
- Day columns with drop zones
- Existing time blocks (draggable for rescheduling)
- Current time indicator

### 6. Drag Overlays

Visual feedback during drag:

```typescript
<DragOverlay>
  {activeBlock && <TimeBlockOverlay block={activeBlock} />}
  {activeTask && <ScheduleTaskDragOverlay task={activeTask} />}
</DragOverlay>
```

## Drag-and-Drop Flow

### 1. Starting a Drag

```typescript
const handleDragStart = (event: DragStartEvent) => {
  const data = event.active.data.current;
  if (data?.block) {
    setActiveBlock(data.block as TimeBlock);
  } else if (data?.type === "unscheduled-task" && data?.task) {
    setActiveTask(data.task as Task);
  }
};
```

### 2. Ending a Drag (Task → Time Block)

```typescript
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over, delta } = event;
  
  // Clear overlays
  setActiveBlock(null);
  setActiveTask(null);

  if (!over) return;  // Dropped outside any droppable

  const overId = String(over.id);
  
  // Validate drop target is an hour slot
  if (!overId.includes("-hour-")) return;

  const targetDate = over.data.current?.date as Date;
  const targetHour = over.data.current?.hour as number;
  
  if (!targetDate || targetHour === undefined) return;

  // Create time block from task
  if (data?.type === "unscheduled-task" && data?.task) {
    const task = data.task as Task;
    const startTime = setMinutes(setHours(targetDate, targetHour), 0);
    const endTime = addHours(startTime, 1);

    const newBlock = {
      userId: user.uid,
      title: task.title,
      start: startTime,
      end: endTime,
      taskId: task.id,
      // ... other fields
    };

    addTimeBlock.mutate(newBlock);
  }
};
```

### 3. Moving Existing Blocks

For existing time blocks, we calculate the new position based on drag delta:

```typescript
if (data?.block) {
  const block = data.block as TimeBlock;
  const currentStartHour = block.start.getHours() + block.start.getMinutes() / 60;
  const hourDelta = Math.round((delta.y / HOUR_HEIGHT) * 2) / 2;  // Snap to 30-min
  const newHour = Math.max(0, Math.min(23.5, currentStartHour + hourDelta));
  
  handleBlockMove(block.id, targetDate, newHour);
}
```

## Mobile Considerations

### Touch Support

Sensors are configured for both pointer and touch:

```typescript
const pointerSensor = useSensor(PointerSensor, {
  activationConstraint: { distance: 8 },
});
const touchSensor = useSensor(TouchSensor, {
  activationConstraint: { delay: 200, tolerance: 5 },
});
const sensors = useSensors(pointerSensor, touchSensor);
```

### Preventing Auto-Scroll

When dragging, we disable overflow on the tasks panel to prevent dnd-kit's auto-scroll from scrolling the task list:

```typescript
<div className={cn(
  "flex gap-2 p-2",
  isDragging ? "overflow-hidden" : "overflow-x-auto custom-scrollbar",
)}>
```

### Fixed Positioning

The mobile drawer uses fixed positioning so it overlays the grid rather than shifting it:

```typescript
<div
  className="md:hidden fixed left-0 right-0 z-50 bg-background"
  style={{ top: "52px" }}  // Below mobile header
>
```

## Data Model

### TimeBlock

```typescript
interface TimeBlock {
  id: string;
  userId: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  taskId?: string;      // Links to task
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Task (relevant fields)

```typescript
interface Task {
  id: string;
  title: string;
  isImportant?: boolean;  // Eisenhower matrix
  isUrgent?: boolean;     // Eisenhower matrix
  dueDate?: Date;
  priority?: "high" | "medium" | "low";
  // ...
}
```

## Visual Indicators

### Eisenhower Priority Colors

Tasks in the sidebar show visual priority indicators:
- **Important + Urgent**: Red left border + both icons
- **Important only**: Orange left border + flag icon
- **Urgent only**: Yellow left border + alert icon

### Drop Zone Highlighting

When dragging over a valid drop zone, it highlights with `bg-primary/20`.

### Drag Overlay

The drag overlay shows a simplified card:
```typescript
export function ScheduleTaskDragOverlay({ task }: { task: Task }) {
  return (
    <div className="rounded-md border-l-3 border-blue-500 px-2 py-2 bg-blue-500/20 shadow-lg w-40 backdrop-blur-sm">
      <p className="font-medium text-xs truncate">{task.title}</p>
    </div>
  );
}
```

## Troubleshooting

### Task Schedules When Dropped Outside Grid

Make sure `pointerWithin` collision detection is used, not `closestCenter`. Also verify the drop handler checks for `-hour-` in the `overId`.

### Tasks Disappear While Dragging

The original element should have `opacity: 0.4` while the `DragOverlay` shows the preview. Make sure both the dragging style and overlay are configured.

### Mobile Drawer Hidden Behind Header

The drawer should have `z-50` and `top: 52px` (mobile header height) to appear below the header.
