"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Progress } from "../ui/progress";
import { Activity, EllipsisVertical } from "lucide-react";

interface GoalCardProps {
  goalId: string;
  title: string;
}

const GoalCard = ({ goalId, title }: GoalCardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleGoalClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", "edit");
    params.set("goalId", goalId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Card
      className="gap-2 py-3 cursor-pointer"
      onClick={(event) => {
        event.stopPropagation();
        handleGoalClick();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          handleGoalClick();
        }
      }}
    >
      <CardHeader className="px-3 flex items-center justify-between">
        <p className="text-[0.95rem] font-semibold">{title}</p>
        <div className="hidden md:flex items-center">
          <button
            type="button"
            className="cursor-pointer hover:text-primary"
            onClick={(event) => {
              event.stopPropagation();
            }}
            aria-label="Goal activity"
          >
            <Activity size={15} />
          </button>
          <p className="opacity-10 pl-1 -mt-1 cursor-default">|</p>
          <button
            type="button"
            className="cursor-pointer hover:text-primary"
            onClick={(event) => {
              event.stopPropagation();
            }}
            aria-label="Goal options"
          >
            <EllipsisVertical size={15} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-3">
        <Progress value={50} className="w-full h-1" />
      </CardContent>
      <CardFooter className="px-3 flex items-center justify-between">
        <p className="text-xs">Missed 2 non-negotiables in a row</p>
        <p className="text-xs">1/4 milestones</p>
      </CardFooter>
    </Card>
  );
};

export default GoalCard;
