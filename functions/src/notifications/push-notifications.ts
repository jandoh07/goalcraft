import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { db } from "../config/admin";

interface UserDoc {
  pushNotifications?: boolean;
  timezone?: string;
  notificationTime?: number; // Hour in 24h format (0-23), default 20 (8 PM)
}

interface FcmTokenDoc {
  token: string;
  deviceType: string;
}

const APP_URL = "https://goal-craft-staging-service-4tceg.ondigitalocean.app/";

/**
 * Maps non-standard timezone abbreviations (like UTC, GMT) to valid IANA timezones
 * This handles cases where Intl.DateTimeFormat().resolvedOptions().timeZone returns
 * non-IANA values like "UTC" or "GMT"
 */
const NON_IANA_TIMEZONE_MAP: Record<string, string> = {
  UTC: "Etc/UTC",
  GMT: "Etc/GMT",
  "GMT+0": "Etc/GMT",
  "GMT-0": "Etc/GMT",
  EST: "America/New_York",
  EDT: "America/New_York",
  CST: "America/Chicago",
  CDT: "America/Chicago",
  MST: "America/Denver",
  MDT: "America/Denver",
  PST: "America/Los_Angeles",
  PDT: "America/Los_Angeles",
  BST: "Europe/London",
  IST: "Asia/Kolkata",
  JST: "Asia/Tokyo",
  AEST: "Australia/Sydney",
  AEDT: "Australia/Sydney",
  NZST: "Pacific/Auckland",
  NZDT: "Pacific/Auckland",
};

/**
 * Normalizes a timezone string to a valid IANA timezone
 * If the timezone is already valid IANA, returns it as-is
 * If it's a known abbreviation, maps it to IANA equivalent
 * Otherwise returns the default "Etc/UTC"
 */
const normalizeTimezone = (timezone: string | undefined): string => {
  if (!timezone) return "Etc/UTC";

  // Check if it's a known non-IANA abbreviation
  const upperTimezone = timezone.toUpperCase();
  if (NON_IANA_TIMEZONE_MAP[upperTimezone]) {
    return NON_IANA_TIMEZONE_MAP[upperTimezone];
  }

  // Validate if it's a valid IANA timezone
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return timezone;
  } catch {
    // Invalid timezone, return UTC
    return "Etc/UTC";
  }
};

/**
 * Sends a push notification to all devices registered for a user
 */
const sendPushNotification = async (
  userId: string,
  title: string,
  body: string,
  url: string,
): Promise<void> => {
  const tokensSnapshot = await db
    .collection("users")
    .doc(userId)
    .collection("fcmTokens")
    .get();

  if (tokensSnapshot.empty) return;

  const tokens = tokensSnapshot.docs.map(
    (doc) => (doc.data() as FcmTokenDoc).token,
  );

  const message: admin.messaging.MulticastMessage = {
    tokens,
    data: {
      title,
      body,
      url,
      type: url.includes("weekly") ? "weekly_review" : "daily_review",
      id: Date.now().toString(),
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
              .doc(tokenId),
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
 * Gets a map of timezone -> hours that are currently active
 * This allows us to efficiently query users for each hour
 */
const getCurrentHoursByTimezone = (): Map<string, number> => {
  const allTimezones = getAllTimezones();
  const timezoneHours = new Map<string, number>();

  for (const tz of allTimezones) {
    const hour = getCurrentHourInTimezone(tz);
    if (hour >= 0) {
      timezoneHours.set(tz, hour);
    }
  }

  return timezoneHours;
};

/**
 * Scheduled function that runs every hour to send daily/weekly review notifications
 * Sends notifications at 8 PM in each user's local timezone
 */
const DEFAULT_NOTIFICATION_HOUR = 20; // 8 PM

/**
 * Gets known non-IANA timezone abbreviations that should be queried
 * and processed along with IANA timezones
 */
const getNonIanaTimezones = (): string[] => {
  return Object.keys(NON_IANA_TIMEZONE_MAP);
};

export const sendReviewNotifications = onSchedule(
  {
    schedule: "0 * * * *",
    timeZone: "Etc/UTC",
    memory: "512MiB",
    timeoutSeconds: 540,
  },
  async () => {
    logger.info("Starting review notifications check...");

    // Get current hour for all timezones
    const timezoneHours = getCurrentHoursByTimezone();

    // Group timezones by their current hour
    const hourToTimezones = new Map<number, string[]>();
    for (const [tz, hour] of timezoneHours) {
      if (!hourToTimezones.has(hour)) {
        hourToTimezones.set(hour, []);
      }
      hourToTimezones.get(hour)!.push(tz);
    }

    // Add non-IANA timezones mapped to their equivalent IANA hour
    const nonIanaTimezones = getNonIanaTimezones();
    for (const nonIanaTz of nonIanaTimezones) {
      const ianaEquivalent = NON_IANA_TIMEZONE_MAP[nonIanaTz];

      // Check if IANA equivalent is already in our map
      let hour = timezoneHours.get(ianaEquivalent);

      // If not (e.g., Etc/UTC isn't in supportedValuesOf), calculate it directly
      if (hour === undefined) {
        hour = getCurrentHourInTimezone(ianaEquivalent);
        if (hour >= 0) {
          // Also add the IANA equivalent to the map for future reference
          timezoneHours.set(ianaEquivalent, hour);
        }
      }

      if (hour !== undefined && hour >= 0) {
        // Add non-IANA timezone to the same hour group
        if (!hourToTimezones.has(hour)) {
          hourToTimezones.set(hour, []);
        }
        hourToTimezones.get(hour)!.push(nonIanaTz);
      }
    }

    let totalNotificationsSent = 0;
    const batchSize = 10;

    // Process each hour that has timezones
    for (const [currentHour, timezones] of hourToTimezones) {
      // Process timezones in batches
      for (let i = 0; i < timezones.length; i += batchSize) {
        const batchTimezones = timezones.slice(i, i + batchSize);

        // Query users who have push notifications enabled and are in these timezones
        const usersSnapshot = await db
          .collection("users")
          .where("pushNotifications", "==", true)
          .where("timezone", "in", batchTimezones)
          .get();

        if (usersSnapshot.empty) continue;

        // Filter users whose notification time matches the current hour in their timezone
        const eligibleUsers = usersSnapshot.docs.filter((userDoc) => {
          const userData = userDoc.data() as UserDoc;
          const userNotificationTime =
            userData.notificationTime ?? DEFAULT_NOTIFICATION_HOUR;
          return userNotificationTime === currentHour;
        });

        if (eligibleUsers.length === 0) continue;

        logger.info(
          `Processing ${eligibleUsers.length} users for hour ${currentHour} in timezones: ${batchTimezones.join(", ")}`,
        );

        const notificationsPromises = eligibleUsers.map(async (userDoc) => {
          const userData = userDoc.data() as UserDoc;
          const userId = userDoc.id;
          // Normalize timezone for proper date/time calculations
          const userTimezone = normalizeTimezone(userData.timezone);

          const isSunday = isSundayInTimezone(userTimezone);

          const title = isSunday
            ? "📅 Weekly Review Time!"
            : "✨ Daily Review Time!";
          const body = isSunday
            ? "Take a moment to reflect on your week."
            : "Review your day and celebrate your progress!";

          const url = isSunday
            ? `${APP_URL}/goals?review=weekly`
            : `${APP_URL}/goals?review=daily`;

          await sendPushNotification(userId, title, body, url);
        });

        await Promise.all(notificationsPromises);
        totalNotificationsSent += eligibleUsers.length;
      }
    }

    logger.info(
      `Review notifications complete. Sent to ${totalNotificationsSent} users.`,
    );
  },
);
