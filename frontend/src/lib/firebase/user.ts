import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { FcmToken } from "@/types";

export const updateUserPreferences = async (
  userId: string,
  preferences: {
    theme?: "light" | "dark" | "system";
    pushNotifications?: boolean;
    notificationTime?: number;
    timezone?: string;
  },
) => {
  const docRef = doc(db, "users", userId);
  const updateData: DocumentData = {};

  if (preferences.theme !== undefined) {
    updateData.theme = preferences.theme;
  }
  if (preferences.pushNotifications !== undefined) {
    updateData.pushNotifications = preferences.pushNotifications;
  }
  if (preferences.notificationTime !== undefined) {
    updateData.notificationTime = preferences.notificationTime;
  }
  if (preferences.timezone !== undefined) {
    updateData.timezone = preferences.timezone;
  }

  await updateDoc(docRef, updateData);
};

const getDeviceType = (): "desktop" | "mobile" | "tablet" => {
  if (typeof navigator === "undefined") return "desktop";

  const userAgent = navigator.userAgent.toLowerCase();

  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return "tablet";
  }
  if (
    /mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(userAgent)
  ) {
    return "mobile";
  }
  return "desktop";
};

export const saveFcmToken = async (
  userId: string,
  token: string,
): Promise<void> => {
  const fcmTokensRef = collection(db, "users", userId, "fcmTokens");

  const existingTokenQuery = query(fcmTokensRef, where("token", "==", token));
  const existingTokens = await getDocs(existingTokenQuery);

  if (!existingTokens.empty) {
    const existingDoc = existingTokens.docs[0];
    await updateDoc(existingDoc.ref, {
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      updatedAt: new Date(),
    });
    return;
  }

  const tokenDocRef = doc(fcmTokensRef);
  await setDoc(tokenDocRef, {
    token,
    deviceType: getDeviceType(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    createdAt: new Date(),
  });
};

export const getFcmTokens = async (userId: string): Promise<FcmToken[]> => {
  const fcmTokensRef = collection(db, "users", userId, "fcmTokens");
  const snapshot = await getDocs(fcmTokensRef);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      token: data.token,
      deviceType: data.deviceType,
      userAgent: data.userAgent,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  });
};

export const deleteFcmToken = async (
  userId: string,
  tokenId: string,
): Promise<void> => {
  const tokenDocRef = doc(db, "users", userId, "fcmTokens", tokenId);
  await deleteDoc(tokenDocRef);
};

export const deleteAllFcmTokens = async (userId: string): Promise<void> => {
  const fcmTokensRef = collection(db, "users", userId, "fcmTokens");
  const snapshot = await getDocs(fcmTokensRef);

  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

// Create new token document
