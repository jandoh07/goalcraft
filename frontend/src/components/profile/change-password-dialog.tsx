"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { useAuth } from "@/contexts/auth-context";
import ResponsiveDialog from "../ui/responsive-dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChangePasswordDialog = ({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if user signed in with Google (no password provider)
  const isGoogleUser = user?.providerData?.some(
    (provider) => provider.providerId === "google.com",
  );
  const hasPasswordProvider = user?.providerData?.some(
    (provider) => provider.providerId === "password",
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (!auth.currentUser || !user?.email) return;

    setIsSubmitting(true);
    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        user.email,
        data.currentPassword,
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, data.newPassword);

      toast.success("Password updated successfully");
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating password:", error);
      const errorCode = (error as { code?: string })?.code;

      if (
        errorCode === "auth/wrong-password" ||
        errorCode === "auth/invalid-credential"
      ) {
        toast.error("Current password is incorrect");
      } else if (errorCode === "auth/weak-password") {
        toast.error("New password is too weak");
      } else if (errorCode === "auth/requires-recent-login") {
        toast.error(
          "Please sign out and sign back in before changing your password",
        );
      } else {
        toast.error("Failed to update password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
    onOpenChange(isOpen);
  };

  // Show message for Google-only users
  if (isGoogleUser && !hasPasswordProvider) {
    return (
      <ResponsiveDialog
        open={open}
        setOpen={handleClose}
        title="Change Password"
        description="Update your account password"
        hideSubmitButton
      >
        <div className="py-4 text-center">
          <p className="text-muted-foreground">
            You signed in with Google. Password management is handled through
            your Google account.
          </p>
        </div>
      </ResponsiveDialog>
    );
  }

  return (
    <ResponsiveDialog
      open={open}
      setOpen={handleClose}
      title="Change Password"
      description="Update your account password"
      submitLabel="Update Password"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Enter current password"
              {...register("currentPassword")}
              disabled={isSubmitting}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {errors.currentPassword && (
            <p className="text-sm text-destructive">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter new password"
              {...register("newPassword")}
              disabled={isSubmitting}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {errors.newPassword && (
            <p className="text-sm text-destructive">
              {errors.newPassword.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters with uppercase, lowercase, and a
            number
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              {...register("confirmPassword")}
              disabled={isSubmitting}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>
    </ResponsiveDialog>
  );
};

export default ChangePasswordDialog;
