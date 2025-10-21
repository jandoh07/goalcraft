import { db } from "@/lib/firebase/firebase";
import { Task } from "@/types";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
} from "firebase/firestore";

/**
 * Hook for managing Tasks in Firestore
 * Supports offline persistence - data is cached locally and synced when online
 */
const useTasks = () => {
  const getUserTasks = async (
    userId: string,
    filters?: { status?: string; goalId?: string }
  ) => {
    try {
      let q = query(
        collection(db, "tasks"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      // Add status filter if provided
      if (filters?.status) {
        q = query(
          collection(db, "tasks"),
          where("userId", "==", userId),
          where("status", "==", filters.status),
          orderBy("createdAt", "desc")
        );
      }

      // Add goalId filter if provided
      if (filters?.goalId) {
        q = query(
          collection(db, "tasks"),
          where("userId", "==", userId),
          where("goalId", "==", filters.goalId),
          orderBy("createdAt", "desc")
        );
      }

      const querySnapshot = await getDocs(q);
      const tasks: Task[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          dueDate: data.dueDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Task);
      });

      return tasks;
    } catch (error) {
      console.error("Error getting tasks:", error);
      throw error;
    }
  };

  /**
   * Get a single task by ID
   */
  const getTask = async (taskId: string) => {
    try {
      const docRef = doc(db, "tasks", taskId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          dueDate: data.dueDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Task;
      }

      return null;
    } catch (error) {
      console.error("Error getting task:", error);
      throw error;
    }
  };

  /**
   * Create a new task
   * Works offline - changes are queued and synced when online
   */
  const createTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, "tasks"), {
        ...taskData,
        dueDate: taskData.dueDate ? Timestamp.fromDate(taskData.dueDate) : null,
        createdAt: now,
        updatedAt: now,
      });

      return docRef.id;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  };

  /**
   * Update an existing task
   * Works offline - changes are queued and synced when online
   */
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const docRef = doc(db, "tasks", taskId);
      const updateData: DocumentData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Convert Date to Timestamp if dueDate is being updated
      if (updates.dueDate) {
        updateData.dueDate = Timestamp.fromDate(updates.dueDate);
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  };

  /**
   * Delete a task
   * Works offline - changes are queued and synced when online
   */
  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  };

  /**
   * Toggle task completion status
   * Works offline - changes are queued and synced when online
   */
  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    await updateTask(taskId, { status: newStatus as "pending" | "completed" });
  };

  return {
    getUserTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
  };
};

export default useTasks;
