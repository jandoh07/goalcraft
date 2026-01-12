import { TimeBlock } from "@/types/schedule";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
  onSnapshot,
  writeBatch,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// Query for non-recurring blocks within a date range
const nonRecurringBlocksQuery = (
  userId: string,
  filters?: { startDate?: Date; endDate?: Date }
) => {
  const timeBlocksCollection = collection(db, "timeBlocks");
  let q = query(
    timeBlocksCollection,
    where("userId", "==", userId),
    where("isRecurring", "==", false),
    orderBy("start", "asc")
  );

  if (filters?.startDate) {
    q = query(q, where("start", ">=", Timestamp.fromDate(filters.startDate)));
  }

  if (filters?.endDate) {
    q = query(q, where("start", "<=", Timestamp.fromDate(filters.endDate)));
  }

  return q;
};

// Query for all recurring blocks (they can generate instances in any week)
const recurringBlocksQuery = (userId: string) => {
  const timeBlocksCollection = collection(db, "timeBlocks");
  return query(
    timeBlocksCollection,
    where("userId", "==", userId),
    where("isRecurring", "==", true),
    orderBy("start", "asc")
  );
};

const convertDocToTimeBlock = (doc: DocumentData, id: string): TimeBlock => {
  const data = doc;
  return {
    id,
    userId: data.userId,
    title: data.title,
    start: data.start?.toDate(),
    end: data.end?.toDate(),
    color: data.color,
    description: data.description,
    taskId: data.taskId,
    rrule: data.rrule,
    isRecurring: data.isRecurring,
    masterBlockId: data.masterBlockId,
    originalStart: data.originalStart?.toDate(),
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
};

export const fetchUserTimeBlocks = async (
  userId: string,
  filters?: { startDate?: Date; endDate?: Date }
): Promise<TimeBlock[]> => {
  try {
    // Fetch non-recurring blocks within the date range
    const nonRecurringQuery = nonRecurringBlocksQuery(userId, filters);
    const nonRecurringSnapshot = await getDocs(nonRecurringQuery);

    // Fetch all recurring blocks (they can generate instances in any week)
    const recurringQuery = recurringBlocksQuery(userId);
    const recurringSnapshot = await getDocs(recurringQuery);

    const timeBlocks: TimeBlock[] = [];
    const seenIds = new Set<string>();

    // Add non-recurring blocks
    nonRecurringSnapshot.forEach((doc) => {
      if (!seenIds.has(doc.id)) {
        seenIds.add(doc.id);
        timeBlocks.push(convertDocToTimeBlock(doc.data(), doc.id));
      }
    });

    // Add recurring blocks
    recurringSnapshot.forEach((doc) => {
      if (!seenIds.has(doc.id)) {
        seenIds.add(doc.id);
        timeBlocks.push(convertDocToTimeBlock(doc.data(), doc.id));
      }
    });

    // Sort by start time
    timeBlocks.sort((a, b) => a.start.getTime() - b.start.getTime());

    return timeBlocks;
  } catch (error) {
    console.error("Error getting time blocks:", error);
    throw error;
  }
};

export const subscribeToUserTimeBlocks = (
  userId: string,
  filters: { startDate?: Date; endDate?: Date } | undefined,
  callback: (timeBlocks: TimeBlock[]) => void,
  onError?: (error: Error) => void
) => {
  const nonRecurringQuery = nonRecurringBlocksQuery(userId, filters);
  const recurringQuery = recurringBlocksQuery(userId);

  let nonRecurringBlocks: TimeBlock[] = [];
  let recurringBlocks: TimeBlock[] = [];

  const mergeAndCallback = () => {
    const seenIds = new Set<string>();
    const merged: TimeBlock[] = [];

    // Add non-recurring blocks
    for (const block of nonRecurringBlocks) {
      if (!seenIds.has(block.id)) {
        seenIds.add(block.id);
        merged.push(block);
      }
    }

    // Add recurring blocks
    for (const block of recurringBlocks) {
      if (!seenIds.has(block.id)) {
        seenIds.add(block.id);
        merged.push(block);
      }
    }

    // Sort by start time
    merged.sort((a, b) => a.start.getTime() - b.start.getTime());
    callback(merged);
  };

  // Subscribe to non-recurring blocks
  const unsubNonRecurring = onSnapshot(
    nonRecurringQuery,
    (querySnapshot) => {
      nonRecurringBlocks = [];
      querySnapshot.forEach((doc) => {
        nonRecurringBlocks.push(convertDocToTimeBlock(doc.data(), doc.id));
      });
      mergeAndCallback();
    },
    (error) => {
      console.error("Error in non-recurring blocks subscription:", error);
      onError?.(error);
    }
  );

  // Subscribe to recurring blocks
  const unsubRecurring = onSnapshot(
    recurringQuery,
    (querySnapshot) => {
      recurringBlocks = [];
      querySnapshot.forEach((doc) => {
        recurringBlocks.push(convertDocToTimeBlock(doc.data(), doc.id));
      });
      mergeAndCallback();
    },
    (error) => {
      console.error("Error in recurring blocks subscription:", error);
      onError?.(error);
    }
  );

  // Return a function that unsubscribes from both
  return () => {
    unsubNonRecurring();
    unsubRecurring();
  };
};

export const addTimeBlock = async (
  timeBlockData: Omit<TimeBlock, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = Timestamp.now();
    const timeBlockRef = doc(collection(db, "timeBlocks"));

    const blockData: DocumentData = {
      userId: timeBlockData.userId,
      title: timeBlockData.title,
      start: Timestamp.fromDate(timeBlockData.start),
      end: Timestamp.fromDate(timeBlockData.end),
      color: timeBlockData.color,
      createdAt: now,
      updatedAt: now,
    };

    // Add optional fields only if they have values
    if (timeBlockData.description) {
      blockData.description = timeBlockData.description;
    }
    if (timeBlockData.taskId) {
      blockData.taskId = timeBlockData.taskId;
    }
    // Always set isRecurring, defaulting to false
    if (timeBlockData.rrule) {
      blockData.rrule = timeBlockData.rrule;
      blockData.isRecurring = true;
    } else {
      blockData.isRecurring = timeBlockData.isRecurring ?? false;
    }
    if (timeBlockData.masterBlockId) {
      blockData.masterBlockId = timeBlockData.masterBlockId;
    }
    if (timeBlockData.originalStart) {
      blockData.originalStart = Timestamp.fromDate(timeBlockData.originalStart);
    }

    await setDoc(timeBlockRef, blockData);

    return timeBlockRef.id;
  } catch (error) {
    console.error("Error adding time block:", error);
    throw error;
  }
};

export const updateTimeBlock = async (
  timeBlockId: string,
  updates: Partial<Omit<TimeBlock, "id" | "userId" | "createdAt">>
): Promise<void> => {
  try {
    const docRef = doc(db, "timeBlocks", timeBlockId);
    const updateData: DocumentData = {
      updatedAt: Timestamp.now(),
    };

    // Handle each field explicitly to avoid undefined values
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.taskId !== undefined) updateData.taskId = updates.taskId;
    if (updates.rrule !== undefined) {
      updateData.rrule = updates.rrule;
      updateData.isRecurring = !!updates.rrule;
    }
    if (updates.isRecurring !== undefined)
      updateData.isRecurring = updates.isRecurring;
    if (updates.masterBlockId !== undefined)
      updateData.masterBlockId = updates.masterBlockId;

    if (updates.start) {
      updateData.start = Timestamp.fromDate(updates.start);
    }

    if (updates.end) {
      updateData.end = Timestamp.fromDate(updates.end);
    }

    if (updates.originalStart) {
      updateData.originalStart = Timestamp.fromDate(updates.originalStart);
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating time block:", error);
    throw error;
  }
};

export const removeTimeBlock = async (timeBlockId: string): Promise<void> => {
  try {
    const docRef = doc(db, "timeBlocks", timeBlockId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error removing time block:", error);
    throw error;
  }
};

export const moveTimeBlock = async (
  timeBlockId: string,
  newStart: Date,
  newEnd: Date
): Promise<void> => {
  try {
    const docRef = doc(db, "timeBlocks", timeBlockId);
    await updateDoc(docRef, {
      start: Timestamp.fromDate(newStart),
      end: Timestamp.fromDate(newEnd),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error moving time block:", error);
    throw error;
  }
};

export const batchAddTimeBlocks = async (
  timeBlocks: Omit<TimeBlock, "id" | "createdAt" | "updatedAt">[]
): Promise<string[]> => {
  try {
    const batch = writeBatch(db);
    const now = Timestamp.now();
    const ids: string[] = [];

    timeBlocks.forEach((timeBlock) => {
      const timeBlockRef = doc(collection(db, "timeBlocks"));
      ids.push(timeBlockRef.id);

      batch.set(timeBlockRef, {
        ...timeBlock,
        start: Timestamp.fromDate(timeBlock.start),
        end: Timestamp.fromDate(timeBlock.end),
        createdAt: now,
        updatedAt: now,
      });
    });

    await batch.commit();
    return ids;
  } catch (error) {
    console.error("Error batch adding time blocks:", error);
    throw error;
  }
};

export const batchDeleteTimeBlocks = async (
  timeBlockIds: string[]
): Promise<void> => {
  try {
    const batch = writeBatch(db);

    timeBlockIds.forEach((id) => {
      const docRef = doc(db, "timeBlocks", id);
      batch.delete(docRef);
    });

    await batch.commit();
  } catch (error) {
    console.error("Error batch deleting time blocks:", error);
    throw error;
  }
};
