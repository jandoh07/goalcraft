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

interface DeleteAlertDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title?: string;
  description?: string;
  tag?: "goal" | "task";
}

const dialogContent = {
  goal: {
    title: "Are you sure you want to delete this goal?",
    description:
      "This action cannot be undone. This will permanently delete your goal.",
  },
  task: {
    title: "Are you sure you want to delete this task?",
    description:
      "This action cannot be undone. This will permanently delete your task.",
  },
};

const DeleteAlertDialog = ({
  onConfirm,
  onCancel,
  isOpen,
  setIsOpen,
  title,
  description,
  tag = "goal",
}: DeleteAlertDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title || dialogContent[tag]?.title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description || dialogContent[tag]?.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAlertDialog;
