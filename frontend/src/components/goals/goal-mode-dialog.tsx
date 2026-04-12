"use client";

import { useEffect, useMemo, useRef } from "react";
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
import { DialogDescription } from "@radix-ui/react-dialog";
import { Goal } from "@/types/goal";
import GoalFlow from "./goal-flow";
import GoalView from "./goal-view";

interface GoalModeDialogProps {
  goals: Goal[];
}

const GoalModeDialog = ({ goals }: GoalModeDialogProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { mode, setMode, dialogType, setDialogType } = useGoal();
  const isMobile = useIsMobile();
  const isClosingRef = useRef(false);

  const selectedGoalId = searchParams.get("goalId");
  const returnMode = searchParams.get("returnMode");
  const activeGoal = useMemo(
    () => goals.find((goal) => goal.id === selectedGoalId) ?? null,
    [goals, selectedGoalId],
  );

  useEffect(() => {
    const rawMode = searchParams.get("mode");
    const rawType = searchParams.get("type");
    const nextDialogType: "goal" | "objective" =
      rawType === "goal" || rawType === "objective" ? rawType : "goal";
    const nextMode: "create" | "view" | "edit" | null =
      rawMode === "create" || rawMode === "view" || rawMode === "edit"
        ? rawMode
        : null;

    if (isClosingRef.current && nextMode !== null) {
      return;
    }

    if (nextMode === null) {
      isClosingRef.current = false;
    }

    if (dialogType !== nextDialogType) {
      setDialogType(nextDialogType);
    }

    if (mode !== nextMode) {
      setMode(nextMode);
    }
  }, [dialogType, mode, searchParams, setDialogType, setMode]);

  const closeDialogOnly = () => {
    isClosingRef.current = true;

    const params = new URLSearchParams(searchParams.toString());
    params.delete("mode");
    params.delete("type");
    params.delete("goalId");
    params.delete("objectiveId");
    params.delete("returnMode");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
    setMode(null);
    setDialogType("goal");
  };

  const handleCancelFromFlow = () => {
    if (returnMode === "view" && selectedGoalId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("mode", "view");
      params.set("type", "goal");
      params.set("goalId", selectedGoalId);
      params.delete("returnMode");

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      setMode("view");
      setDialogType("goal");
      return;
    }

    closeDialogOnly();
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      return;
    }

    closeDialogOnly();
  };

  const dialogTitle =
    dialogType === "objective"
      ? mode === "edit"
        ? "Edit objective"
        : "Create objective"
      : mode === "edit"
        ? "Edit goal"
        : mode === "view"
          ? "Goal details"
          : "Create goal";

  const dialogDescription =
    dialogType === "objective"
      ? "Objective dialog mode is active from URL params."
      : "Goal dialog mode is active from URL params.";

  const isGoalFlow =
    dialogType === "goal" && (mode === "create" || mode === "edit");

  const renderDialogBody = () => {
    if (isGoalFlow) {
      return (
        <GoalFlow
          isOpen={mode !== null}
          closeDialog={closeDialogOnly}
          onCancel={handleCancelFromFlow}
          mode={mode!}
          goalId={selectedGoalId}
          activeGoal={activeGoal}
        />
      );
    }

    if (dialogType === "goal" && mode === "view") {
      return <GoalView goal={activeGoal} goalId={selectedGoalId} />;
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
          {isGoalFlow && (
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
      <DialogContent className="min-w-3xl min-h-130 max-h-[90dvh] overflow-y-auto custom-scrollbar focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
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
