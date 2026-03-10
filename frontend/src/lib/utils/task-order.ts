import { generateKeyBetween } from "fractional-indexing";
import { Task, TaskGroup } from "@/types";

type TaskPriority = 0 | 1 | 2 | 3;

function getTaskPriority(task: {
  isImportant?: boolean;
  isUrgent?: boolean;
}): TaskPriority {
  if (task.isImportant && task.isUrgent) return 0;
  if (task.isUrgent) return 1;
  if (task.isImportant) return 2;
  return 3;
}

function getTaskGroup(dueDate: Date | null | undefined): string {
  if (!dueDate) return "no-date";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const d = dueDate instanceof Date ? dueDate : new Date(dueDate);
  const dueDateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (dueDateOnly < today) return "overdue";
  if (dueDateOnly.getTime() === today.getTime()) return "today";
  if (dueDateOnly.getTime() === tomorrow.getTime()) return "tomorrow";
  return "upcoming";
}

export function toFractionalKey(order: unknown): string | null {
  if (order == null) return null;
  const str = String(order);
  return /^[a-zA-Z]/.test(str) ? str : null;
}

/** Sort a flat array of tasks by their fractional index, ascending. */
export function sortByOrder(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const oA = a.order;
    const oB = b.order;
    if (oA == null && oB == null) return 0;
    if (oA == null) return 1;
    if (oB == null) return -1;
    if (typeof oA === "number" && typeof oB === "number") return oA - oB;
    const sA = String(oA);
    const sB = String(oB);
    if (sA < sB) return -1;
    if (sA > sB) return 1;
    return 0;
  });
}

/**
 * Given an already-sorted list of tasks in a group, the dropped item, and the
 * target index, compute the fractional key that places the task at that index.
 * The droppedTask should NOT already be present in the sorted list.
 */
export function computeOrderForIndex(
  sortedGroupTasks: Task[],
  toIndex: number,
): string {
  const prevOrder =
    toIndex > 0
      ? toFractionalKey(sortedGroupTasks[toIndex - 1]?.order)
      : null;
  const nextOrder =
    toIndex < sortedGroupTasks.length
      ? toFractionalKey(sortedGroupTasks[toIndex]?.order)
      : null;
  return generateKeyBetween(prevOrder, nextOrder);
}

/**
 * Computes the initial fractional-index `order` for a new task, placing it at
 * the end of its priority bucket within its date group.
 *
 * Ordering within a group (highest → lowest priority):
 *   Q1 (important + urgent) → Q2 (urgent only) → Q3 (important only) → Q4 (neither)
 *
 * If no tasks of equal-or-higher priority exist in the group the task is placed
 * at the front of the group (before lower-priority tasks).
 */
export function computeInitialOrder(
  newTask: { dueDate?: Date | null; isImportant?: boolean; isUrgent?: boolean },
  allTasks: Task[],
): string {
  const group = getTaskGroup(newTask.dueDate);
  const newPriority = getTaskPriority(newTask);

  const groupTasks = sortByOrder(
    allTasks.filter(
      (t) =>
        t.status !== "completed" &&
        t.status !== "archived" &&
        getTaskGroup(t.dueDate) === group,
    ),
  );

  if (groupTasks.length === 0) {
    return generateKeyBetween(null, null);
  }

  let insertAfterIndex = -1;

  if (newPriority === 3) {
    insertAfterIndex = groupTasks.length - 1;
  } else {
    for (let i = groupTasks.length - 1; i >= 0; i--) {
      if (getTaskPriority(groupTasks[i]) <= newPriority) {
        insertAfterIndex = i;
        break;
      }
    }
  }

  // insertAfterIndex is the last same-or-higher-priority item.
  // We want to insert AFTER it, i.e. at index insertAfterIndex + 1.
  // computeOrderForIndex takes the sorted list WITHOUT the item being inserted.
  return computeOrderForIndex(groupTasks, insertAfterIndex + 1);
}

/**
 * Given the final flat index of the dragged item (use `source.index` from the
 * drag-end event — the optimistically-sorted position the item landed at) and
 * the pre-drag flat task array, returns the TaskGroup the item belongs to.
 *
 * Using `source.index` (dragged item’s final position) rather than
 * `target.index` (hover target’s position) avoids an off-by-one error when the
 * source moves forward past the target.
 */
export function computeGroupFromIndex(
  toFlatIndex: number,
  flatTasks: { task: Task; group: TaskGroup }[],
): TaskGroup | undefined {
  return flatTasks[toFlatIndex]?.group;
}
