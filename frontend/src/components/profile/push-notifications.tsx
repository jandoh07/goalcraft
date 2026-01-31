import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import NotificationSettings from "./notification-settings";

const PushNotifications = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Push Notifications</CardTitle>
        <CardDescription>
          Manage your notification preferences and devices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NotificationSettings />
      </CardContent>
    </Card>
  );
};

export default PushNotifications;
