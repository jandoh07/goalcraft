import { useState } from "react";
import { ChevronRight, Lock, LogOut, User } from "lucide-react";
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
      <div className="space-y-2">
        <div
          className="w-full flex justify-between items-center bg-card p-2 rounded-lg cursor-pointer hover:bg-card/50"
          onClick={() => setEditProfileOpen(true)}
        >
          <div className="flex items-center">
            <div className="size-10 flex items-center justify-center shrink-0">
              <User className="size-4 text-foreground" />
            </div>
            <div className="font-medium text-sm">Edit Profile</div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
        </div>

        <div
          className="w-full flex justify-between items-center bg-card p-2 rounded-lg cursor-pointer hover:bg-card/50"
          onClick={() => setChangePasswordOpen(true)}
        >
          <div className="flex items-center">
            <div className="size-10 flex items-center justify-center shrink-0">
              <Lock className="size-4 text-foreground" />
            </div>
            <div className="font-medium text-sm">Change Password</div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
        </div>

        <div
          className="w-full flex justify-between items-center bg-card p-2 rounded-lg cursor-pointer hover:bg-card/50"
          onClick={handleSignOut}
        >
          <div className="flex items-center">
            <div className="size-10 flex items-center justify-center shrink-0">
              <LogOut className="size-4 text-destructive" />
            </div>
            <div className="font-medium text-sm text-destructive">Sign Out</div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
        </div>
      </div>

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
