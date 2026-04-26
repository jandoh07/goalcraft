"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pause, X } from "lucide-react";
import type { InProgressNonNegotiableWithTasks } from "@/types/goal";
import { useAuth } from "@/contexts/auth-context";
import useMutation from "@/hooks/use-mutation";
import {
  deleteNonNegotiable,
  updateNonNegotiable,
} from "@/lib/firebase/non-negotiable";
import { NonNegotiableFrequencyPicker } from "@/components/non-negotiables/non-negotiable-frequency-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";

interface NonNegotiableModeDialogProps {
  items: InProgressNonNegotiableWithTasks[];
}

const areSameFrequencyTags = (a: string[], b: string[]) => {
  if (a.length !== b.length) {
    return false;
  }

  const bSet = new Set(b);
  return a.every((entry) => bSet.has(entry));
};

export function NonNegotiableModeDialog({
  items,
}: NonNegotiableModeDialogProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const rawMode = searchParams.get("mode");
  const rawType = searchParams.get("type");
  const selectedNonNegotiableId = searchParams.get("nonNegotiableId");

  const mode: "view" | "edit" | null =
    rawType === "non-negotiable" && (rawMode === "view" || rawMode === "edit")
      ? rawMode
      : null;

  const selectedItem = useMemo(
    () =>
      items.find((item) => item.nonNegotiable.id === selectedNonNegotiableId) ??
      null,
    [items, selectedNonNegotiableId],
  );

  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!selectedItem) {
      setTitle("");
      // setFrequency(buildQuickFrequencyTags("weekly"));
      return;
    }

    setTitle(selectedItem.nonNegotiable.title || "");
    setFrequency(selectedItem.nonNegotiable.frequency);
  }, [selectedItem]);

  const closeDialogOnly = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("mode");
    params.delete("type");
    params.delete("nonNegotiableId");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const setModeInUrl = (nextMode: "view" | "edit") => {
    if (!selectedItem) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", nextMode);
    params.set("type", "non-negotiable");
    params.set("nonNegotiableId", selectedItem.nonNegotiable.id);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const updateMutation = useMutation(
    async (payload: { title: string; frequency: string[] }) => {
      if (!user?.uid || !selectedItem) {
        throw new Error("You must be signed in to update a non-negotiable.");
      }

      await updateNonNegotiable(
        user.uid,
        selectedItem.goalId,
        selectedItem.nonNegotiable.id,
        {
          title: payload.title,
          frequency: payload.frequency,
        },
      );
    },
    {
      onSuccess: () => {
        setModeInUrl("view");
      },
      onError: "Failed to update non-negotiable.",
    },
  );

  const deleteMutation = useMutation(
    async () => {
      if (!user?.uid || !selectedItem) {
        throw new Error("You must be signed in to delete a non-negotiable.");
      }

      await deleteNonNegotiable(
        user.uid,
        selectedItem.goalId,
        selectedItem.nonNegotiable.id,
      );
    },
    {
      onSuccess: () => {
        closeDialogOnly();
      },
      onError: "Failed to delete non-negotiable.",
    },
  );

  const pauseMutation = useMutation(
    async () => {
      if (!user?.uid || !selectedItem) {
        throw new Error("You must be signed in to update a non-negotiable.");
      }

      const nextStatus: "paused" | "in-progress" =
        selectedItem.nonNegotiable.status === "paused"
          ? "in-progress"
          : "paused";

      await updateNonNegotiable(
        user.uid,
        selectedItem.goalId,
        selectedItem.nonNegotiable.id,
        {
          status: nextStatus,
        },
      );
    },
    {
      onSuccess: () => {
        closeDialogOnly();
      },
      onError: "Failed to update non-negotiable status.",
    },
  );

  const isOpen = mode !== null && selectedNonNegotiableId !== null;
  const isBusy =
    updateMutation.loading || deleteMutation.loading || pauseMutation.loading;

  const normalizedCurrentTitle = title.trim();
  const normalizedOriginalTitle =
    selectedItem?.nonNegotiable.title.trim() ?? "";
  const hasFrequencyChanged = selectedItem !== null;
  // && !areSameFrequencyTags(frequency, selectedItem.nonNegotiable.frequency);
  const hasTitleChanged =
    selectedItem !== null && normalizedCurrentTitle !== normalizedOriginalTitle;

  const hasEditChanges = hasTitleChanged || hasFrequencyChanged;

  const handleSave = async () => {
    if (!normalizedCurrentTitle || !hasEditChanges) {
      return;
    }

    // await updateMutation.mutate({
    //   title: normalizedCurrentTitle,
    //   frequency,
    // });
  };

  const dialogTitle =
    mode === "edit" ? "Edit non-negotiable" : "Non-negotiable details";

  const dialogDescription =
    mode === "edit"
      ? "Update your non-negotiable details."
      : "Review this non-negotiable and decide what to do next.";

  const renderBody = () => {
    if (!selectedItem) {
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This non-negotiable is no longer available.
          </p>
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={closeDialogOnly}>
              Close
            </Button>
          </div>
        </div>
      );
    }

    if (mode === "edit") {
      return (
        <div className="relative flex flex-col h-full">
          <div className="space-y-4 flex-1 pt-10 md:pt-0">
            <div className="space-y-2">
              <p className="text-sm font-medium">Title</p>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Non-negotiable title"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Frequency</p>
              <NonNegotiableFrequencyPicker
                value={frequency}
                onChange={setFrequency}
              />
            </div>
          </div>

          <div className="absolute right-0 bottom-0 bg-background w-full">
            <Separator />
            <div className="flex flex-wrap justify-between md:justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModeInUrl("view")}
                disabled={isBusy}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={
                  isBusy ||
                  normalizedCurrentTitle.length === 0 ||
                  !hasEditChanges
                }
              >
                {updateMutation.loading ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
          <div className="w-full h-16"></div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full relative">
        <div className="flex-1 pt-10 md:pt-0 space-y-4">
          <div className="space-y-2">
            <p
              className={cn(
                "text-lg font-semibold",
                selectedItem.nonNegotiable.status === "end" && "line-through",
              )}
            >
              {selectedItem.nonNegotiable.title || "Untitled non-negotiable"}
            </p>
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="rounded-lg">
                {/* {formatFrequencyTags(selectedItem.nonNegotiable.frequency)} */}
              </Badge>
              {selectedItem.nonNegotiable.status !== "end" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => pauseMutation.mutate()}
                  disabled={isBusy}
                >
                  {selectedItem.nonNegotiable.status === "paused"
                    ? "Resume"
                    : "Pause"}
                  <Pause />
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Tasks</p>
            {selectedItem.tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active tasks yet.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedItem.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2"
                  >
                    <p className="text-sm">{task.title || "Untitled task"}</p>
                    <Badge variant="outline">{task.duration} min</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="absolute right-0 bottom-0 bg-background w-full">
          <Separator />
          <div className="flex flex-wrap justify-between md:justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModeInUrl("edit")}
              disabled={isBusy}
              className="w-25"
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isBusy}
              className="w-25"
            >
              {deleteMutation.loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <>
        <Drawer
          open={isOpen}
          direction="right"
          onOpenChange={(open) => !open && closeDialogOnly()}
        >
          <DrawerContent className="min-w-screen h-svh max-h-svh">
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close dialog"
                className="absolute right-3 top-2 z-10"
              >
                <X className="size-5" />
              </Button>
            </DrawerClose>
            <DrawerHeader className="sr-only">
              <DrawerTitle className="pr-10">{dialogTitle}</DrawerTitle>
              <DrawerDescription>{dialogDescription}</DrawerDescription>
            </DrawerHeader>
            <div className="custom-scrollbar flex-1 overflow-y-auto px-4 pb-4">
              {renderBody()}
            </div>
          </DrawerContent>
        </Drawer>

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this non-negotiable?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this non-negotiable and its linked
                tasks.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteMutation.loading}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteMutation.loading}
                onClick={async (event) => {
                  event.preventDefault();
                  await deleteMutation.mutate();
                }}
              >
                {deleteMutation.loading ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialogOnly()}>
        <DialogContent className="min-w-2xl min-h-100 max-h-[90dvh] overflow-y-auto custom-scrollbar">
          <DialogHeader className="sr-only">
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          {renderBody()}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this non-negotiable?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this non-negotiable and its linked
              tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.loading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.loading}
              onClick={async (event) => {
                event.preventDefault();
                await deleteMutation.mutate();
              }}
            >
              {deleteMutation.loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
