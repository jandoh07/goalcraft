"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
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
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Target, TrendingUp } from "lucide-react";

const ReviewDialog = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const reviewType = searchParams.get("review") as "daily" | "weekly" | null;
  const isOpen = reviewType === "daily" || reviewType === "weekly";

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("review");
    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    router.push(newUrl, { scroll: false });
  }, [router, searchParams]);

  const content = useMemo(() => {
    const isWeekly = reviewType === "weekly";

    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            {isWeekly ? (
              <Calendar className="h-8 w-8 text-primary" />
            ) : (
              <TrendingUp className="h-8 w-8 text-primary" />
            )}
          </div>
          <h2 className="text-2xl font-bold">
            {isWeekly ? "Weekly Review" : "Daily Review"}
          </h2>
          <p className="text-muted-foreground">
            {isWeekly
              ? "Reflect on your week and plan for the next one"
              : "Review your day and celebrate your progress"}
          </p>
        </div>

        {/* Stats Placeholder */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">--</p>
            <p className="text-sm text-muted-foreground">
              {isWeekly ? "Tasks This Week" : "Tasks Today"}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">--</p>
            <p className="text-sm text-muted-foreground">
              {isWeekly ? "Goals Progress" : "Goals Worked On"}
            </p>
          </div>
        </div>

        {/* Review Questions Placeholder */}
        <div className="space-y-4">
          <h3 className="font-semibold">
            {isWeekly ? "Weekly Reflection" : "Daily Reflection"}
          </h3>
          <div className="space-y-3">
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm font-medium mb-2">
                {isWeekly
                  ? "What were your biggest wins this week?"
                  : "What did you accomplish today?"}
              </p>
              <p className="text-sm text-muted-foreground italic">
                Coming soon: Add your reflections here
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm font-medium mb-2">
                {isWeekly
                  ? "What could you improve next week?"
                  : "What would you do differently?"}
              </p>
              <p className="text-sm text-muted-foreground italic">
                Coming soon: Add your reflections here
              </p>
            </div>
            {isWeekly && (
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm font-medium mb-2">
                  What are your top priorities for next week?
                </p>
                <p className="text-sm text-muted-foreground italic">
                  Coming soon: Add your reflections here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button onClick={handleClose}>
            {isWeekly ? "Complete Review" : "Done for Today"}
          </Button>
        </div>
      </div>
    );
  }, [reviewType, handleClose]);

  if (!isOpen) return null;

  const title = reviewType === "weekly" ? "Weekly Review" : "Daily Review";
  const description =
    reviewType === "weekly"
      ? "Take a moment to reflect on your week"
      : "Review your day and celebrate your wins";

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-8">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
