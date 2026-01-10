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

const userTimeBlocksQuery = (
  userId: string,
  filters?: { startDate?: Date; endDate?: Date }
) => {
  const timeBlocksCollection = collection(db, "timeBlocks");
  let q = query(
    timeBlocksCollection,
    where("userId", "==", userId),
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
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
};

export const fetchUserTimeBlocks = async (
  userId: string,
  filters?: { startDate?: Date; endDate?: Date }
): Promise<TimeBlock[]> => {
  try {
    const q = userTimeBlocksQuery(userId, filters);
    const querySnapshot = await getDocs(q);
    const timeBlocks: TimeBlock[] = [];

    querySnapshot.forEach((doc) => {
      timeBlocks.push(convertDocToTimeBlock(doc.data(), doc.id));
    });

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
  const q = userTimeBlocksQuery(userId, filters);

  return onSnapshot(
    q,
    (querySnapshot) => {
      const timeBlocks: TimeBlock[] = [];
      querySnapshot.forEach((doc) => {
        timeBlocks.push(convertDocToTimeBlock(doc.data(), doc.id));
      });
      callback(timeBlocks);
    },
    (error) => {
      console.error("Error in time blocks subscription:", error);
      onError?.(error);
    }
  );
};

export const addTimeBlock = async (
  timeBlockData: Omit<TimeBlock, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const now = Timestamp.now();
    const timeBlockRef = doc(collection(db, "timeBlocks"));

    await setDoc(timeBlockRef, {
      ...timeBlockData,
      start: Timestamp.fromDate(timeBlockData.start),
      end: Timestamp.fromDate(timeBlockData.end),
      createdAt: now,
      updatedAt: now,
    });

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
      ...updates,
      updatedAt: Timestamp.now(),
    };

    if (updates.start) {
      updateData.start = Timestamp.fromDate(updates.start);
    }

    if (updates.end) {
      updateData.end = Timestamp.fromDate(updates.end);
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
