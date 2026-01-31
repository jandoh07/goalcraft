import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import ThemeSettings from "./theme-settings";
import TimezoneSettings from "./timezone-settings";

const AppPreferences = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>App Preferences</CardTitle>
        <CardDescription>Customize your app experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ThemeSettings />
        <Separator />
        <TimezoneSettings />
      </CardContent>
    </Card>
  );
};

export default AppPreferences;
