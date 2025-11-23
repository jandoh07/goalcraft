import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { addDays, addWeeks, addMonths, startOfDay } from "date-fns";
import { db } from "../config/admin";

// TODO: switch to dispatch and workers when user base grows
const calculateNextRun = (
  frequency: string,
  fromDate: Date,
  timeZone: string
): Date => {
  const zonedDate = toZonedTime(fromDate, timeZone);

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

  const normalizedNextRun = startOfDay(nextRun);

  return fromZonedTime(normalizedNextRun, timeZone);
};

export const handleRecurringTasks = onSchedule(
  { schedule: "*/15 * * * *", timeZone: "Etc/UTC", memory: "512MiB" },
  async () => {
    logger.info("Starting recurring tasks check...");

    const now = Timestamp.now();
    const nowJs = now.toDate();

    const snapshot = await db
      .collection("masterTasks")
      .where("recurringStatus", "==", "active")
      .where("nextRun", "<=", now)
      .limit(500)
      .get();

    if (snapshot.empty) {
      logger.info("No recurring tasks due for processing.");
      return;
    }

    logger.info(`Found ${snapshot.size} recurring tasks due.`);

    let batch = db.batch();
    let opCount = 0;
    let tasksCreated = 0;
    let tasksPaused = 0;
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

      const currentMissedStreak = masterTask.consecutiveUncompleted || 0;

      if (currentMissedStreak >= 4) {
        logger.info(
          `Task ${masterTaskId} ("${masterTask.title}") paused due to missed streak: ${currentMissedStreak}`
        );

        batch.update(doc.ref, {
          recurringStatus: "paused",
          updatedAt: now,
        });

        tasksPaused++;
        opCount++;

        if (masterTask.userId) {
          const notifRef = db.collection("notifications").doc();

          logger.info(
            `Creating auto-pause notification for user ${masterTask.userId} for task ${masterTaskId}`
          );

          batch.set(notifRef, {
            userId: masterTask.userId,
            type: "auto_pause",
            title: "Recurring Task Paused",
            message: `We've paused "${masterTask.title}" after 4 consecutive missed completions. You can resume it anytime.`,
            resourceId: doc.id,
            isRead: false,
            createdAt: now,
          });

          opCount++;
        } else {
          logger.warn(
            `Task ${masterTaskId} has no userId, skipping notification creation`
          );
        }

        if (opCount > 490) {
          promises.push(batch.commit());
          batch = db.batch();
          opCount = 0;
        }

        continue;
      }

      const timeZone = masterTask.timeZone || "Etc/UTC";
      const lastRunDate = masterTask.nextRun.toDate();
      let nextValidRun = lastRunDate;
      let safetyCounter = 0;

      while (nextValidRun <= nowJs) {
        nextValidRun = calculateNextRun(
          masterTask.frequency,
          nextValidRun,
          timeZone
        );

        safetyCounter++;
        if (safetyCounter > 100) {
          logger.warn(
            `Safety counter exceeded for task ${masterTaskId}, breaking loop.`
          );
          break;
        }
      }

      const originalDueDate = masterTask.nextRun.toDate();
      let taskDueDate = originalDueDate;

      if (originalDueDate <= nowJs) {
        taskDueDate = calculateNextRun(masterTask.frequency, nowJs, timeZone);
        logger.info(
          `Task ${masterTaskId} dueDate was in the past (${originalDueDate.toISOString()}), calculated new dueDate: ${taskDueDate.toISOString()}`
        );
      }

      const newTask = {
        ...masterTask,
        isRecurring: false,
        dueDate: Timestamp.fromDate(taskDueDate),
        status: "in-progress",
        createdAt: now,
        updatedAt: now,
        recurringMasterId: masterTaskId,
      };

      const taskInstance: Record<string, unknown> = newTask;
      delete taskInstance.nextRun;
      delete taskInstance.recurringStatus;
      delete taskInstance.consecutiveUncompleted;
      delete taskInstance.timeZone;

      const newTaskRef = db.collection("tasks").doc();
      batch.set(newTaskRef, taskInstance);

      batch.update(doc.ref, {
        nextRun: Timestamp.fromDate(nextValidRun),
        consecutiveUncompleted: currentMissedStreak + 1,
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
      `Recurring tasks processed ✅ - Created: ${tasksCreated} new instances, Paused: ${tasksPaused} tasks.`
    );
  }
);
