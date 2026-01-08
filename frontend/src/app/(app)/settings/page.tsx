"use client";

import MobileHeader from "@/components/layout/mobile/header";
import AppPreferences from "@/components/profile/app-preferences";
import Subscription from "@/components/profile/subscription";
import AccountSettings from "@/components/profile/account-settings";

const Profile = () => {
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
