import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

// Initialize Firebase Admin for the emulator
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "goalcraft-70789", // Your Firebase project ID
  });
}

const db = admin.firestore();

// Connect to the Firestore emulator
db.settings({
  host: "localhost:8080",
  ssl: false,
});

const seedData = {
  tasks: {
    master_due_utc: {
      title: "TEST 1: Due Task (UTC)",
      isRecurring: true,
      recurringStatus: "active",
      frequency: "daily",
      timeZone: "Etc/UTC",
      status: "in-progress",
      userId: "testUser1",
      nextRun: Timestamp.fromDate(new Date("2025-10-30T00:00:00.000Z")),
    },
    master_future_utc: {
      title: "TEST 2: Future Task (UTC)",
      isRecurring: true,
      recurringStatus: "active",
      frequency: "daily",
      timeZone: "Etc/UTC",
      status: "in-progress",
      userId: "testUser1",
      nextRun: Timestamp.fromDate(new Date("2025-10-31T00:00:00.000Z")),
    },
    master_paused: {
      title: "TEST 3: Paused Task (Should be ignored)",
      isRecurring: true,
      recurringStatus: "paused",
      frequency: "daily",
      timeZone: "Etc/UTC",
      status: "in-progress",
      userId: "testUser1",
      nextRun: Timestamp.fromDate(new Date("2025-10-30T00:00:00.000Z")),
    },
    master_due_sydney: {
      title: "TEST 4: Due Task (Sydney)",
      isRecurring: true,
      recurringStatus: "active",
      frequency: "daily",
      timeZone: "Australia/Sydney",
      status: "in-progress",
      userId: "testUser2",
      nextRun: Timestamp.fromDate(new Date("2025-10-29T13:00:00.000Z")),
    },
    master_future_newyork: {
      title: "TEST 5: Future Task (New York)",
      isRecurring: true,
      recurringStatus: "active",
      frequency: "daily",
      timeZone: "America/New_York",
      status: "in-progress",
      userId: "testUser3",
      nextRun: Timestamp.fromDate(new Date("2025-10-31T04:00:00.000Z")),
    },
    instance_not_recurring: {
      title: "TEST 6: Simple Task (Should be ignored)",
      isRecurring: false,
      status: "in-progress",
      userId: "testUser4",
    },
    instance_uncompleted_4_days: {
      title: "TEST 7: Uncompleted for 4 Days (Should be paused)",
      isRecurring: false,
      recurringStatus: "active",
      status: "in-progress",
      userId: "testUser5",
      frequency: "daily",
      nextRun: Timestamp.fromDate(new Date("2025-10-27T00:00:00.000Z")),
      consecutiveUncompleted: 4,
    },
  },
};

async function seed() {
  console.log("🌱 Starting Firestore seeding...");

  const batch = db.batch();

  Object.entries(seedData.tasks).forEach(([id, data]) => {
    const ref = db.collection("tasks").doc(id);
    batch.set(ref, data);
  });

  await batch.commit();
  console.log("✅ Firestore seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
