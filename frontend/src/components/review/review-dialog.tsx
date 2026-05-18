import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const ReviewDialog = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer
        direction="right"
        // open={mode !== null}
        // onOpenChange={handleOpenChange}
      >
        <DrawerContent className="min-w-screen h-svh max-h-svh">
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close dialog"
              className="absolute top-1.5 right-3 z-10"
            >
              <X className="size-5" />
            </Button>
          </DrawerClose>
          <DrawerHeader>
            <DrawerTitle className="pr-10">Lorem, ipsum dolor.</DrawerTitle>
            <DrawerDescription>Lorem ipsum dolor sit amet.</DrawerDescription>
          </DrawerHeader>
          <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 pt-4">
            body
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog
    // open={mode !== null} onOpenChange={handleOpenChange}
    >
      <DialogContent className="min-w-3xl min-h-130 max-h-[90dvh] overflow-y-auto custom-scrollbar focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Lorem, ipsum dolor.</DialogTitle>
          <DialogDescription>Lorem ipsum dolor sit.</DialogDescription>
        </DialogHeader>
        <div>body</div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
