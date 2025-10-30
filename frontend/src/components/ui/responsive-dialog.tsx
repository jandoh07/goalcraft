"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./button";
import DeleteAlertDialog from "./confirmation-dialog";
import { useState } from "react";
import { ConfirmDialogPresetType } from "@/types";

/**
 * A responsive dialog that uses a dialog(modal) on desktop and a drawer on mobile.
 */

interface ResponsiveDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  submitLabel?: string;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  onDelete?: () => void;
  confirmDialogPreset?: ConfirmDialogPresetType;
  hideSubmitButton?: boolean;
}

const ResponsiveDialog = ({
  open,
  setOpen,
  title,
  description,
  children,
  submitLabel,
  onSubmit,
  isSubmitting = false,
  onDelete,
  confirmDialogPreset,
  hideSubmitButton = false,
}: ResponsiveDialogProps) => {
  const isDesktop = !useIsMobile();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (isDesktop) {
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            className="sm:max-w-[550px] max-h-[90vh] flex flex-col"
            aria-describedby={description ? undefined : "dialog-content"}
          >
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description ? (
                <DialogDescription>{description}</DialogDescription>
              ) : (
                <DialogDescription className="sr-only">
                  {title}
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="overflow-y-auto px-1 flex-1 min-h-0 custom-scrollbar">
              {children}
            </div>
            <DialogFooter className={onDelete ? "grid grid-cols-4 gap-2" : ""}>
              <Footer
                hideSubmitButton={hideSubmitButton}
                onSubmit={onSubmit!}
                isSubmitting={isSubmitting}
                onDelete={onDelete}
                submitLabel={submitLabel!}
                setShowDeleteDialog={setShowDeleteDialog}
              />
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {onDelete && (
          <DeleteAlertDialog
            isOpen={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onConfirm={onDelete}
            onCancel={() => setShowDeleteDialog(false)}
            preset={confirmDialogPreset || "deleteTask"}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="sr-only">{title}</DrawerTitle>
            {description ? (
              <DrawerDescription>{description}</DrawerDescription>
            ) : (
              <DrawerDescription className="sr-only">{title}</DrawerDescription>
            )}
          </DrawerHeader>
          <div className="px-4 pt-2 mb-2 overflow-y-auto">{children}</div>
          <DrawerFooter
            className={`pt-2 ${onDelete ? "grid grid-cols-4" : ""} gap-2`}
          >
            <Footer
              hideSubmitButton={hideSubmitButton}
              onSubmit={onSubmit!}
              isSubmitting={isSubmitting}
              onDelete={onDelete}
              submitLabel={submitLabel!}
              setShowDeleteDialog={setShowDeleteDialog}
            />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      {onDelete && (
        <DeleteAlertDialog
          isOpen={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={onDelete}
          onCancel={() => setShowDeleteDialog(false)}
          preset={confirmDialogPreset || "deleteTask"}
        />
      )}
    </>
  );
};

const Footer = ({
  hideSubmitButton,
  onSubmit,
  isSubmitting,
  onDelete,
  submitLabel,
  setShowDeleteDialog,
}: {
  hideSubmitButton: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
  onDelete?: () => void;
  submitLabel: string;
  setShowDeleteDialog: (open: boolean) => void;
}) => {
  return (
    <>
      {!hideSubmitButton && onSubmit && (
        <Button
          type="submit"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={onDelete ? "col-span-3" : "w-full"}
        >
          {submitLabel}
        </Button>
      )}
      {onDelete && (
        <Button
          type="button"
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isSubmitting}
          className={hideSubmitButton || !onSubmit ? "col-span-4" : ""}
        >
          Delete
        </Button>
      )}
    </>
  );
};

export default ResponsiveDialog;
