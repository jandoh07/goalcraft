"use client";

import { useState } from "react";
import { Activity, ChevronRight, EllipsisVertical } from "lucide-react";
import GoalCard from "../goals/goal-card";

const ObjectiveCard = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const progress = 25;
  const progressValue = Math.min(100, Math.max(0, progress));

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="bg-sidebar/30 p-2 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse objective" : "Expand objective"}
            className="mr-1 rounded-sm transition-colors hover:bg-sidebar/60 cursor-pointer"
          >
            <ChevronRight
              size={20}
              className={`transition-transform ${isExpanded ? "rotate-90" : "rotate-0"}`}
            />
          </button>
          <p className="text-[0.95rem] font-semibold">
            Lorem ipsum dolor sit amet consectetur
          </p>
        </div>
        <div className="flex items-center">
          <div className="size-4 rounded-full bg-border overflow-hidden">
            <div
              className="h-full w-full rounded-full"
              style={{
                background: `conic-gradient(var(--primary) ${progressValue}%, transparent 0)`,
              }}
            ></div>
          </div>
          <p className="opacity-10 pl-1 -mt-1 cursor-default">|</p>
          <Activity size={15} className="cursor-pointer hover:text-primary" />
          <p className="opacity-10 pl-1 -mt-1 cursor-default">|</p>
          <EllipsisVertical
            size={15}
            className="cursor-pointer hover:text-primary"
          />
        </div>
      </div>
      {isExpanded && (
        <div className="pl-4 pt-2">
          <GoalCard />
        </div>
      )}
    </div>
  );
};

export default ObjectiveCard;
