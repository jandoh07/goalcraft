import { doc, DocumentData, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export const updateUserPreferences = async (
  userId: string,
  preferences: {
    theme?: "light" | "dark" | "system";
    pushNotifications?: boolean;
  }
) => {
  const docRef = doc(db, "users", userId);
  const updateData: DocumentData = {};

  if (preferences.theme !== undefined) {
    updateData.theme = preferences.theme;
  }
  if (preferences.pushNotifications !== undefined) {
    updateData.pushNotifications = preferences.pushNotifications;
  }

  await updateDoc(docRef, updateData);
};
