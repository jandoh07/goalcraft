import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
// <-- CHANGE: Add imports for date-fns and date-fns-tz
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { addDays, addWeeks, addMonths, startOfDay } from "date-fns";
import { db } from "../config/admin";

// <-- CHANGE: This helper function is now time-zone-aware
/**
 * Calculates the next run time, normalized to 12:00 AM
 * in the task's specific time zone.
 */
const calculateNextRun = (
  frequency: string,
  fromDate: Date,
  timeZone: string
): Date => {
  // 1. Convert the JS Date to a "zoned time" object
  const zonedDate = toZonedTime(fromDate, timeZone);

  // 2. Find the start of the *next* day in that time zone
  let nextRun: Date;
  switch (frequency) {
    case "weekly":
      nextRun = addWeeks(zonedDate, 1);
      break;
    case "monthly":
      nextRun = addMonths(zonedDate, 1);
      break;
    case "daily":
    default:
      nextRun = addDays(zonedDate, 1);
  }

  // 3. Normalize to the start of that day (00:00) *in that time zone*
  const normalizedNextRun = startOfDay(nextRun);

  // 4. Convert back to a standard JS Date (which is always UTC)
  return fromZonedTime(normalizedNextRun, timeZone);
};

// This is your function, now updated with time zone logic
export const handleRecurringTasks = onSchedule(
  { schedule: "5 * * * *", timeZone: "Etc/UTC" }, // Runs hourly
  async () => {
    logger.info("Starting recurring tasks check...");

    const now = Timestamp.now();
    const nowJs = now.toDate();

    const snapshot = await db
      .collection("tasks")
      .where("recurringStatus", "==", "active")
      .where("nextRun", "<=", now)
      .get();

    if (snapshot.empty) {
      logger.info("No recurring tasks due for processing.");
      return;
    }

    logger.info(`Found ${snapshot.size} recurring tasks due.`);

    let batch = db.batch();
    let opCount = 0;
    let tasksCreated = 0;
    const promises: Promise<FirebaseFirestore.WriteResult[]>[] = [];

    for (const doc of snapshot.docs) {
      const masterTask = doc.data();
      const masterTaskId = doc.id;

      if (!masterTask.frequency || !masterTask.nextRun) {
        logger.warn(
          `Task ${masterTaskId} missing frequency or nextRun, skipping.`
        );
        continue;
      }

      // --- TIME ZONE LOGIC ---
      // <-- CHANGE: Get the task's time zone. Default to UTC if not found.
      const timeZone = masterTask.timeZone || "Etc/UTC";

      const lastRunDate = masterTask.nextRun.toDate(); // Renamed for clarity

      let nextValidRun = lastRunDate;
      while (nextValidRun <= nowJs) {
        // <-- CHANGE: Pass the time zone to the helper
        nextValidRun = calculateNextRun(
          masterTask.frequency,
          nextValidRun,
          timeZone
        );
      }
      // --- END TIME ZONE LOGIC ---

      const newTask = {
        ...masterTask,
        isRecurring: false,
        dueDate: masterTask.nextRun, // The date it was *supposed* to run
        status: "in-progress",
        createdAt: now,
        updatedAt: now,
        recurringMasterId: masterTaskId, // Link to the master
      };

      // Remove properties that should not be on an instance task
      const taskInstance: Record<string, unknown> = newTask;
      delete taskInstance.nextRun;
      delete taskInstance.recurringStatus;

      // <-- CHANGE: Also delete the timeZone from the instance
      delete taskInstance.timeZone;

      // Add the new task instance to the batch
      const newTaskRef = db.collection("tasks").doc();
      batch.set(newTaskRef, taskInstance);

      // Update the master task with the next future run date
      batch.update(doc.ref, {
        nextRun: Timestamp.fromDate(nextValidRun),
        updatedAt: now,
      });

      tasksCreated++;
      opCount += 2;

      if (opCount > 490) {
        promises.push(batch.commit());
        batch = db.batch();
        opCount = 0;
      }
    }

    if (opCount > 0) {
      promises.push(batch.commit());
    }

    await Promise.all(promises);

    logger.info(
      `Recurring tasks processed ✅ - Created: ${tasksCreated} new instances.`
    );
  }
);
