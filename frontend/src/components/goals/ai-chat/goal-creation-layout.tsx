"use client";

import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useGoalCreationStore } from "@/stores/goal-creation-store";
import { PanelRight } from "lucide-react";

interface GoalCreationLayoutProps {
  chatPanel: ReactNode;
  dataPanel: ReactNode;
}

/**
 * Two-column layout for goal creation
 * - Desktop: Side-by-side columns (70% chat, 30% data)
 * - Mobile: Chat full-width with sheet for data panel
 */
export function GoalCreationLayout({
  chatPanel,
  dataPanel,
}: GoalCreationLayoutProps) {
  const isMobile = useIsMobile();
  const { isDataPanelOpen, setDataPanelOpen } = useGoalCreationStore();

  if (isMobile) {
    return (
      <div className="flex flex-col h-full relative">
        {/* Chat panel - full width on mobile */}
        <div className="flex-1 flex flex-col min-h-0">{chatPanel}</div>

        {/* Floating button to open data panel */}
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-2 right-2 z-10 shadow-md"
          onClick={() => setDataPanelOpen(true)}
        >
          <PanelRight className="size-4" />
        </Button>

        {/* Data panel in sheet on mobile */}
        <Sheet open={isDataPanelOpen} onOpenChange={setDataPanelOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Goal Details</SheetTitle>
            </SheetHeader>
            {dataPanel}
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Desktop layout - two columns
  return (
    <div className="flex h-full">
      {/* Chat panel - 70% */}
      <div className="w-[70%] flex flex-col border-r min-h-0">{chatPanel}</div>

      {/* Data panel - 30% */}
      <div className="w-[30%] flex flex-col min-h-0 bg-muted/30">
        {dataPanel}
      </div>
    </div>
  );
}
