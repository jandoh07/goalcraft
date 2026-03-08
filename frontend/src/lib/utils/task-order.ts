import { generateKeyBetween } from "fractional-indexing";
import { Task } from "@/types";

// Priority tiers: lower number = higher priority
// Q1 (0): important + urgent  → Do First
// Q2 (1): urgent only         → Schedule
// Q3 (2): important only      → Delegate
// Q4 (3): neither             → Eliminate
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

// Fractional-indexing keys always start with a letter. Legacy numeric values
// (e.g. 0, 1, 2) stored from before the migration are not valid keys and must
// be treated as "no position" to avoid passing invalid strings to generateKeyBetween.
function toFractionalKey(order: unknown): string | null {
  if (order == null) return null;
  const str = String(order);
  return /^[a-zA-Z]/.test(str) ? str : null;
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

  const groupTasks = allTasks
    .filter(
      (t) =>
        t.status !== "completed" &&
        t.status !== "archived" &&
        getTaskGroup(t.dueDate) === group,
    )
    .sort((a, b) => {
      const oA = a.order;
      const oB = b.order;
      if (oA == null && oB == null) return 0;
      if (oA == null) return 1;
      if (oB == null) return -1;
      const sA = String(oA);
      const sB = String(oB);
      if (sA < sB) return -1;
      if (sA > sB) return 1;
      return 0;
    });

  if (groupTasks.length === 0) {
    return generateKeyBetween(null, null);
  }

  // Q4 always goes to the end.
  // All others go after the last task of equal-or-higher priority (lower number).
  // If no such task exists, insertAfterIndex stays -1 → insert before everything.
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

  const prevOrder =
    insertAfterIndex >= 0
      ? toFractionalKey(groupTasks[insertAfterIndex].order)
      : null;

  const nextOrder =
    insertAfterIndex + 1 < groupTasks.length
      ? toFractionalKey(groupTasks[insertAfterIndex + 1].order)
      : null;

  return generateKeyBetween(prevOrder, nextOrder);
}
