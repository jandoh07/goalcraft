import {
  Bell,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  Trash2,
  Loader2,
  MonitorSmartphone,
} from "lucide-react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useUpdateUserPreferences } from "@/hooks/use-user";
import { getMessaging, getToken } from "firebase/messaging";
import app from "@/lib/firebase/firebase";
import { toast } from "sonner";
import { FcmToken } from "@/types/user";
import { Separator } from "../ui/separator";
import useQuery from "@/hooks/use-query";
import {
  deleteFcmToken,
  getFcmTokens,
  saveFcmToken,
} from "@/lib/firebase/user";

const DeviceIcon = ({ deviceType }: { deviceType: FcmToken["deviceType"] }) => {
  switch (deviceType) {
    case "mobile":
      return <Smartphone className="h-4 w-4" />;
    case "tablet":
      return <Tablet className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
};

const getBrowserName = (userAgent: string): string => {
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg"))
    return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
    return "Safari";
  if (userAgent.includes("Edg")) return "Edge";
  if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera";
  return "Unknown Browser";
};

const formatHour = (hour: number): string => {
  if (hour === 0) return "12:00 AM";
  if (hour === 12) return "12:00 PM";
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const DEFAULT_NOTIFICATION_HOUR = 20; // 8 PM

const NotificationSettings = () => {
  const { user } = useAuth();
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const updateUserPreferences = useUpdateUserPreferences();
  const { data: fcmTokens, isLoading: isLoadingTokens } = useQuery(() =>
    getFcmTokens(user?.uid || ""),
  );

  const pushNotifications = user?.pushNotifications || false;
  const notificationTime = user?.notificationTime ?? DEFAULT_NOTIFICATION_HOUR;

  const requestNotificationPermission = async (): Promise<string | null> => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Notification permission denied");
        return null;
      }

      // Wait for the main service worker to be ready
      const registration = await navigator.serviceWorker.ready;

      const messaging = getMessaging(app);
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      return token;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to enable notifications: ${errorMessage}`);
      return null;
    }
  };

  const handlePushNotificationsChange = async (enabled: boolean) => {
    if (!user?.uid) return;

    if (enabled) {
      setIsRequestingPermission(true);
      try {
        const token = await requestNotificationPermission();
        if (token) {
          await saveFcmToken(user.uid, token);
          await updateUserPreferences.mutate({ pushNotifications: true });
          toast.success("Notifications enabled for this device");
        }
      } finally {
        setIsRequestingPermission(false);
      }
    } else {
      await updateUserPreferences.mutate({ pushNotifications: false });
      toast.success("Notifications disabled");
    }
  };

  const handleNotificationTimeChange = async (value: string) => {
    if (!user?.uid) return;

    const hour = parseInt(value, 10);
    await updateUserPreferences.mutate({ notificationTime: hour });
    toast.success(`Notification time updated to ${formatHour(hour)}`);
  };

  const handleAddDevice = async () => {
    if (!user?.uid) return;
    setIsRequestingPermission(true);
    try {
      const token = await requestNotificationPermission();
      if (token) {
        await saveFcmToken(user.uid, token);
        toast.success("Device added successfully");
      }
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleDeleteToken = async (tokenId: string) => {
    if (!user?.uid) return;

    try {
      await deleteFcmToken(user.uid, tokenId);
      toast.success("Device removed");
    } catch {
      toast.error("Failed to remove device");
    }
  };

  // Generate hour options for the time picker
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-4">
      {/* Push Notifications Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <Label
              htmlFor="push-notifications"
              className="text-base font-medium"
            >
              Push Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Get notified about daily and weekly reviews
            </p>
          </div>
        </div>
        <Switch
          id="push-notifications"
          checked={pushNotifications}
          onCheckedChange={handlePushNotificationsChange}
          disabled={isRequestingPermission || updateUserPreferences.loading}
          className="cursor-pointer"
        />
      </div>

      {/* Notification Time Picker - Only show when notifications are enabled */}
      {pushNotifications && (
        <>
          <Separator />
          <div className="md:flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label
                  htmlFor="notification-time"
                  className="text-base font-medium"
                >
                  Notification Time
                </Label>
                <p className="text-sm text-muted-foreground">
                  When to receive daily review reminders
                </p>
              </div>
            </div>
            <Select
              value={notificationTime.toString()}
              onValueChange={handleNotificationTimeChange}
              disabled={updateUserPreferences.loading}
            >
              <SelectTrigger className="w-full md:w-32 mt-3 md:mt-0">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {hourOptions.map((hour) => (
                  <SelectItem key={hour} value={hour.toString()}>
                    {formatHour(hour)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Registered Devices */}
          <Separator />
          <div className="space-y-3">
            <div className="md:flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MonitorSmartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-base font-medium">Registered Devices</p>
                  <p className="text-sm text-muted-foreground">
                    Manage your devices for push notifications
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddDevice}
                disabled={isRequestingPermission}
                className="mt-3 md:mt-0 w-full md:w-32"
              >
                {isRequestingPermission ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Add Device
              </Button>
            </div>
            {isLoadingTokens ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading devices...
              </div>
            ) : fcmTokens && fcmTokens.length > 0 ? (
              <div className="space-y-2">
                {fcmTokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <DeviceIcon deviceType={token.deviceType} />
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {token.deviceType} - {getBrowserName(token.userAgent)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Added {formatDate(token.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteToken(token.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No devices registered yet. Enable notifications on your devices
                to receive updates.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationSettings;
