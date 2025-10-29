"use client";

import MobileHeader from "@/components/layout/mobile/header";
import AppPreferences from "@/components/profile/app-preferences";
import Subscription from "@/components/profile/subscription";
import AccountSettings from "@/components/profile/account-settings";

const Profile = () => {
  // Format join date from Firestore createdAt
  const formatJoinDate = (date?: Date) => {
    if (!date) return "Recently";
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Update push notifications in Firestore
  // const handlePushNotificationsChange = async (checked: boolean) => {
  //   setPushNotifications(checked);

  //   if (authUser?.uid) {
  //     try {
  //       await updateDoc(doc(db, "users", authUser.uid), {
  //         "preferences.pushNotifications": checked,
  //       });
  //     } catch (error) {
  //       console.error("Error updating push notifications:", error);
  //     }
  //   }
  // };

  return (
    <div className="max-w-7xl h-full mx-auto p-3 pb-4">
      <MobileHeader title="Profile" />
      <div className="space-y-6 mt-6">
        <AppPreferences />
        <Subscription />
        <AccountSettings />
        <div className="w-full h-20 md:hidden"></div>
      </div>
    </div>
  );
};

export default Profile;
