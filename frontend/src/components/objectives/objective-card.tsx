"use client";

import { useState } from "react";
import { Activity, ChevronRight, EllipsisVertical } from "lucide-react";
import GoalCard from "../goals/goal-card";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ObjectiveCard = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(true);
  const progress = 25;
  const progressValue = Math.min(100, Math.max(0, progress));

  const handleObjectiveClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", "edit");
    params.set("type", "objective");
    params.set("objectiveId", "objective-1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleExpanded = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      className="bg-sidebar/30 p-2 rounded-lg cursor-pointer"
      onClick={handleObjectiveClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleObjectiveClick();
        }
      }}
    >
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
        <div className="flex items-center ml-2">
          <div className="size-5 rounded-full bg-border overflow-hidden">
            <button
              className="h-full w-full rounded-full"
              style={{
                background: `conic-gradient(var(--primary) ${progressValue}%, transparent 0)`,
              }}
              onClick={(e) => e.stopPropagation()}
            ></button>
          </div>
          <p className="opacity-10 px-1.5 -mt-1 cursor-default hidden md:block">
            |
          </p>
          <button
            className="cursor-pointer hover:text-primary hidden md:block"
            onClick={(e) => e.stopPropagation()}
          >
            <Activity size={15} />
          </button>
          <p className="opacity-10 pl-1.5 -mt-1 cursor-default hidden md:block">
            |
          </p>
          <button
            className="cursor-pointer hover:text-primary hidden md:block"
            onClick={(e) => e.stopPropagation()}
          >
            <EllipsisVertical size={15} />
          </button>
        </div>
      </div>
      {isExpanded && (
        <div
          className="pl-2 pt-2 space-y-3"
          onClick={(event) => event.stopPropagation()}
        >
          <GoalCard goalId="goal-1" title="Run 10km without stopping" />
          <GoalCard goalId="goal-2" title="Read 12 books this year" />
        </div>
      )}
    </div>
  );
};

export default ObjectiveCard;
