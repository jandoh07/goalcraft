import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { db } from "../config/admin";

interface UserDoc {
  pushNotifications?: boolean;
  timezone?: string;
}

interface FcmTokenDoc {
  token: string;
  deviceType: string;
}

const APP_URL = "https://goal-craft-staging-service-4tceg.ondigitalocean.app/";

/**
 * Sends a push notification to all devices registered for a user
 */
const sendPushNotification = async (
  userId: string,
  title: string,
  body: string,
  url: string
): Promise<void> => {
  const tokensSnapshot = await db
    .collection("users")
    .doc(userId)
    .collection("fcmTokens")
    .get();

  if (tokensSnapshot.empty) return;

  const tokens = tokensSnapshot.docs.map(
    (doc) => (doc.data() as FcmTokenDoc).token
  );

  const message: admin.messaging.MulticastMessage = {
    tokens,
    data: {
      title,
      body,
      url,
      type: url.includes("weekly") ? "weekly_review" : "daily_review",
    },
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);

    if (response.failureCount > 0) {
      const invalidTokenIds: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          if (
            errorCode === "messaging/invalid-registration-token" ||
            errorCode === "messaging/registration-token-not-registered"
          ) {
            invalidTokenIds.push(tokensSnapshot.docs[idx].id);
          }
        }
      });

      if (invalidTokenIds.length > 0) {
        const batch = db.batch();
        invalidTokenIds.forEach((tokenId) => {
          batch.delete(
            db
              .collection("users")
              .doc(userId)
              .collection("fcmTokens")
              .doc(tokenId)
          );
        });
        await batch.commit();
        logger.info(`Cleaned ${invalidTokenIds.length} tokens for ${userId}`);
      }
    }
  } catch (error) {
    logger.error(`Error sending to ${userId}:`, error);
  }
};

/**
 * Gets the current hour (0-23) in a specific timezone
 */
const getCurrentHourInTimezone = (timezone: string): number => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    });
    return parseInt(formatter.format(now), 10);
  } catch {
    // Invalid timezone, return -1 to skip
    return -1;
  }
};

/**
 * Checks if it's Sunday in a specific timezone
 */
const isSundayInTimezone = (timezone: string): boolean => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
    });
    return formatter.format(now) === "Sunday";
  } catch {
    return false;
  }
};

/**
 * Gets all IANA timezones supported by Node.js
 */
const getAllTimezones = (): string[] => {
  return (
    Intl as typeof Intl & { supportedValuesOf: (key: string) => string[] }
  ).supportedValuesOf("timeZone");
};

/**
 * Gets all unique timezones where it's currently 8 PM (20:00)
 */
const getTimezonesAt8PM = (): Set<string> => {
  const targetHour = 20; // 8 PM
  const allTimezones = getAllTimezones();

  const matching = new Set<string>();
  for (const tz of allTimezones) {
    if (getCurrentHourInTimezone(tz) === targetHour) {
      matching.add(tz);
    }
  }

  return matching;
};

/**
 * Scheduled function that runs every hour to send daily/weekly review notifications
 * Sends notifications at 8 PM in each user's local timezone
 */
export const sendReviewNotifications = onSchedule(
  {
    schedule: "0 * * * *",
    timeZone: "Etc/UTC",
    memory: "512MiB",
    timeoutSeconds: 540, // Increased timeout just in case
  },
  async () => {
    logger.info("Starting review notifications check...");
    const targetTimezones = getTimezonesAt8PM();

    if (targetTimezones.size === 0) {
      logger.info("No timezones at 8 PM.");
      return;
    }

    const timezonesArray = [...targetTimezones];
    // Batch size for Firestore 'in' query
    const batchSize = 10;
    let totalNotificationsSent = 0;

    for (let i = 0; i < timezonesArray.length; i += batchSize) {
      const batchTimezones = timezonesArray.slice(i, i + batchSize);

      const usersSnapshot = await db
        .collection("users")
        .where("pushNotifications", "==", true)
        .where("timezone", "in", batchTimezones)
        .get();

      if (usersSnapshot.empty) continue;

      logger.info(`Processing ${usersSnapshot.size} users in batch...`);

      const notificationsPromises = usersSnapshot.docs.map(async (userDoc) => {
        const userData = userDoc.data() as UserDoc;
        const userId = userDoc.id;
        const userTimezone = userData.timezone || "UTC";

        const isSunday = isSundayInTimezone(userTimezone);

        const title = isSunday
          ? "📅 Weekly Review Time!"
          : "✨ Daily Review Time!";
        const body = isSunday
          ? "Take a moment to reflect on your week."
          : "Review your day and celebrate your progress!";

        const url = isSunday
          ? `${APP_URL}?review=weekly`
          : `${APP_URL}?review=daily`;

        await sendPushNotification(userId, title, body, url);
        // Note: totalNotificationsSent won't be perfectly accurate here due to concurrency,
        // but that's fine for logging.
      });

      // Wait for this entire batch of users to finish before moving to the next timezone batch
      await Promise.all(notificationsPromises);

      totalNotificationsSent += usersSnapshot.size;
    }

    logger.info(
      `Review notifications complete. Processed ~${totalNotificationsSent} users.`
    );
  }
);
