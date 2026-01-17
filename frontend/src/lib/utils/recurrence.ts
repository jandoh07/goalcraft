import { RRule, RRuleSet } from "rrule";
import { TimeBlock, TimeBlockInstance } from "@/types/schedule";
import {
  setHours,
  setMinutes,
  setSeconds,
  differenceInMilliseconds,
} from "date-fns";

/**
 * Expand a recurring time block into instances within a date range
 */
export function expandRecurringBlock(
  block: TimeBlock,
  rangeStart: Date,
  rangeEnd: Date
): TimeBlockInstance[] {
  if (!block.rrule || !block.isRecurring) {
    return [];
  }

  try {
    // Parse the rrule string
    const rruleSet = new RRuleSet();
    const rule = RRule.fromString(block.rrule);

    // Set the dtstart to the block's start time
    const ruleWithStart = new RRule({
      ...rule.origOptions,
      dtstart: block.start,
    });

    rruleSet.rrule(ruleWithStart);

    // Get occurrences within the range
    const occurrences = rruleSet.between(rangeStart, rangeEnd, true);

    // Calculate the duration of the original block
    const duration = differenceInMilliseconds(block.end, block.start);

    // Create instances for each occurrence
    return occurrences.map((occurrence) => {
      // Preserve the time from the original block but use the occurrence date
      const instanceStart = setSeconds(
        setMinutes(
          setHours(occurrence, block.start.getHours()),
          block.start.getMinutes()
        ),
        block.start.getSeconds()
      );

      const instanceEnd = new Date(instanceStart.getTime() + duration);

      return {
        id: `${block.id}_${occurrence.toISOString()}`,
        userId: block.userId,
        title: block.title,
        start: instanceStart,
        end: instanceEnd,
        color: block.color,
        description: block.description,
        taskId: block.taskId,
        rrule: block.rrule,
        isRecurring: true,
        masterBlockId: block.id,
        instanceDate: occurrence,
        createdAt: block.createdAt,
        updatedAt: block.updatedAt,
      };
    });
  } catch (error) {
    console.error("Error expanding recurring block:", error);
    return [];
  }
}

/**
 * Expand all recurring blocks and merge with non-recurring blocks
 */
export function expandTimeBlocks(
  blocks: TimeBlock[],
  rangeStart: Date,
  rangeEnd: Date
): (TimeBlock | TimeBlockInstance)[] {
  const result: (TimeBlock | TimeBlockInstance)[] = [];

  for (const block of blocks) {
    if (block.isRecurring && block.rrule) {
      // Expand recurring blocks into instances
      const instances = expandRecurringBlock(block, rangeStart, rangeEnd);
      result.push(...instances);
    } else {
      // Add non-recurring blocks directly
      result.push(block);
    }
  }

  return result;
}

/**
 * Check if a block ID is an instance ID (contains underscore separator)
 */
export function isInstanceId(id: string): boolean {
  return id.includes("_") && id.split("_").length >= 2;
}

/**
 * Extract the master block ID from an instance ID
 */
export function getMasterBlockId(instanceId: string): string {
  if (!isInstanceId(instanceId)) {
    return instanceId;
  }
  // Instance ID format: masterBlockId_instanceDateISO
  const parts = instanceId.split("_");
  return parts[0];
}

/**
 * Extract the instance date from an instance ID
 */
export function getInstanceDate(instanceId: string): Date | null {
  if (!isInstanceId(instanceId)) {
    return null;
  }
  const parts = instanceId.split("_");
  if (parts.length >= 2) {
    try {
      return new Date(parts.slice(1).join("_"));
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Common recurrence presets
 */
export const RECURRENCE_PRESETS = {
  daily: "FREQ=DAILY",
  weekdays: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
  weekly: "FREQ=WEEKLY",
  biweekly: "FREQ=WEEKLY;INTERVAL=2",
  monthly: "FREQ=MONTHLY",
} as const;

/**
 * Get a human-readable description of an rrule
 */
export function getRecurrenceDescription(rruleString: string): string {
  try {
    const rule = RRule.fromString(rruleString);
    return rule.toText();
  } catch {
    return "Custom recurrence";
  }
}
