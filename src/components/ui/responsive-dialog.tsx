"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./button";

/**
 * A responsive dialog that uses a dialog(modal) on desktop and a drawer on mobile.
 */

interface ResponsiveDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  submitLabel: string;
  onSubmit: () => void;
}

const ResponsiveDialog = ({
  open,
  setOpen,
  title,
  children,
  submitLabel,
  onSubmit,
}: ResponsiveDialogProps) => {
  const isDesktop = !useIsMobile();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <div className="px-4 pt-2 mb-2 overflow-y-auto">{children}</div>
        <DrawerFooter className="pt-2">
          <Button type="submit" onClick={onSubmit}>
            {submitLabel}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ResponsiveDialog;
