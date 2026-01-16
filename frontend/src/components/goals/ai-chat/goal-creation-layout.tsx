"use client";

import { ReactNode, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface GoalCreationLayoutProps {
  chatPanel: ReactNode;
  dataPanel: ReactNode;
}

/**
 * Two-column layout for goal creation
 * - Desktop: Side-by-side columns (70% chat, 30% data)
 * - Mobile: Swipeable views between chat and data panel
 */
export function GoalCreationLayout({
  chatPanel,
  dataPanel,
}: GoalCreationLayoutProps) {
  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = useState<"chat" | "data">("chat");
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  if (isMobile) {
    return (
      <div className="flex flex-col h-full overflow-hidden min-h-[75vh] md:min-h-full">
        {/* Page indicators */}
        <div className="flex justify-center items-center gap-2 mb-3">
          <button
            className={`size-1.5 rounded transition-colors ${
              mobileView === "chat" ? "bg-white" : "bg-white/20"
            }`}
            onClick={() => setMobileView("chat")}
            aria-label="Switch to chat view"
          />
          <button
            className={`size-1.5 rounded transition-colors ${
              mobileView === "data" ? "bg-white" : "bg-white/20"
            }`}
            onClick={() => setMobileView("data")}
            aria-label="Switch to data panel view"
          />
        </div>

        {/* Swipeable content container */}
        <div className="flex-1 overflow-hidden relative">
          <motion.div
            className="flex h-full"
            onTouchStart={(e) => {
              setTouchStart(e.targetTouches[0].clientX);
              setTouchEnd(e.targetTouches[0].clientX);
            }}
            onTouchMove={(e) => {
              setTouchEnd(e.targetTouches[0].clientX);
            }}
            onTouchEnd={() => {
              const swipeDistance = touchStart - touchEnd;
              const minSwipeDistance = 75; // Minimum swipe distance in pixels

              if (swipeDistance > minSwipeDistance) {
                // Swiped left - go to data panel
                setMobileView("data");
              } else if (swipeDistance < -minSwipeDistance) {
                // Swiped right - go to chat panel
                setMobileView("chat");
              }
            }}
            animate={{ x: mobileView === "chat" ? "0%" : "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Chat panel - 100% width */}
            <div className="shrink-0 w-full h-full flex flex-col">
              {chatPanel}
            </div>

            {/* Data panel - 100% width */}
            <div className="shrink-0 w-full h-full flex flex-col">
              {dataPanel}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Desktop layout - two columns
  return (
    <div className="grid grid-cols-10 h-[75vh] overflow-hidden">
      {/* Chat panel - 70% */}
      <div className="col-span-6 flex flex-col border-r overflow-y-auto">
        {chatPanel}
      </div>

      {/* Data panel - 30% - fixed, no scroll */}
      <div className="col-span-4 bg-muted/30 overflow-hidden">{dataPanel}</div>
    </div>
  );
}
