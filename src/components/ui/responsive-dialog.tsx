"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
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

/**
 * A responsive dialog that uses a dialog(modal) on desktop and a drawer on mobile.
 */

interface ResponsiveDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  submitLabel: string;
  onSubmit: () => void;
  triggerSubmit?: boolean;
}

const ResponsiveDialog = ({
  open,
  setOpen,
  title,
  description,
  children,
  submitLabel,
  onSubmit,
  triggerSubmit,
}: ResponsiveDialogProps) => {
  const isDesktop = !useIsMobile();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-[550px]"
          aria-describedby={description ? undefined : "dialog-content"}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : (
              <DialogDescription className="sr-only">{title}</DialogDescription>
            )}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
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
        <DrawerFooter className="pt-2">
          <Button type="submit" onClick={onSubmit} disabled={triggerSubmit}>
            {triggerSubmit ? (
              <div className="flex items-center justify-center gap-2 animate-pulse">
                {submitLabel.includes("Update")
                  ? "Updating..."
                  : submitLabel.includes("Add")
                  ? "Adding..."
                  : "Submitting..."}
              </div>
            ) : (
              submitLabel
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ResponsiveDialog;
