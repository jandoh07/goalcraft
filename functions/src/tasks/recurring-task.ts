import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { db } from "../config/admin";

// Run at a specific time every day (e.g., 2:00 AM UTC)
export const handleRecurringTasks = onSchedule(
  { schedule: "0 2 * * *", timeZone: "Etc/UTC" },
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

      const nextRunDate = masterTask.nextRun.toDate();

      let nextValidRun = nextRunDate;
      while (nextValidRun <= nowJs) {
        nextValidRun = calculateNextRun(masterTask.frequency, nextValidRun);
      }

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

// Helper function (no changes)
const calculateNextRun = (frequency: string, fromDate: Date): Date => {
  const next = new Date(fromDate);
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      next.setDate(next.getDate() + 1);
  }
  return next;
};
