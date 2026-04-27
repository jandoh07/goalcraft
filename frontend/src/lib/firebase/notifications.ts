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
  onSnapshot,
  writeBatch,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
import { Notification } from "@/types/notifications";

const userNotificationsQuery = (userId: string) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(30),
  );

  return q;
};

export const getUserNotifications = async (userId: string) => {
  try {
    const q = userNotificationsQuery(userId);

    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      notifications.push({
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Notification);
    });

    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    if (error instanceof Error && error.message.includes("index")) {
      console.error("You need to create a composite index in Firestore.");
      console.error(
        "The error message should contain a link to create the index.",
      );
    }
    throw error;
  }
};

export const subscribeToUserNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void,
) => {
  const q = userNotificationsQuery(userId);

  return onSnapshot(
    q,
    (querySnapshot) => {
      const notifications: Notification[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        notifications.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Notification);
      });
      callback(notifications);
    },
    (error) => {
      console.error("Error subscribing to notifications:", error);
    },
  );
};

export const getNotification = async (notificationId: string) => {
  const docRef = doc(db, "notifications", notificationId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  } as Notification;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const docRef = doc(db, "notifications", notificationId);
  await updateDoc(docRef, {
    isRead: true,
    updatedAt: Timestamp.now(),
  });
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const batch = writeBatch(db);
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("isRead", "==", false),
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((docSnap) => {
    batch.update(docSnap.ref, {
      read: true,
      updatedAt: Timestamp.now(),
    });
  });

  await batch.commit();
};

export const deleteNotification = async (notificationId: string) => {
  await deleteDoc(doc(db, "notifications", notificationId));
};
