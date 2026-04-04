import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Progress } from "../ui/progress";
import { Activity, EllipsisVertical } from "lucide-react";

const GoalCard = () => {
  return (
    <Card className="gap-2 py-3">
      <CardHeader className="px-3 flex items-center justify-between">
        <p className="text-[0.95rem] font-semibold">
          Lorem ipsum dolor sit amet.
        </p>
        <div className="flex items-center">
          <Activity size={15} className="cursor-pointer hover:text-primary" />
          <p className="opacity-10 pl-1 -mt-1 cursor-default">|</p>
          <EllipsisVertical
            size={15}
            className="cursor-pointer hover:text-primary"
          />
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
