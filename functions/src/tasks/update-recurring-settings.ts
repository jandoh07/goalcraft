import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../config/admin";

interface UpdateRecurrenceData {
  masterTaskId: string; // The ID of the master task to update
  action: "pause" | "resume" | "changeFrequency";
  newFrequency?: string; // Only required for 'changeFrequency'
}

export const updateRecurringSettings = onCall<UpdateRecurrenceData>(
  async (request) => {
    // 1. Check Authentication
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to update a task."
      );
    }

    const { masterTaskId, action, newFrequency } = request.data;
    const userId = request.auth.uid;

    if (!masterTaskId || !action) {
      throw new HttpsError(
        "invalid-argument",
        "Missing 'masterTaskId' or 'action'."
      );
    }

    const masterTaskRef = db.collection("tasks").doc(masterTaskId);
    const batch = db.batch();

    try {
      // Security: Verify the user owns this task
      const taskDoc = await masterTaskRef.get();
      if (!taskDoc.exists) {
        throw new HttpsError("not-found", "Master task not found.");
      }
      if (taskDoc.data()?.userId !== userId) {
        throw new HttpsError("permission-denied", "You do not own this task.");
      }

      // 2. Perform the requested action
      switch (action) {
        case "pause":
          logger.info(`Pausing recurrence for task ${masterTaskId}`);
          batch.update(masterTaskRef, {
            recurringStatus: "paused",
            updatedAt: Timestamp.now(),
          });
          break;

        case "resume":
          logger.info(`Resuming recurrence for task ${masterTaskId}`);
          batch.update(masterTaskRef, {
            recurringStatus: "active",
            updatedAt: Timestamp.now(),
          });
          break;

        case "changeFrequency":
          if (!newFrequency) {
            throw new HttpsError(
              "invalid-argument",
              "Missing 'newFrequency' for 'changeFrequency' action."
            );
          }
          logger.info(
            `Changing frequency for task ${masterTaskId} to ${newFrequency}`
          );
          batch.update(masterTaskRef, {
            frequency: newFrequency,
            updatedAt: Timestamp.now(),
          });
          break;

        default:
          throw new HttpsError("invalid-argument", "Invalid action.");
      }

      // 3. Commit all changes
      await batch.commit();
      return { success: true, action: action };
    } catch (error) {
      logger.error("Error updating recurring settings:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", "An error occurred.");
    }
  }
);
