"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/firebase";
import { useAuth } from "@/contexts/auth-context";
import ResponsiveDialog from "../ui/responsive-dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const editProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProfileDialog = ({ open, onOpenChange }: EditProfileDialogProps) => {
  const { user, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name || user?.displayName || "",
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    if (!user?.uid || !auth.currentUser) return;

    setIsSubmitting(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: data.name,
      });

      // Update Firestore user document
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        name: data.name,
      });

      await refreshUser();
      toast.success("Profile updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset({
        name: user?.name || user?.displayName || "",
      });
    }
    onOpenChange(isOpen);
  };

  return (
    <ResponsiveDialog
      open={open}
      setOpen={handleClose}
      title="Edit Profile"
      description="Update your profile information"
      submitLabel="Save Changes"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          <Input
            id="name"
            placeholder="Enter your name"
            {...register("name")}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user?.email || ""}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed
          </p>
        </div>
      </div>
    </ResponsiveDialog>
  );
};

export default EditProfileDialog;
