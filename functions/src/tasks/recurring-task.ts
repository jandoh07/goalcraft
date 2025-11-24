import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../config/admin";
import {
  calculateNextRun,
  calculateTaskDueDate,
} from "../utils/recurring-task-utils";

// TODO: switch to dispatch and workers when user base grows

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
          pausedReason: "auto-pause-inactivity",
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
      let taskDueDate: Date;
      let safetyCounter = 0;

      try {
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

        taskDueDate = calculateTaskDueDate(
          masterTask.nextRun.toDate(),
          timeZone
        );
      } catch (error) {
        logger.error(
          `Timezone error for task ${masterTaskId} with timezone "${timeZone}". Falling back to UTC.`,
          error
        );

        // Fallback to UTC calculations
        nextValidRun = lastRunDate;
        while (nextValidRun <= nowJs) {
          nextValidRun = calculateNextRun(
            masterTask.frequency,
            nextValidRun,
            "Etc/UTC"
          );
          safetyCounter++;
          if (safetyCounter > 100) break;
        }
        taskDueDate = calculateTaskDueDate(
          masterTask.nextRun.toDate(),
          "Etc/UTC"
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
