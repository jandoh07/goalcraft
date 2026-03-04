"use client";

import MobileHeader from "@/components/layout/mobile/header";
import AppPreferences from "@/components/profile/app-preferences";
import PushNotifications from "@/components/profile/push-notifications";
import Subscription from "@/components/profile/subscription";
import AccountSettings from "@/components/profile/account-settings";
import { useAuth } from "@/contexts/auth-context";
import { Spinner } from "@/components/ui/spinner";

const Profile = () => {
  const { user, loading } = useAuth();
  const isLoading = loading || !user || !user.timezone;

  return (
    <div className="max-w-7xl h-full mx-auto p-3 pb-4">
      <MobileHeader title="Profile" />
      {isLoading ? (
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <Spinner className="size-8 text-primary" />
        </div>
      ) : (
        <div className="space-y-6 mt-6">
          <AppPreferences />
          <PushNotifications />
          <Subscription />
          <AccountSettings />
          <div className="w-full h-20 md:hidden"></div>
        </div>
      )}
    </div>
  );
};

export default Profile;
