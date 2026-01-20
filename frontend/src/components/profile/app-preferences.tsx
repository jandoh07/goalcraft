import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Bell,
  Moon,
  Sun,
  Smartphone,
  Monitor,
  Tablet,
  Trash2,
  Loader2,
} from "lucide-react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "../ui/button";
import { DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import {
  useUpdateUserPreferences,
  useGetFcmTokens,
  useSaveFcmToken,
  useDeleteFcmToken,
} from "@/hooks/use-user";
import { getMessaging, getToken } from "firebase/messaging";
import app from "@/lib/firebase/firebase";
import { toast } from "sonner";
import { FcmToken } from "@/types";

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

const AppPreferences = () => {
  const { user } = useAuth();
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const { setTheme, theme } = useTheme();
  const updateUserPreferences = useUpdateUserPreferences();
  const { data: fcmTokens, isLoading: isLoadingTokens } = useGetFcmTokens(
    user?.uid || "",
  );
  const saveFcmToken = useSaveFcmToken();
  const deleteFcmToken = useDeleteFcmToken();

  const pushNotifications = user?.pushNotifications || false;

  const handleThemeChange = (selectedTheme: "light" | "dark" | "system") => {
    if (user?.uid && selectedTheme !== theme) {
      // Update Firestore first, then the real-time listener will update the theme
      updateUserPreferences.mutate({
        userId: user.uid,
        preferences: { theme: selectedTheme },
      });
    } else if (!user?.uid) {
      // If no user, just update locally
      setTheme(selectedTheme);
    }
  };

  const requestNotificationPermission = async (): Promise<string | null> => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Notification permission denied");
        return null;
      }

      // Register the Firebase messaging service worker with a specific scope
      // to avoid conflicts with the main PWA service worker
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        { scope: "/firebase-cloud-messaging-push-scope" },
      );

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;

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
          // Save the FCM token
          await saveFcmToken.mutateAsync({ userId: user.uid, token });
          // Enable push notifications
          await updateUserPreferences.mutateAsync({
            userId: user.uid,
            preferences: { pushNotifications: true },
          });
          toast.success("Notifications enabled for this device");
        }
      } finally {
        setIsRequestingPermission(false);
      }
    } else {
      // Disable push notifications
      await updateUserPreferences.mutateAsync({
        userId: user.uid,
        preferences: { pushNotifications: false },
      });
      toast.success("Notifications disabled");
    }
  };

  const handleDeleteToken = async (tokenId: string) => {
    if (!user?.uid) return;

    try {
      await deleteFcmToken.mutateAsync({ userId: user.uid, tokenId });
      toast.success("Device removed");
    } catch {
      toast.error("Failed to remove device");
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>App Preferences</CardTitle>
        <CardDescription>Customize your app experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Moon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Label htmlFor="theme" className="text-base font-medium">
                Theme
              </Label>
              <p className="text-sm text-muted-foreground">
                Select light, dark, or system theme
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleThemeChange("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
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
                  Get notified about task reminders and updates
                </p>
              </div>
            </div>
            <Switch
              id="push-notifications"
              checked={pushNotifications}
              onCheckedChange={handlePushNotificationsChange}
              disabled={
                isRequestingPermission || updateUserPreferences.isPending
              }
              className="cursor-pointer"
            />
          </div>

          {/* Show registered devices when notifications are enabled */}
          {pushNotifications && (
            <div className="ml-13 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Registered Devices
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!user?.uid) return;
                    setIsRequestingPermission(true);
                    try {
                      const token = await requestNotificationPermission();
                      if (token) {
                        await saveFcmToken.mutateAsync({
                          userId: user.uid,
                          token,
                        });
                        toast.success("Device added successfully");
                      }
                    } finally {
                      setIsRequestingPermission(false);
                    }
                  }}
                  disabled={isRequestingPermission || saveFcmToken.isPending}
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
                            {token.deviceType} -{" "}
                            {getBrowserName(token.userAgent)}
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
                        disabled={deleteFcmToken.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No devices registered yet. Enable notifications on your
                  devices to receive updates.
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppPreferences;
