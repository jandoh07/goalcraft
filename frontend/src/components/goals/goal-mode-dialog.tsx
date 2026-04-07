"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useGoal } from "@/contexts/goal-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import CreateGoalFlow from "./create-goal-flow";
import { DialogDescription } from "@radix-ui/react-dialog";

const GoalModeDialog = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { mode, setMode, dialogType, setDialogType } = useGoal();
  const isMobile = useIsMobile();

  useEffect(() => {
    const rawMode = searchParams.get("mode");
    const rawType = searchParams.get("type");

    if (rawType === "goal" || rawType === "objective") {
      setDialogType(rawType);
    } else {
      setDialogType("goal");
    }

    if (rawMode === "create" || rawMode === "edit") {
      setMode(rawMode);
      return;
    }

    setMode(null);
  }, [searchParams, setDialogType, setMode]);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("mode");
    params.delete("type");
    params.delete("goalId");
    params.delete("objectiveId");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
    setMode(null);
    setDialogType("goal");
  };

  const dialogTitle =
    dialogType === "objective"
      ? mode === "edit"
        ? "Edit objective"
        : "Create objective"
      : mode === "edit"
        ? "Edit goal"
        : "Create goal";

  const dialogDescription =
    dialogType === "objective"
      ? "Objective dialog mode is active from URL params."
      : "Goal dialog mode is active from URL params.";

  const isCreateGoalFlow = dialogType === "goal" && mode === "create";

  const renderDialogBody = () => {
    if (isCreateGoalFlow) {
      return (
        <CreateGoalFlow
          isOpen={mode !== null}
          onSubmit={() => handleOpenChange(false)}
        />
      );
    }

    if (dialogType === "goal" && mode === "edit") {
      return (
        <p className="text-sm text-muted-foreground">
          Goal editing UI will go here.
        </p>
      );
    }

    if (dialogType === "objective") {
      return (
        <p className="text-sm text-muted-foreground">
          Objective modal UI will go here.
        </p>
      );
    }

    return null;
  };

  if (isMobile) {
    return (
      <Drawer
        direction="right"
        open={mode !== null}
        onOpenChange={handleOpenChange}
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
          {!isCreateGoalFlow && (
            <DrawerHeader>
              <DrawerTitle className="pr-10">{dialogTitle}</DrawerTitle>
              <DrawerDescription>{dialogDescription}</DrawerDescription>
            </DrawerHeader>
          )}
          <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 pt-4">
            {renderDialogBody()}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={mode !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="min-w-3xl min-h-130 max-h-[90dvh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="sr-only">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        {renderDialogBody()}
      </DialogContent>
    </Dialog>
  );
};

export default GoalModeDialog;
