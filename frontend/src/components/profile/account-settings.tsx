import { ChevronRight, Lock, LogOut, User } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const AccountSettings = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-between h-auto py-3 px-4 hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="text-left">
              <div className="font-medium">Edit Profile</div>
              <div className="text-sm text-muted-foreground max-w-49 md:max-w-full text-ellipsis overflow-hidden">
                Update your name, email, and avatar
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-between h-auto py-3 px-4 hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-4 w-4 text-primary" />
            </div>
            <div className="text-left">
              <div className="font-medium">Change Password</div>
              <div className="text-sm text-muted-foreground max-w-49 md:max-w-full text-ellipsis overflow-hidden">
                Update your account password
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Button>

        <Separator className="my-2" />

        <Button
          variant="ghost"
          className="w-full justify-between h-auto py-3 px-4 hover:bg-destructive/10 text-destructive hover:text-destructive"
          onClick={handleSignOut}
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center">
              <LogOut className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="font-medium">Sign Out</div>
              <div className="text-sm opacity-80">Sign out of your account</div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
