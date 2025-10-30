import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PresetType } from "@/types";

interface ConfirmationDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title?: string;
  description?: string;
  preset?: PresetType;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

const presets = {
  deleteGoal: {
    title: "Are you sure you want to delete this goal?",
    description:
      "This action cannot be undone. This will permanently delete your goal.",
    confirmText: "Delete",
    variant: "destructive" as const,
  },
  deleteTask: {
    title: "Are you sure you want to delete this task?",
    description:
      "This action cannot be undone. This will permanently delete your task.",
    confirmText: "Delete",
    variant: "destructive" as const,
  },
};

const ConfirmationDialog = ({
  onConfirm,
  onCancel,
  isOpen,
  onOpenChange,
  title,
  description,
  preset = "deleteTask",
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmationDialogProps) => {
  const presetConfig = presets[preset];
  const finalTitle = title || presetConfig.title;
  const finalDescription = description || presetConfig.description;
  const finalConfirmText = confirmText || presetConfig.confirmText;
  const finalVariant = variant || presetConfig.variant;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{finalTitle}</AlertDialogTitle>
          <AlertDialogDescription>{finalDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              finalVariant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }
          >
            {finalConfirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;
