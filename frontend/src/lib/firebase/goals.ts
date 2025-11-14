import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  DocumentData,
  onSnapshot,
  writeBatch,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";
import { Goal, Task } from "@/types";

const userGoalsQuery = (userId: string, status?: string) => {
  let q;

  if (status === "overdue") {
    q = query(
      collection(db, "goals"),
      where("userId", "==", userId),
      where("status", "==", "in-progress"),
      where("dueDate", "<", Timestamp.now()),
      orderBy("dueDate", "asc")
    );
  } else if (status === "in-progress" || status === "completed") {
    q = query(
      collection(db, "goals"),
      where("userId", "==", userId),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(
      collection(db, "goals"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
  }

  return q;
};

export const getUserGoals = async (userId: string, status?: string) => {
  try {
    const q = userGoalsQuery(userId, status);

    const querySnapshot = await getDocs(q);
    const goals: Goal[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      goals.push({
        id: docSnap.id,
        ...data,
        dueDate: data.dueDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Goal);
    });

    return goals;
  } catch (error) {
    console.error("Error fetching goals:", error);
    // Check if it's an index error
    if (error instanceof Error && error.message.includes("index")) {
      console.error("You need to create a composite index in Firestore.");
      console.error(
        "The error message should contain a link to create the index."
      );
    }
    throw error;
  }
};

export const subscribeToUserGoals = (
  userId: string,
  status: string | undefined,
  callback: (goals: Goal[]) => void
) => {
  const q = userGoalsQuery(userId, status);

  return onSnapshot(
    q,
    (querySnapshot) => {
      const goals: Goal[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        goals.push({
          id: docSnap.id,
          ...data,
          dueDate: data.dueDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Goal);
      });
      callback(goals);
    },
    (error) => {
      console.error("Error subscribing to goals:", error);
    }
  );
};

export const getGoal = async (goalId: string) => {
  const docRef = doc(db, "goals", goalId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    dueDate: data.dueDate?.toDate(),
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  } as Goal;
};

export const addGoal = async (
  userId: string,
  goalData: Omit<Goal, "id" | "createdAt" | "updatedAt" | "userId" | "status">,
  newCategory?: string,
  tasks?: Omit<Task, "id" | "createdAt" | "updatedAt" | "userId" | "goalId">[]
) => {
  const batch = writeBatch(db);
  const now = Timestamp.now();

  const goalRef = doc(collection(db, "goals"));
  batch.set(goalRef, {
    ...goalData,
    dueDate: goalData.dueDate ? Timestamp.fromDate(goalData.dueDate) : null,
    createdAt: now,
    updatedAt: now,
    userId,
    status: "in-progress",
  });

  if (newCategory) {
    const userRef = doc(db, "users", userId);
    batch.update(userRef, {
      customCategories: arrayUnion(newCategory),
    });
  }

  if (tasks && tasks.length > 0) {
    tasks.forEach((task) => {
      const taskRef = doc(collection(db, "tasks"));
      batch.set(taskRef, {
        ...task,
        dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
        createdAt: now,
        updatedAt: now,
        userId,
        goalId: goalRef.id,
        status: "pending",
      });
    });
  }

  await batch.commit();
  return goalRef.id;
};

export const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
  const docRef = doc(db, "goals", goalId);
  const updateData: DocumentData = {
    ...updates,
    updatedAt: Timestamp.now(),
  };
  if (updates.dueDate) {
    updateData.dueDate = Timestamp.fromDate(updates.dueDate);
  }
  await updateDoc(docRef, updateData);
};

export const deleteGoal = async (goalId: string) => {
  await deleteDoc(doc(db, "goals", goalId));
};
