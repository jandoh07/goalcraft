import { useState } from "react";
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
import EditProfileDialog from "./edit-profile-dialog";
import ChangePasswordDialog from "./change-password-dialog";

const AccountSettings = () => {
  const { logout } = useAuth();
  const router = useRouter();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-between h-auto py-3 px-4 hover:bg-accent"
            onClick={() => setEditProfileOpen(true)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left min-w-0">
                <div className="font-medium">Edit Profile</div>
                <div className="text-sm text-muted-foreground truncate">
                  Update your name and avatar
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-between h-auto py-3 px-4 hover:bg-accent"
            onClick={() => setChangePasswordOpen(true)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left min-w-0">
                <div className="font-medium">Change Password</div>
                <div className="text-sm text-muted-foreground truncate">
                  Update your account password
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
          </Button>

          <Separator className="my-2" />

          <Button
            variant="ghost"
            className="w-full justify-between h-auto py-3 px-4 hover:bg-destructive/10 text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <LogOut className="h-4 w-4" />
              </div>
              <div className="text-left min-w-0">
                <div className="font-medium">Sign Out</div>
                <div className="text-sm opacity-80 truncate">
                  Sign out of your account
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 ml-2" />
          </Button>
        </CardContent>
      </Card>

      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
      />
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </>
  );
};

export default AccountSettings;
